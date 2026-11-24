// Modified from Herdr's shipped `changes` mod (Apache-2.0, github.com/herdrdev/herdr-app):
// the diff has syntax colors, taken from bat (see BAT below), and a right-click on a changed
// file opens a menu that hands it to one of git's difftools (see TOOLS below). A right-click
// on the panel's header opens the repo in VS Code or lazygit (see REPO below).

import { View, div } from "gpui-kit";
import { v_flex, h_flex, InputState, Input, Scrollbar, v_virtual_list } from "gpui-base";
import { spaces, panes, focused, exec, run, readTextFile, watchFolder, theme, settings, window, props, openOverlay, closeOverlay, nextCommand } from "herdr";

// The panels share data in one VM, but their host tasks belong to separate copies.
const scans = globalThis[Symbol.for("herdr.repoStatus.v2")] ??= new Map();

async function repoStatus(root, on, { after, visiting, urgent, allowInactive }, cx, current) {
  const repo = JSON.stringify([on, root]), now = Date.now();
  for (const [key, scan] of scans) {
    if (scan.pollAt <= now || (!scan.pollAt && scan.task.is_done())) scans.delete(key);
  }
  while (current()) {
    let scan = scans.get(repo);
    const pending = scan && !scan.pollAt && !scan.task.is_done();
    const reusable = scan?.status?.code === 0 && Date.now() < scan.pollAt
      && (scan.started >= after || (!urgent && Date.now() < scan.watchAt));
    if (!reusable && (!pending || (visiting && scan.started !== undefined && scan.started < after))) {
      if (!allowInactive && window()?.active === false) return null;
      const next = {};
      next.task = cx.spawn(async cx => {
        await cx.sleep(25); // Let both listeners for a watch batch join before starting Git.
        if (!allowInactive && window()?.active === false) return;
        next.started = Date.now();
        try {
          next.status = await exec("git", ["--no-optional-locks", "-c", "core.fsmonitor=false", "status", "--porcelain=v1", "-z", "--no-renames", "--untracked-files=all"], { cwd: root, on });
        } catch (error) {
          next.error = error;
        } finally {
          const finished = Date.now(), duration = finished - next.started;
          const delay = duration < 500 ? 0 : Math.min(60000, 5 * duration);
          next.watchAt = finished + delay;
          next.pollAt = finished + Math.max(10000, delay);
          if (next.status?.code !== 0 && scans.get(repo) === next) scans.delete(repo);
        }
      });
      scans.set(repo, next);
      scan = next;
    }
    // Resume through our own host task, so another copy's close cannot cancel our follow-up work.
    while (current() && !scan.pollAt && !scan.task.is_done()) await cx.sleep(50);
    if (!current()) return null;
    if (!scan.pollAt) continue; // The scanning copy closed or reloaded.
    return scan;
  }
  return null;
}

function location() {
  const space = spaces().find((s) => s.active), f = focused();
  const pane = f?.pane ? panes().find(p => p.pane === f.pane) : null;
  const on = f?.pane === null ? (f.terminal?.includes("/") ? f.terminal.split("/")[0] : null) : space?.machine ?? null;
  return { cwd: pane?.cwd || f?.cwd || space?.folder, on };
}
const key = () => JSON.stringify(location());
// Reads write nothing under .git (no index refresh or lock, no fsmonitor cookie):
// the folder watch would see it, and every refresh would start the next one.
const READ = ["--no-optional-locks", "-c", "core.fsmonitor=false", "-c", "diff.autoRefreshIndex=false"];
const countLines = (text) => text ? text.split("\n").length - Number(text.endsWith("\n")) : 0;
const wideGlyph = /[\p{Ideographic}\p{Emoji_Presentation}\p{Extended_Pictographic}\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\ufe10-\ufe19\ufe30-\ufe6f\uff01-\uff60\uffe0-\uffe6]/gu;

// Keep room for spacing marks and give wide glyphs at least two columns.
function displayColumns(text) {
  let columns = text.length;
  for (const glyph of text.match(wideGlyph) ?? []) {
    if (glyph.length === 1) columns++;
  }
  return columns;
}

// The diff was laid out for 11px text: 20px rows, 7px characters.
const rowHeight = size => Math.ceil(size * 1.8), charWidth = size => size * 0.64;

