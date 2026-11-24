// Modified from Herdr's shipped `files` mod (Apache-2.0, github.com/herdrdev/herdr-app):
// the preview's syntax colors come from bat (see BAT below) instead of Herdr's editor, and a
// right-click opens a menu: Neovim in a split or a tab, VS Code, Finder, copy the path. See
// ACTIONS below.

// A lazy file browser for the focused pane's folder, with bounded read-only previews.
import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex, Scrollbar, v_virtual_list } from "gpui-base";
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
  const space = spaces().find(s => s.active), f = focused();
  const pane = f?.pane ? panes().find(p => p.pane === f.pane) : null;
  const on = f?.pane === null ? (f.terminal?.includes("/") ? f.terminal.split("/")[0] : null) : space?.machine ?? null;
  return { cwd: pane?.cwd || f?.cwd || space?.folder, on, space: space?.id };
}
const key = () => JSON.stringify(location());

// The preview is drawn as home-changes draws its diff: rows of 1.8 × the font size, tabs
// padded to 4-column stops, and colors from bat with the person's own bat config (theme
// "ansi", italics). Only the style is set here, because the panel draws its own line
// numbers, and tabs, to match untab(). The "ansi" theme uses the terminal's 16 colors: the
// theme's ansi0..15. A file bat needs longer than BAT_MS for stays plain.
const BAT = ["--color=always", "--paging=never", "--style=plain", "--tabs=4"], BAT_MS = 3000;
const wideGlyph = /[\p{Ideographic}\p{Emoji_Presentation}\p{Extended_Pictographic}\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\ufe10-\ufe19\ufe30-\ufe6f\uff01-\uff60\uffe0-\uffe6]/gu;

// Keep room for spacing marks and give wide glyphs at least two columns.
function displayColumns(text) {
  let columns = text.length;
  for (const glyph of text.match(wideGlyph) ?? []) {
    if (glyph.length === 1) columns++;
  }
  return columns;
}

const rowHeight = size => Math.ceil(size * 1.8), charWidth = size => size * 0.64;

// Text draws a tab as nothing: pad each to the next 4-column stop.
const untab = (text) => text.replace(/[^\t]*\t/g, (s) => s.slice(0, -1).padEnd((s.length - 1) - (s.length - 1) % 4 + 4));

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

// What the menu does with a target { root, on, path, dir }: `path` is relative
// to `root`, the panel's folder; `on` is the space's machine (null: this computer).
const full = (t) => `${t.root}/${t.path}`;
const mac = () => window()?.platform === "macos";
const nvim = (t, place) => run("terminal.open", { argv: ["nvim", full(t)], folder: t.root, place, name: t.path.split("/").pop() });
// VS Code opens the folder, or goes to the window that has it, and the file in it.
// ponytail: a remote space, or `code` not starting, gets an nvim tab instead.
async function code(t) {
  if (!t.on) try { if ((await exec("code", [t.root, full(t)])).code === 0) return; } catch {}
  nvim(t, "tab");
}
const ACTIONS = {
  nvim: (t) => nvim(t, "right"),
  "nvim-tab": (t) => nvim(t, "tab"),
  code,
  finder: (t) => exec(...(mac() ? ["open", ["-R", full(t)]] : ["xdg-open", [t.dir ? full(t) : full(t).replace(/\/[^/]*$/, "")]])).catch((e) => console.log(`home-files: ${e}`)),
  "copy-rel": (t, cx) => cx.write_to_clipboard(t.path),
  "copy-full": (t, cx) => cx.write_to_clipboard(full(t)),
};
// The menu's groups of [action, label]. Apps on this computer can't open a remote path.
const menuGroups = (t) => [
  t.dir ? [] : [["nvim", "Open in Neovim (split)"], ["nvim-tab", "Open in Neovim (tab)"]],
  t.on ? [] : [...(t.dir ? [] : [["code", "Open in Visual Studio Code"]]), ["finder", mac() ? "Show in Finder" : "Show in file manager"]],
  [["copy-rel", "Copy relative path"], ["copy-full", "Copy absolute path"]],
].filter((group) => group.length);
// The menu is this mod again, opened as a popup with props().role === "menu".
function openMenu(target) {
  const groups = menuGroups(target);
  openOverlay({ mod: "home-files", kind: "popup", width: 230, height: 10 + 31 * groups.flat().length + 9 * (groups.length - 1), props: { role: "menu", target } });
}
const PER_FOLDER = 500, TOTAL = 5000;