// Text draws a tab as nothing: pad each to the next 4-column stop.
const untab = (text) => text.replace(/[^\t]*\t/g, (s) => s.slice(0, -1).padEnd((s.length - 1) - (s.length - 1) % 4 + 4));

// Numbers each diff line once, so a frame only draws the rows on screen.
function diffRows(lines) {
  let old = 0, next = 0;
  return lines.map((line) => {
    const match = /^@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(line);
    if (match) { old = +match[1]; next = +match[2]; return { kind: "@", text: line }; }
    const kind = line[0];
    if (kind === "-") return { kind, number: old++, text: untab(line.slice(1)) || " " };
    if (kind === "+") return { kind, number: next++, text: untab(line.slice(1)) || " " };
    if (kind === " ") { old++; return { kind, number: next++, text: untab(line.slice(1)) || " " }; }
    return { kind: "", text: line };
  });
}

// Syntax colors come from bat, with the person's own bat config (theme "ansi", italics).
// Only the style is set here, because the panel draws its own line numbers, and tabs, to
// match untab() above. The "ansi" theme uses the terminal's 16 colors: the theme's ansi0..15.
const BAT = ["--color=always", "--paging=never", "--style=plain", "--tabs=4"];
// A change further apart than this in its file stays plain: bat would print all between.
// So does a file bat needs longer for (minified, huge): the diff waits for its colors.
const BAT_SPAN = 20000, BAT_MS = 3000;

// One line of bat's output as runs of { text, color, bold, italic }: color is 0..15 (ansiN),
// "#rrggbb", or null for the foreground. Neighbours of one style are one run.
function sgrRuns(line) {
  const runs = [];
  let color = null, bold = false, italic = false, last = 0;
  const push = (text) => {
    const prev = runs[runs.length - 1];
    if (!text) return;
    if (prev && prev.color === color && prev.bold === bold && prev.italic === italic) prev.text += text;
    else runs.push({ text, color, bold, italic });
  };
  for (const match of line.matchAll(/\x1b\[([0-9;]*)m/g)) {
    push(line.slice(last, match.index));
    last = match.index + match[0].length;
    const codes = match[1].split(";").map(Number);
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      if (code === 0) { color = null; bold = italic = false; }
      else if (code === 1) bold = true;
      else if (code === 3) italic = true;
      else if (code === 22) bold = false;
      else if (code === 23) italic = false;
      else if (code >= 30 && code <= 37) color = code - 30;
      else if (code >= 90 && code <= 97) color = code - 82;
      else if (code === 39) color = null;
      else if (code === 38 && codes[i + 1] === 5) { color = codes[i + 2] < 16 ? codes[i + 2] : null; i += 2; }
      else if (code === 38 && codes[i + 1] === 2) { color = "#" + codes.slice(i + 2, i + 5).map((n) => n.toString(16).padStart(2, "0")).join(""); i += 4; }
    }
  }
  push(line.slice(last));
  return runs;
}

// Lines first..last of one side of a file, highlighted: the file as it is now, or (`rev`:
// "HEAD", or "" for the index) as git has it. bat reads from the top to color them right.
async function batLines(root, on, path, rev, first, last) {
  const args = [...BAT, "-r", `${first}:${last}`];
  const r = rev === null
    ? await exec("bat", [...args, "--", `${root}/${path}`], { on, timeout: BAT_MS })
    : await exec("sh", ["-c", 'rev=$1; f=$2; shift 2; git show "$rev:$f" | bat "$@" --file-name="$f"', "sh", rev, path, ...args], { cwd: root, on, timeout: BAT_MS });
  return r.code === 0 ? r.stdout.split("\n").map(sgrRuns) : null;
}

// git's difftools, as ~/.gitconfig defines them. A target is { root, on, path, fresh }
// (`fresh`: git has no version to compare with, so it is compared with nothing).
// bc and vscode open a window and wait for it: they are started in the background, on this
// computer only. difft and exiftool print to a pager: they get a tab.
const TOOLS = [["bc", "Beyond Compare"], ["vscode", "Visual Studio Code"], ["difft", "Difftastic"], ["exiftool", "ExifTool"]];
const windowed = (tool) => tool === "bc" || tool === "vscode";
function difftool(tool, t) {
  const args = ["difftool", "-y", "-t", tool, ...(t.fresh ? ["--no-index", "--", "/dev/null", t.path] : ["HEAD", "--", t.path])];
  if (windowed(tool)) exec("sh", ["-c", 'git "$@" >/dev/null 2>&1 &', "sh", ...args], { cwd: t.root }).catch((e) => console.log(`home-changes: ${e}`));
  else run("tab.new", { name: `${tool} ${t.path.split("/").pop()}`, folder: t.root, argv: ["git", ...args] });
}
// The header's menu hands the whole repo to another program: a target without a path.
// ponytail: VS Code is on this computer only; lazygit gets a tab on the space's machine.
const REPO = [["code", "Open in Visual Studio Code"], ["lazygit", "Open in Lazygit"]];
function openRepo(app, t) {
  if (app === "code") exec("code", [t.root]).catch((e) => console.log(`home-changes: ${e}`));
  else run("terminal.open", { argv: ["lazygit"], folder: t.root, name: "lazygit" });
}
// A menu's [id, label] rows, and what choosing one does.
const menuItems = (t) => t.path === undefined
  ? REPO.filter(([app]) => !t.on || app !== "code")
  : TOOLS.filter(([tool]) => !t.on || !windowed(tool)).map(([tool, label]) => [tool, `Difftool: ${label}`]);
const choose = (id, t) => t.path === undefined ? openRepo(id, t) : difftool(id, t);
// The menu is this mod again, opened as a popup with props().role === "menu".
const openMenu = (target) => openOverlay({ mod: "home-changes", kind: "popup", width: 230, height: 10 + 31 * menuItems(target).length, props: { role: "menu", target } });

export default class Changes extends View {
  init(_props, cx) {
    this.role = props()?.role ?? "panel";
    if (this.role === "menu") { this.at = 0; this.handle = cx.focus_handle(); this.handle.focus(); return; }
    // `herdr-app do 'home-changes.<menu | bc | vscode | difft | exiftool>:<path>'` does what a file's
    // menu would, and `home-changes.<repo-menu | code | lazygit>` what the header's would.
    cx.spawn(async () => {
      for (;;) {
        const command = await nextCommand(), at = command.indexOf(":"), id = at < 0 ? command : command.slice(0, at);
        const file = at < 0 ? null : this.files.find((f) => f.path === command.slice(at + 1));
        const target = file ? this.target(file) : at < 0 && this.root ? this.repo() : null;
        if (!target) continue;
        if (id === "menu" || id === "repo-menu") openMenu(target);
        else if (menuItems(target).some(([item]) => item === id)) choose(id, target);
      }
    });
    this.files = []; this.rows = []; this.longest = 0; this.gutterChars = 4; this.message = ""; this.handle = cx.focus_handle();
    this.input = InputState.new({ placeholder: "Commit message" });
    this.input.on("change", (_e, cx) => {
      const hadMessage = Boolean(this.message.trim());
      this.message = this.input.value();
      if (hadMessage !== Boolean(this.message.trim())) cx.notify();
    });
    this.input.on("submit", (_e, cx) => this.commit(cx));
    this.input.on("focus", (_e, cx) => { this.typing = true; cx.notify(); });
    this.input.on("blur", (_e, cx) => { this.typing = false; cx.notify(); });
    this.refresh(cx);
    cx.timer.every(500, cx => this.refreshIfDue(cx));
  }

  refreshIfDue(cx) {
    const active = window()?.active !== false, context = this.context;
    const refocused = active && this.windowActive === false;
    this.windowActive = active;
    if (!context) return;
    if (refocused && (context.dirtyAt || !context.watch)) context.catchUp = true;
    if (!active || this.loading || this.busy) return;
    const now = Date.now();
    if (context.catchUp || (context.dirtyAt && now >= context.watchAt) || now >= context.pollAt) this.refresh(cx);
  }