async function directory(path, on) {
  const windowsDirectory = async () => {
    // Windows PowerShell otherwise uses the console code page; exec decodes UTF-8.
    // Links keep directory attributes even when dangling; check their target.
    // Other reparse points (OneDrive's folders) have no LinkType and are folders.
    // PowerShell reads curly single quotes as quotes too, so they're doubled like '.
    const r = await exec("powershell", ["-NoProfile", "-Command", "[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false); & { param($p) @(Get-ChildItem -LiteralPath $p -Force -ErrorAction Stop | Where-Object Name -ne '.git' | Select-Object -First 501 | ForEach-Object { @{ name=$_.Name; dir=($_.PSIsContainer -and (-not ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -or -not $_.LinkType -or ($_.Target -and [IO.Directory]::Exists(([IO.Path]::Combine([IO.Path]::GetDirectoryName($_.FullName), $_.Target[0])))))) } }) | ConvertTo-Json -Compress } '" + path.replace(/['‘’‚‛]/g, "$&$&") + "'"], { on });
    if (r.code !== 0) throw new Error(r.stderr || "Cannot list this folder");
    const result = JSON.parse(r.stdout || "[]");
    return Array.isArray(result) ? result : [result];
  };
  if (!on && window()?.platform === "windows") return windowsDirectory();
  const script = 'n=0; for p in "$1"/* "$1"/.[!.]* "$1"/..?*; do [ -e "$p" ] || [ -L "$p" ] || continue; name=${p##*/}; [ "$name" = .git ] && continue; if [ -d "$p" ]; then kind=d; else kind=f; fi; printf "%s\\0%s\\0" "$kind" "$name"; n=$((n+1)); [ "$n" -gt 500 ] && break; done; test -d "$1"';
  let r;
  try { r = await exec("sh", ["-c", script, "files", path], { on }); }
  catch (e) {
    if (on && String(e).includes("cannot start sh: program not found")) return windowsDirectory();
    throw e;
  }
  if (r.code !== 0) throw new Error(r.stderr || "Cannot list this folder");
  const fields = r.stdout.split("\0"), out = [];
  for (let i = 0; i + 1 < fields.length; i += 2) out.push({ name: fields[i + 1], dir: fields[i] === "d" });
  return out;
}

export default class Files extends View {
  init(_props, cx) {
    this.role = props()?.role ?? "panel";
    if (this.role === "menu") { this.at = 0; this.handle = cx.focus_handle(); this.handle.focus(); return; }
    this.saved = new Map();
    this.entries = new Map(); this.folders = new Set(); this.pending = new Set(); this.marks = {};
    this.refresh(cx);
    cx.timer.every(500, cx => this.refreshIfDue(cx));
    // `herdr-app do 'home-files.<show | menu | action>:<path>'` does what a click or the menu would (a folder ends in "/").
    cx.spawn(async (cx) => {
      for (;;) {
        const command = await nextCommand(), at = command.indexOf(":"), path = command.slice(at + 1);
        const target = this.target(path.replace(/\/$/, ""), path.endsWith("/"));
        if (command.startsWith("show:")) this.show(path, cx);
        else if (command.startsWith("menu:")) openMenu(target);
        else ACTIONS[command.slice(0, at)]?.(target, cx);
      }
    });
  }

  target(path, dir) {
    return { root: this.root, on: this.on ?? null, path, dir };
  }

  refreshIfDue(cx) {
    const active = window()?.active !== false, context = this.context;
    const refocused = active && this.windowActive === false;
    this.windowActive = active;
    if (!context) return;
    if (refocused && (context.dirtyAt || !context.watch)) context.catchUp = true;
    if (!active || this.loading) return;
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

  current(context) {
    return this.context === context && key() === context.key;
  }

  async loadFolder(path, context) {
    const { on, cwd: root } = context;
    const entries = await directory(path ? `${root}/${path}` : root, on);
    if (!this.current(context) || (path && !this.folders.has(path))) return;
    const used = [...this.entries.entries()].filter(([p]) => p !== path).reduce((n, [, e]) => n + e.length, 0);
    this.entries.set(path, entries.slice(0, Math.max(0, Math.min(PER_FOLDER, TOTAL - used))).sort((a, b) => Number(b.dir) - Number(a.dir) || a.name.localeCompare(b.name)));
    if (entries.length > PER_FOLDER || used + entries.length > TOTAL) this.limited = true;
  }

  refresh(cx) {
    const { cwd, on } = location(), next = key();
    const visiting = next !== this.context?.key;
    if (visiting) {
      if (this.context) {
        this.saved.set(this.context.key, { folders: this.folders, file: this.file });
        this.context.watch?.pending?.cancel();
      }
      const saved = this.saved.get(next);
      this.context = { key: next, cwd, on, dirtyAt: 0 }; this.root = cwd; this.on = on; this.entries = new Map(); this.folders = new Set(saved?.folders);
      this.pending = new Set(); this.marks = {}; this.show(null); this.error = null; this.limited = false;
      this.loading = false;
      if (saved?.file) this.show(saved.file, cx);
    }
    const context = this.context;
    const now = Date.now();
    if (!cwd) {
      context.catchUp = false;
      context.dirtyAt = 0;
      context.pollAt = now + 10000;
      return;
    }
    if (this.loading) return;
    if (context.catchUp && !context.dirtyAt) context.dirtyAt = now + 1;
    const request = {
      after: visiting ? now + 1 : context.dirtyAt || (context.lastStatus ?? -1) + 1,
      visiting,
      urgent: visiting || context.catchUp,
      allowInactive: visiting,
    };
    context.catchUp = false;
    context.pollAt = context.watchAt = now + 10000;
    this.loading = true;
    this.limited = false;
    cx.spawn(async cx => {
      try {
        this.watch(cwd, context, cx);
        const dirtyAtListing = context.dirtyAt;
        for (const path of ["", ...this.folders]) {
          if (!this.current(context)) return;
          await this.loadFolder(path, context);
        }
        const top = await exec("git", ["rev-parse", "--show-toplevel"], { cwd, on }).catch(() => null);
        if (!this.current(context)) return;
        const marks = {};
        let covered = dirtyAtListing;
        if (top?.code === 0) {
          const root = top.stdout.trim();
          const scan = await repoStatus(root, on, request, cx, () => this.context === context);
          if (!scan || !this.current(context)) return;
          const { status, started, pollAt, watchAt } = scan;
          context.lastStatus = started;
          context.pollAt = pollAt;
          context.watchAt = watchAt;
          covered = Math.min(dirtyAtListing, started);
          if (request.urgent && request.after > started) context.catchUp = true;
          if (status?.code === 0) for (const entry of status.stdout.split("\0").filter(Boolean).slice(0, TOTAL)) {
            const xy = entry.slice(0, 2);
            marks[`${root}/${entry.slice(3)}`] = xy === "??" || xy.includes("A") ? "A" : xy.includes("U") ? "U" : xy.includes("D") ? "D" : "M";
          }
        } else {
          context.watchAt = Date.now();
        }
        if (!this.current(context)) return;
        if (context.dirtyAt <= covered) context.dirtyAt = 0;
        this.marks = marks; this.error = null;
      } catch (e) { if (this.current(context)) this.error = String(e); }
      finally {
        if (this.context === context) this.loading = false;
        cx.notify();
      }
    });
  }

  toggle(path, cx) {
    if (this.folders.has(path)) {
      for (const folder of [...this.folders]) if (folder === path || folder.startsWith(path + "/")) {
        this.folders.delete(folder);
        this.entries.delete(folder);
      }
    } else {
      this.folders.add(path);
      if (!this.entries.has(path) && !this.pending.has(path)) {
        const context = this.context;
        this.pending.add(path);
        cx.spawn(async cx => {
          try { await this.loadFolder(path, context); }
          catch (e) { if (this.current(context)) this.error = String(e); }
          finally { if (this.context === context) this.pending.delete(path); cx.notify(); }
        });
      }
    }
    cx.notify();
  }

  // The file's lines as { text, runs }: `runs` where bat's line is exactly the text (not a
  // cut line, not a file changed in between), else the line is drawn plain.
  show(path, cx) {
    this.file = path; this.lines = []; this.longest = 0; this.fileError = null;
    if (!path || !cx) return;
    const context = this.context, root = this.root, on = this.on;
    cx.spawn(async cx => {
      try {
        const text = await readTextFile(`${root}/${path}`, { on });
        if (this.file !== path || !this.current(context)) return;
        if (text === null) { this.fileError = "This file is no longer available"; return; }
        if (text.includes("\0")) { this.fileError = "Binary file · no text preview"; return; }
        const plain = text.slice(0, 400000).replace(/\n$/, "").split("\n");
        // ponytail: no bat (or none on the space's machine) leaves the preview plain.
        const colored = await exec("bat", [...BAT, "-r", `:${plain.length}`, "--", `${root}/${path}`], { on, timeout: BAT_MS })
          .then((r) => r.code === 0 ? r.stdout.split("\n").map(sgrRuns) : [], () => []);
        if (this.file !== path || !this.current(context)) return;
        this.lines = plain.map((line, i) => {
          const shown = untab(line.length > 4000 ? line.slice(0, 4000) + "… (line truncated)" : line) || " ", runs = colored[i];
          return { text: shown, runs: runs?.length && runs.map((r) => r.text).join("") === shown ? runs : null };
        });
        if (text.length > 400000) this.lines.push({ text: "… (file truncated)", runs: null });
        this.longest = this.lines.reduce((n, line) => Math.max(n, displayColumns(line.text)), 0);
      } catch { if (this.file === path && this.current(context)) this.fileError = "Cannot preview this file (binary, too large, or unreadable)"; }
      finally { cx.notify(); }
    });
  }

  codeRow({ text, runs }, number, gutter, t, size) {
    return h_flex().w_full().h(rowHeight(size)).flex_none().gap(10)
      .child(div().w(gutter).flex_none().text_right().text_color(t.dim).child(String(number)))
      .child(runs
        ? h_flex().flex_1().min_w(0).overflow_hidden().whitespace_nowrap().children(runs.map((r) => div().flex_none()
          .when(r.color !== null, (e) => e.text_color(typeof r.color === "number" ? t[`ansi${r.color}`] : r.color))
          .when(r.bold, (e) => e.font_bold()).when(r.italic, (e) => e.italic()).child(r.text)))
        : div().flex_1().min_w(0).truncate().child(text));
  }

  rows(prefix, depth, out, t) {
    if (out.length >= TOTAL || depth > 40) return out;
    for (const entry of this.entries.get(prefix) ?? []) {
      if (out.length >= TOTAL) break;
      const path = prefix ? `${prefix}/${entry.name}` : entry.name, open = this.folders.has(path), mark = this.marks[`${this.root}/${path}`];
      out.push(h_flex().id(`file-${path}`).h(28).flex_none().pl(8 + depth * 18).pr(8).gap(7).items_center().rounded(7).cursor_pointer().hover(s => s.bg(t.hover))
        .on_click((_e, cx) => entry.dir ? this.toggle(path, cx) : this.show(path, cx))
        .on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); openMenu(this.target(path, entry.dir)); })
        .child(entry.dir ? svg(`mods/files/chevron-${open ? "down" : "right"}.svg`).size(12).flex_none().text_color(t.dim) : div().w(12).flex_none())
        .child(svg(`mods/files/${entry.dir ? "folder" : "file"}.svg`).size(14).flex_none().text_color(t.muted))
        .child(div().flex_1().min_w(0).truncate().child(entry.name))
        .when(Boolean(mark), el => el.child(div().text_size(11).text_color(mark === "A" ? t.ansi2 : mark === "D" || mark === "U" ? t.ansi1 : t.blocked).child(mark))));
      if (entry.dir && open) this.rows(path, depth + 1, out, t);
    }
    return out;
  }

  // The popup closes, then acts, as Herdr's menus do. VS Code is the exception: closing ends
  // this copy's tasks and with them the nvim fallback, so it closes once `code` has answered.
  choose(id, cx) {
    const { target, overlay } = props();
    if (id === "code") cx.spawn(async () => { await code(target); closeOverlay(overlay); });
    else { closeOverlay(overlay); ACTIONS[id](target, cx); }
  }

  renderMenu() {
    const t = theme(), groups = menuGroups(props().target), list = groups.flat();
    return v_flex().id("files-menu").track_focus(this.handle).w_full().min_h(0).p(5).bg(t.popover).text_color(t.foreground).text_size(12.8)
      .on_key_down((e, cx) => {
        if (e.key === "down") this.at = (this.at + 1) % list.length;
        else if (e.key === "up") this.at = (this.at + list.length - 1) % list.length;
        else if (e.key === "enter") this.choose(list[this.at][0], cx);
        else if (e.key === "escape") closeOverlay(props().overlay);
        else return;
        cx.notify();
      })
      .children(groups.flatMap((group, g) => [
        ...(g ? [div().mx(7).my(4).h(1).flex_none().bg(t.border)] : []),
        ...group.map(([id, label]) => h_flex().id(`mi-${id}`).h(31).flex_none().px(8).rounded(7).items_center().cursor_pointer()
          .when(list[this.at][0] === id, (el) => el.bg(t.selected)).hover((s) => s.bg(t.hover))
          .on_click((_e, cx) => this.choose(id, cx)).child(label)),
      ]));
  }

  render(cx) {
    if (this.role === "menu") return this.renderMenu();
    if (key() !== this.context?.key) this.refresh(cx);
    else this.refreshIfDue(cx);
    const t = theme(), size = settings().font_size;
    const gutter = Math.ceil(Math.max(4, String(this.lines?.length ?? 0).length) * charWidth(size)) + 2;
    return v_flex().id("files").size_full().min_h(0).rounded(10).overflow_hidden().bg(t.background).border_1().border_color(t.border).text_color(t.foreground).text_size(13)
      .child(h_flex().h(42).flex_none().px(14).gap(8).items_center().border_b(1).border_color(t.border)
        .when(Boolean(this.file), el => el.child(div().id("files-back").w(20).cursor_pointer().text_color(t.muted).on_click((_e, cx) => { this.show(null); cx.notify(); }).child("←")))
        .child(div().font_semibold().child("Files"))
        .child(div().flex_1().min_w(0).truncate().text_right().text_size(12).text_color(t.dim).child(this.file ?? this.root?.split(/[\\/]/).pop() ?? "")))
      .when(!this.file, el => el.child(v_flex().id("files-tree").flex_1().min_h(0).overflow_y_scrollbar().p(6).children(this.rows("", 0, [], t))
        .when(Boolean(this.error) || !this.entries.get("")?.length, el => el.child(div().p(8).text_size(12).text_color(t.dim).child(this.error || (this.loading ? "Loading files…" : this.root ? "No files" : "No folder"))))
        .when(this.limited, el => el.child(div().p(8).text_size(11).text_color(t.dim).child("File list limited to 500 entries per folder and 5,000 total")))))
      // The list's id is the file's: another file starts at its top, not where the last one was scrolled to.
      .when(Boolean(this.file), el => el.child(this.lines.length
        ? div().flex_1().min_h(0).relative().pt(6).font_family(settings().font_family ?? "JetBrains Mono").text_size(size)
          .child(div().id("files-code-x").size_full().overflow_x_scrollbar()
            .child(div().w_full().min_w(Math.max(300, this.longest * charWidth(size) + gutter + 20)).h_full().child(v_virtual_list(`files-code-${this.file}`, this.lines.length, rowHeight(size), (i) => String(i),
              (range) => this.lines.slice(range.start, range.end).map((line, i) => this.codeRow(line, range.start + i + 1, gutter, t, size))).size_full())))
          .child(Scrollbar.vertical(`files-code-${this.file}`).viewport_from_layout().absolute().inset_0())
        : div().p(12).text_color(t.dim).child(this.fileError || "Loading file…")));
  }
}