  watch(root, context, cx) {
    if (context.on || context.watch?.root === root) return;
    context.watch?.pending?.cancel();
    const watch = { root };
    context.watch = watch;
    cx.spawn(async cx => {
      try {
        while (this.context === context && context.watch === watch) {
          watch.pending = watchFolder(root);
          const paths = await watch.pending;
          if (paths.length && context.watch === watch && this.current(context)) {
            context.dirtyAt = Date.now() + 1;
            this.refreshIfDue(cx);
          }
        }
      } catch {
        if (context.watch === watch) context.watch = null;
      }
    });
  }

  // One visit to a folder: results from an earlier visit to the same folder are stale too.
  current(context) {
    return this.context === context && key() === context.key;
  }

  refresh(cx, force = false) {
    const { cwd, on } = location(), next = key();
    const visiting = next !== this.context?.key;
    if (visiting) {
      this.context?.watch?.pending?.cancel();
      this.context = { key: next, on, dirtyAt: 0 }; this.root = null; this.files = []; this.open = null;
      this.setLines([]); this.message = ""; this.input.set_value(""); this.error = null; this.note = null; this.closed = false; this.limited = false;
      this.loading = false;
    }
    // A load left behind in another folder (a slow git, a read that never ends) must not hold this one.
    const context = this.context;
    const now = Date.now();
    if (!cwd) {
      context.catchUp = false;
      context.dirtyAt = 0;
      context.pollAt = now + 10000;
      return;
    }
    if (this.loading || this.busy) return;
    if (force || (context.catchUp && !context.dirtyAt)) context.dirtyAt = now + 1;
    const request = {
      after: visiting ? now + 1 : context.dirtyAt || (context.lastStatus ?? -1) + 1,
      visiting,
      urgent: force || visiting || context.catchUp,
      allowInactive: force || visiting,
    };
    context.catchUp = false;
    context.pollAt = context.watchAt = now + 10000;
    this.loading = true;
    cx.spawn(async (cx) => {
      try {
        const top = await exec("git", ["rev-parse", "--show-toplevel"], { cwd, on });
        if (!this.current(context)) return;
        if (top.code !== 0) { this.root = null; this.files = []; this.setLines([]); this.open = null; this.error = "Not a git repository"; return; }
        const root = top.stdout.trim(), git = (args) => exec("git", [...READ, ...args], { cwd: root, on });
        this.watch(root, context, cx);
        const scan = await repoStatus(root, on, request, cx, () => this.context === context);
        if (!scan || !this.current(context)) return;
        const { status, started, pollAt, watchAt } = scan;
        context.lastStatus = started;
        context.pollAt = pollAt;
        context.watchAt = watchAt;
        // A failed scan still answers the edit that asked for it: retrying at once would spin.
        if (context.dirtyAt <= started) context.dirtyAt = 0;
        if (scan.error) throw scan.error;
        if (status.code !== 0) throw new Error(status.stderr);
        if (request.urgent && request.after > started) context.catchUp = true;
        const entries = status.stdout.split("\0").filter(Boolean), shown = entries.slice(0, 1000);
        const tracked = shown.some(entry => !entry.startsWith("??"));
        const hasHead = tracked && (await git(["rev-parse", "--verify", "HEAD"])).code === 0;
        const stats = {};
        const results = !tracked ? [] : hasHead ? [await git(["diff", "HEAD", "--numstat", "-z", "--no-renames"])] : [await git(["diff", "--cached", "--numstat", "-z", "--no-renames"]), await git(["diff", "--numstat", "-z", "--no-renames"])];
        for (const result of results) {
          if (result.code !== 0) throw new Error(result.stderr);
          for (const entry of result.stdout.split("\0")) {
            const [a, d, ...parts] = entry.split("\t");
            if (!parts.length) continue;
            const path = parts.join("\t"), old = stats[path] ?? { add: 0, del: 0 };
            stats[path] = { add: old.add + (Number(a) || 0), del: old.del + (Number(d) || 0), binary: a === "-" };
          }
        }
        const files = [];
        for (const entry of shown) {
          const xy = entry.slice(0, 2), path = entry.slice(3), fresh = xy === "??";
          const conflict = xy.includes("U") || xy === "AA" || xy === "DD";
          const s = conflict ? "U" : xy.includes("D") ? "D" : fresh || xy.includes("A") ? "A" : "M";
          const stat = stats[path] ?? { add: 0, del: 0 };
          files.push({ path, status: s, fresh, ...stat });
        }
        if (!this.current(context)) return;
        this.root = root; this.on = on; this.hasHead = hasHead; this.files = files; this.limited = entries.length > 1000; this.error = null;
        if (this.open && !files.some((f) => f.path === this.open)) { this.open = null; this.setLines([]); }
        // The first file's diff shows until you pick another.
        if (!this.open && !this.closed && files.length) this.open = files[0].path;
        if (this.open) {
          try { await this.load(this.open, context); }
          catch { if (this.current(context)) this.setLines(["Cannot preview this diff (too large or unreadable)"]); }
        }
      } catch (e) { if (this.current(context)) this.error = String(e); }
      finally {
        if (this.context === context) this.loading = false;
        cx.notify();
      }
    });
  }

  repo() {
    return { root: this.root, on: this.on ?? null };
  }

  target(file) {
    return { root: this.root, on: this.on ?? null, path: file.path, fresh: file.fresh || !this.hasHead };
  }

  // The diff's lines highlighted, per side ("+": the file now, "-": git's version), as
  // { first, lines }. Kept until the file or its diff changes: the panel reloads the open
  // diff on every refresh, and bat should run once per diff, not every ten seconds.
  async colors(file, lines) {
    const text = lines.join("\n");
    if (this.colored?.path === file.path && this.colored.text === text) return this.colored.sides;
    const rows = diffRows(lines), sides = {}, root = this.root, on = this.on;
    for (const side of ["+", "-"]) {
      const numbers = rows.filter((row) => row.number !== undefined && (row.kind === "-") === (side === "-")).map((row) => row.number);
      const first = Math.min(...numbers), last = Math.max(...numbers);
      if (!numbers.length || last - first > BAT_SPAN) continue;
      const rev = side === "+" ? null : this.hasHead ? "HEAD" : "";
      // ponytail: no bat (or none on the space's machine) leaves the diff plain.
      sides[side] = { first, lines: await batLines(root, on, file.path, rev, first, last).catch(() => null) };
    }
    this.colored = { path: file.path, text, sides };
    return sides;
  }

  async load(path, context) {
    const file = this.files.find((f) => f.path === path), root = this.root, on = this.on;
    if (!file) return;
    let lines;
    if (file.fresh || (!this.hasHead && file.status === "A")) {
      const text = await readTextFile(`${root}/${path}`, { on }).catch(() => null);
      if (text === null) lines = ["Cannot preview this file (binary, too large, or unreadable)"];
      else if (text.includes("\0")) lines = ["Binary file · no text diff"];
      else {
        file.add = countLines(text);
        lines = [`@@ -0,0 +1,${file.add} @@`, ...text.slice(0, 400000).replace(/\n$/, "").split("\n").slice(0, 1500).map(l => `+${l}`)];
      }
    } else {
      const r = await exec("git", [...READ, "diff", ...(this.hasHead ? ["HEAD"] : []), "--no-ext-diff", "--no-textconv", "--no-color", "--", path], { cwd: root, on });
      if (r.code !== 0) throw new Error(r.stderr);
      const all = r.stdout.replace(/\n$/, "").split("\n"), first = all.findIndex((l) => l.startsWith("@@"));
      lines = first < 0 ? [file.binary ? "Binary file changed" : "No text diff available"] : all.slice(first);
    }
    lines = lines.slice(0, 1500).map(line => line.length > 4000 ? line.slice(0, 4000) + "… (line truncated)" : line);
    const sides = await this.colors(file, lines);
    if (this.current(context) && this.open === path) this.setLines(lines, sides);
  }

  setLines(lines, sides = {}) {
    this.rows = diffRows(lines);
    // A row is colored only if bat's line is exactly its text (not a cut line, not a file changed since).
    for (const row of this.rows) {
      const side = sides[row.kind === "-" ? "-" : "+"];
      const runs = row.number === undefined ? null : side?.lines?.[row.number - side.first];
      if (runs?.length && runs.map((r) => r.text).join("") === row.text) row.runs = runs;
    }
    this.longest = Math.max(0, ...this.rows.map(row => displayColumns(row.text)));
    this.gutterChars = Math.max(4, String(Math.max(0, ...this.rows.map(row => row.number ?? 0))).length);
  }

  pick(path, cx) {
    this.open = this.open === path ? null : path; this.setLines([]); this.note = null;
    this.closed = !this.open;
    const context = this.context;
    if (this.open) cx.spawn(async (cx) => {
      try { await this.load(path, context); }
      catch (e) { if (this.current(context) && this.open === path) this.note = `Cannot preview this diff (too large or unreadable): ${e}`; }
      cx.notify();
    });
    cx.notify();
  }

  commit(cx) {
    if (!this.message.trim() || !this.root || this.busy || this.loading || this.context?.key !== key()) return;
    const root = this.root, on = this.on, context = this.context, message = this.message.trim();
    this.busy = true; this.note = null;
    cx.spawn(async (cx) => {
      try {
        for (const args of [["add", "-A"], ["commit", "-m", message]]) {
          const r = await exec("git", args, { cwd: root, on });
          if (r.code !== 0) throw new Error((r.stderr || r.stdout).trim());
        }
        if (this.current(context)) { this.message = ""; this.input.set_value(""); }
      } catch (e) { if (this.current(context)) this.note = `Commit failed: ${e}`; }
      finally { this.busy = false; this.refresh(cx, true); cx.notify(); }
    });
    cx.notify();
  }

  gutter(size) { return Math.ceil(this.gutterChars * charWidth(size)) + 2; }

  diffRow({ kind, number, text, runs }, t, size) {
    const height = rowHeight(size);
    if (kind === "@") return div().w_full().px(12).h(height).flex_none().truncate().bg(t.raised).text_color(t.dim).child(text);
    return h_flex().w_full().h(height).flex_none().gap(10).when(kind === "+", (e) => e.bg(t.ansi2 + "18")).when(kind === "-", (e) => e.bg(t.ansi1 + "18"))
      .child(div().w(this.gutter(size)).flex_none().text_right().text_color(t.dim).child(number === undefined ? "" : String(number)))
      .child(runs
        ? h_flex().flex_1().min_w(0).overflow_hidden().whitespace_nowrap().children(runs.map((r) => div().flex_none()
          .when(r.color !== null, (e) => e.text_color(typeof r.color === "number" ? t[`ansi${r.color}`] : r.color))
          .when(r.bold, (e) => e.font_bold()).when(r.italic, (e) => e.italic()).child(r.text)))
        : div().flex_1().min_w(0).truncate().child(text));
  }

  renderMenu() {
    const t = theme(), { target, overlay } = props(), list = menuItems(target);
    const pick = (id) => { closeOverlay(overlay); choose(id, target); };
    return v_flex().id("changes-menu").track_focus(this.handle).w_full().min_h(0).p(5).bg(t.popover).text_color(t.foreground).text_size(12.8)
      .on_key_down((e, cx) => {
        if (e.key === "down") this.at = (this.at + 1) % list.length;
        else if (e.key === "up") this.at = (this.at + list.length - 1) % list.length;
        else if (e.key === "enter") pick(list[this.at][0]);
        else if (e.key === "escape") closeOverlay(overlay);
        else return;
        cx.notify();
      })
      .children(list.map(([id, label], i) => h_flex().id(`mi-${id}`).h(31).flex_none().px(8).rounded(7).items_center().cursor_pointer()
        .when(i === this.at, (el) => el.bg(t.selected)).hover((s) => s.bg(t.hover))
        .on_click(() => pick(id)).child(label)));
  }

  render(cx) {
    if (this.role === "menu") return this.renderMenu();
    if (key() !== this.context?.key) this.refresh(cx);
    else this.refreshIfDue(cx);
    const t = theme(), size = settings().font_size, add = this.files.reduce((n, f) => n + f.add, 0), del = this.files.reduce((n, f) => n + f.del, 0);
    const enabled = Boolean(this.message.trim() && this.root && !this.busy && !this.loading);
    return v_flex().id("changes").size_full().min_h(0).rounded(10).overflow_hidden().bg(t.background).border_1().border_color(t.border).text_color(t.foreground).text_size(13).track_focus(this.handle)
      .on_key_down((e, cx) => {
        if (e.key === "escape" && this.typing) { this.typing = false; this.handle.focus(); cx.stop_propagation(); cx.notify(); }
      })
      .child(h_flex().id("changes-header").h(42).flex_none().px(14).gap(8).items_center().border_b(1).border_color(t.border)
        .on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); if (this.root) openMenu(this.repo()); })
        .child(div().font_semibold().child("Changes"))
        .child(div().px(5).py(1).rounded(4).border_1().border_color(t.border).text_size(10).text_color(t.muted).child(`${this.files.length} files`))
        .child(div().flex_1()).child(div().text_size(11).text_color(t.ansi2).child(`+${add}`)).child(div().text_size(11).text_color(t.ansi1).child(`−${del}`)))
      // overflow_y_scrollbar() wraps the list, so its flex sizing never reached the panel's layout.
      .child(div().flex_1().min_h(44).max_h(this.files.length * 28 + 12).relative().border_b(1).border_color(t.border)
        .child(v_flex().id("changes-list").absolute().inset_0().overflow_y_scroll().p(6).children(this.files.map((f) => {
        const parts = f.path.split("/"), name = parts.pop();
        return h_flex().id(`change-${f.path}`).h(28).flex_none().px(8).gap(8).items_center().rounded(7).cursor_pointer().when(this.open === f.path, (e) => e.bg(t.selected)).hover((s) => s.bg(t.hover)).on_click((_e, cx) => this.pick(f.path, cx))
          .on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); openMenu(this.target(f)); })
          .child(div().w(14).text_size(11).text_color(f.status === "A" ? t.ansi2 : f.status === "D" ? t.ansi1 : f.status === "U" ? t.ansi1 : t.blocked).child(f.status))
          .child(h_flex().flex_1().min_w(0).child(div().text_color(t.dim).truncate().child(parts.length ? parts.join("/") + "/" : "")).child(div().max_w(260).min_w(0).truncate().child(name)))
          .when(f.add > 0, (e) => e.child(div().text_size(11).text_color(t.ansi2).child(`+${f.add}`))).when(f.del > 0, (e) => e.child(div().text_size(11).text_color(t.ansi1).child(`−${f.del}`)));
      })).when(!this.files.length, (e) => e.child(div().p(8).text_color(t.dim).child(this.error || (this.loading ? "Loading changes…" : this.root ? "No uncommitted changes" : "No folder")))))
        .child(Scrollbar.vertical("changes-list").absolute().inset_0()))
      .when(this.limited, el => el.child(div().px(12).py(4).text_size(11).text_color(t.dim).child("Showing the first 1,000 changed files")))
      .child(div().flex_1().min_h(0).relative().font_family(settings().font_family ?? "JetBrains Mono").text_size(size)
        .child(div().id("changes-diff-x").size_full().overflow_x_scrollbar()
          .child(div().w_full().min_w(Math.max(300, this.longest * charWidth(size) + this.gutter(size) + 20)).h_full().child(v_virtual_list("changes-diff", this.rows.length, rowHeight(size), (i) => String(i),
            (range) => this.rows.slice(range.start, range.end).map((row) => this.diffRow(row, t, size))).size_full())))
        .child(Scrollbar.vertical("changes-diff").viewport_from_layout().absolute().inset_0())
        .when(!this.open && this.files.length > 0, (e) => e.child(div().absolute().top(6).px(12).text_size(11).text_color(t.dim).child("Select a file to view its changes"))))
      .when(Boolean(this.note), (e) => e.child(div().px(10).pb(8).text_size(11).text_color(t.ansi1).child(this.note)))
      .child(h_flex().flex_none().p(10).gap(8).border_t(1).border_color(t.border)
        .child(div().id("commit-message").flex_1().min_w(0).h(32).px(10).flex().items_center().rounded(8).border_1().border_color(this.typing ? t.accent : t.border).cursor_text().on_mouse_down("left", (_e, cx) => cx.stop_propagation()).child(Input.new(this.input).h_full().text_size(12).text_color(t.foreground)))
        .child(div().id("commit").h(32).px(14).flex().items_center().rounded(8).bg(enabled ? t.solid : t.raised).text_color(enabled ? t.solid_foreground : t.dim).text_size(12).when(enabled, (e) => e.cursor_pointer()).on_click((_e, cx) => this.commit(cx)).child(this.busy ? "Committing…" : "Commit")));
  }
}
