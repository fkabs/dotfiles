// Modified from Herdr's shipped `spaces` mod (Apache-2.0, github.com/herdrdev/herdr-app):
// a git space always shows its branch in the grey text after its name, main and master too,
// and spaces can be grouped: named, colored, foldable groups, with the spaces that are in
// no group listed loose above them (no header). Groups, their colors and which space is in
// which live in shared state; see GROUPS below.

// Workspace spaces: stable colored avatars, worktrees under their checkout,
// grouped by machine when more than one is known. After a space's name, the repo
// its first terminal is in now, only where unusual: branch, ahead/behind. Agent state lives in the agents list, not here. Click to
// switch, right-click for its menu, drag to reorder.

import { View, div, svg } from "gpui-kit";
import { v_flex, h_flex, InputState, Input } from "gpui-base";
import { spaces, machines, panes, run, openOverlay, exec, hc, theme, shared, setShared, watchFolder, window, layout, nextCommand, props, closeOverlay } from "herdr";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

// The sidebar's rail goes by its width, not a flag: dragging its edge narrows it too.
const narrow = () => (find(layout(), "sidebar")?.size?.px ?? Infinity) < 160;

// Where a space is now: its first terminal's live folder, else where it was made.
// `ps`: panes(), read once by the caller (each read copies every pane).
function place(s, ps) {
  const tabs = new Set((s.tabs ?? []).map((c) => c.id));
  return ps.find((p) => tabs.has(p.tab) && p.cwd)?.cwd || s.folder;
}
const rowHeight = ({ tree }) => (tree ? 28 : 30);
const RAIL_CELL = 32;
const railCell = (el) => h_flex().flex_none().justify_center().child(el);
const where = (s, ps) => JSON.stringify([s.machine ?? null, place(s, ps)]);
const base = (path) => path.replace(/\/+$/, "").split("/").pop();
// Changes made outside Herdr (an editor's save, a commit in another app): looked
// for this often, in repos the list shows, while the window is in front.
const FALLBACK = 60000;

// What a stored color name looks like on an avatar (the same in every mod
// that draws space avatars): one strong color per hue, light and dark alike.
const MARK = { ansi6: "#22a99a", ansi3: "#e3814f", ansi4: "#5b8def", ansi5: "#8b7cf6", ansi2: "#3fae6a", ansi1: "#d9649a" };

// ---- Groups ----------------------------------------------------------------
// shared "space.groups": { groups: [{ id, name, folded, machine, color, members: [spaceId, ...] }] }.
// `members` is the group's order: a space joining is appended, and dragging inside a group reorders it.
// A loose space (in no group) is derived, never stored: no group lists it, so spaces made elsewhere
// (cmd-n, a worktree, a machine connecting) are loose with nothing to write. Group ids, not names, so a
// rename is safe and an empty group survives. Nothing prunes `members`: while spaces()/machines() are still
// loading, pruning would wipe every assignment; stale ids are ignored and go with their group.
// shared() hands back read-only objects, so everything is copied on the way in.
const GROUPS = "space.groups";
// The section of a space that is in no group (a loose space); also the value of `group.assign:<space>:none`.
const DEFAULT_GROUP = "none";
// A group's color is a theme token (so it follows the theme: in rose-pine-moon ansi1..6 are love, gold, rose,
// pine, foam, iris) or a custom "#rrggbb" picked with the spectrum swatch.
const PALETTE = ["ansi1", "ansi3", "ansi6", "ansi2", "ansi4", "ansi5"];
// What the swatches are called in the menu tooltips: the rose-pine-moon names of those tokens.
const COLOR_NAMES = { ansi1: "Love", ansi3: "Gold", ansi6: "Rose", ansi2: "Pine", ansi4: "Foam", ansi5: "Iris" };
const isHex = (c) => typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c);
const okColor = (c) => PALETTE.includes(c) || isHex(c);
function parseHex(text) {
  let h = String(text ?? "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split("").map((c) => c + c).join("");
  return /^[0-9a-f]{6}$/i.test(h) ? `#${h.toLowerCase()}` : null;
}
function hslHex(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const x = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${x(f(0))}${x(f(8))}${x(f(4))}`;
}
// The spectrum swatch is a disc built from 32 hairline bars whose heights follow the circle's outline, so it needs
// no clipping (the element clip is rectangular and would leave the end slices poking out of the round ring).
const SPECTRUM = Array.from({ length: 32 }, (_, i) => {
  const x = (i + 0.5) / 2 - 8; // bar centre, from the middle of a 16px disc
  return { color: hslHex((i * 360) / 32, 0.85, 0.6), h: Math.max(1, 2 * Math.sqrt(Math.max(0, 64 - x * x))) };
});

function groupState() {
  const g = shared(GROUPS);
  const groups = (Array.isArray(g?.groups) ? g.groups : [])
    .filter((x) => x?.id && typeof x.name === "string")
    .map((x) => ({
      id: x.id, name: x.name, folded: x.folded === true, machine: x.machine ?? null,
      color: okColor(x.color) ? x.color : PALETTE[0],
      members: Array.isArray(x.members) ? [...x.members] : [],
    }));
  const of = {}; // spaceId -> groupId, derived
  for (const x of groups) for (const id of x.members) of[id] ??= x.id;
  return { groups, of };
}
const saveGroups = (st) => setShared(GROUPS, { groups: st.groups });
const fillOf = (t, c) => (isHex(c) ? c : t[c] ?? t.dim);
// Dark icon on a light fill (foam, gold, ...), white on a dark one.
function inkOn(fill) {
  const m = /^#([0-9a-f]{6})/i.exec(String(fill));
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150 ? "#232136" : "#ffffff";
}

// A space's section: its group when that exists on the space's own machine, else Home.
function sectionOf(st, w) {
  const g = st.groups.find((x) => x.id === st.of[w.id]);
  return g && (g.machine ?? null) === (w.machine ?? null) ? g.id : DEFAULT_GROUP;
}

function newGroup(name, machine = null, spaceId = null) {
  const clean = String(name ?? "").trim();
  if (!clean) return null;
  const st = groupState();
  const uses = (c) => st.groups.filter((g) => g.color === c).length;
  const id = "g" + Math.random().toString(36).slice(2, 8);
  if (spaceId) for (const g of st.groups) g.members = g.members.filter((m) => m !== spaceId);
  st.groups.push({ id, name: clean, folded: false, machine: machine ?? null, color: PALETTE.reduce((a, c) => (uses(c) < uses(a) ? c : a)), members: spaceId ? [spaceId] : [] });
  saveGroups(st);
  return id;
}

function editGroup(id, change) {
  const st = groupState();
  const g = st.groups.find((x) => x.id === id);
  if (!g) return;
  change(g);
  saveGroups(st);
}
const renameGroup = (id, name) => { const n = String(name ?? "").trim(); if (n) editGroup(id, (g) => { g.name = n; }); };
const recolorGroup = (id, color) => {
  const c = PALETTE.includes(color) ? color : parseHex(color);
  if (c) editGroup(id, (g) => { g.color = c; });
};

function deleteGroup(id) {
  const st = groupState();
  st.groups = st.groups.filter((g) => g.id !== id);
  saveGroups(st);
}

function toggleFold(id) {
  const st = groupState();
  const g = st.groups.find((x) => x.id === id);
  if (!g) return;
  g.folded = !g.folded;
  saveGroups(st);
}

// Put a space in a group (at the end, or in front of `beforeId`), or take it out (sectionId "none"). A group
// only takes spaces of its own machine.
function assign(spaceId, sectionId, beforeId = null) {
  const w = spaces().find((x) => x.id === spaceId);
  if (!w) return false;
  const st = groupState();
  const target = sectionId === DEFAULT_GROUP ? null : st.groups.find((x) => x.id === sectionId);
  if (sectionId !== DEFAULT_GROUP && (!target || (target.machine ?? null) !== (w.machine ?? null))) return false;
  for (const g of st.groups) g.members = g.members.filter((m) => m !== spaceId);
  if (target) {
    const at = beforeId ? target.members.indexOf(beforeId) : -1;
    if (at >= 0) target.members.splice(at, 0, spaceId);
    else target.members.push(spaceId);
  }
  saveGroups(st);
  return true;
}

const openName = (spec, at) => openOverlay({ mod: "auto-title-spaces", kind: "dialog", width: 420, height: 190, ...(at ? { at } : {}), props: { role: "name", ...spec } });
const openSpaceMenu = (target, at) => openOverlay({ mod: "auto-title-spaces", kind: "popup", width: 230, height: 380, ...(at ? { at } : {}), props: { role: "space-menu", target } });
const openColor = (spec, at) => openOverlay({ mod: "auto-title-spaces", kind: "dialog", width: 360, height: 230, ...(at ? { at } : {}), props: { role: "color", ...spec } });
const openGroupMenu = (id, at) => openOverlay({ mod: "auto-title-spaces", kind: "popup", width: 230, height: 300, ...(at ? { at } : {}), props: { role: "group-menu", target: { id } } });

// A space speaks up only when something in it needs you.
export function glyph(status) {
  return status === "blocked" || status === "done" ? "●" : "·";
}

export function tone(t, status) {
  return t[status] ?? t.unknown;
}

export default class Spaces extends View {
  init(_props, cx) {
    // The same mod also draws the menus and the name dialog it opens, told apart by props().role.
    this.role = props()?.role ?? "list";
    if (this.role !== "list") return this.initOverlay(cx);
    this.nested = new Set(); // ids of worktree rows: they follow their main checkout's section
    this.intent = null; // a per-header "+" waiting for its new space: { group, ids, until }
    this.git = {}; // where() -> { name, branch, ahead, behind, repo, linked }, null: not a repo
    this.checked = {}; // where() -> when it was last looked at
    this.unsure = new Set(); // where()s git couldn't answer for (a machine away)
    this.pending = new Set(); // where()s to look at next
    this.busy = {}; // pane -> an agent working or a program in front of its shell
    this.ready = {}; // machine -> its layout was readable at the last look
    this.at = {}; // space -> its where() at the last look
    this.watching = new Set(); // local repos' git folders
    // Spaces made while this runs wait (at most a moment) for their git, so a
    // worktree appears under its repo instead of jumping there.
    this.shown = new Set(spaces().map((s) => s.id));
    this.born = {};
    this.pressed = null;
    this.over = null;
    this.machines = [];
    this.reconnecting = JSON.parse(localStorage.getItem("machines.reconnecting") ?? "{}");
    for (const state of Object.values(this.reconnecting)) state.busy = false;
    this.folded = new Set(JSON.parse(localStorage.getItem("machines.folded") ?? "[]"));
    this.refreshMachines(cx);
    cx.timer.every(15000, cx => this.refreshMachines(cx));
    // `git status` walks the whole tree, on another machine a process there:
    // only when its answer could have changed (see `due`).
    cx.timer.every(250, (cx) => this.checkNew(cx));
    // Commands (`herdr-app do auto-title-spaces.group.new:Work`), only here: an open dialog copy
    // would apply them twice.
    cx.spawn(async (cx) => {
      for (;;) {
        const text = await nextCommand();
        try { this.command(text, cx); } catch (e) { console.log(`auto-title-spaces: ${text}: ${e}`); }
      }
    });
  }

  checkNew(cx) {
    const now = Date.now();
    const sp = spaces();
    if (this.intent) {
      const fresh = sp.filter((s) => !this.intent.ids.has(s.id));
      if (fresh.length === 1) assign(fresh[0].id, this.intent.group);
      if (fresh.length || now > this.intent.until) this.intent = null;
    }
    for (const s of sp) if (!this.shown.has(s.id)) this.born[s.id] ??= now;
    const due = this.due(now, sp, panes());
    if (due.size) this.refreshGit(due, cx);
    if (sp.some((s) => !this.shown.has(s.id)) || this.orderingDue(now)) cx.notify();
  }

  // Places whose git could have changed: new ones (a new space, a cd), where a
  // command or an agent's turn just ended (a checkout, a commit, edits), those on
  // a machine that is back, and repos in view whose fallback is due.
  due(now, sp, ps) {
    // Moved there: what it knew of that place may be old.
    const at = {};
    for (const s of sp) at[s.id] = where(s, ps);
    const keys = new Set(Object.values(at).filter((k) => JSON.parse(k)[1]));
    const due = new Set([...keys].filter((k) => !(k in this.git)));
    for (const [id, k] of Object.entries(at)) if (this.at[id] && this.at[id] !== k && keys.has(k)) due.add(k);
    this.at = at;
    const spaceOf = {};
    for (const s of sp) for (const t of s.tabs ?? []) spaceOf[t.id] = s;
    const busy = {};
    for (const p of ps) {
      if (!p.terminal || !spaceOf[p.tab]) continue;
      busy[p.pane] = p.status === "working" || !(p.program?.shell || p.program?.agent);
      if (this.busy[p.pane] && !busy[p.pane]) this.sameRepo(at[spaceOf[p.tab].id], keys).forEach((k) => due.add(k));
    }
    this.busy = busy;
    for (const m of machines()) {
      const ready = m.layout === "ready";
      if (ready && this.ready[m.name] === false) for (const k of keys) if (JSON.parse(k)[0] === m.name) due.add(k);
      this.ready[m.name] = ready;
    }
    if (window().active) {
      for (const k of keys) {
        const asks = this.git[k] || this.unsure.has(k);
        if (asks && !this.folded.has(JSON.parse(k)[0]) && now - (this.checked[k] ?? 0) > FALLBACK) due.add(k);
      }
    }
    return due;
  }

  // `key` and the other places in its repo (a commit there moves their ahead/behind).
  sameRepo(key, keys) {
    const repo = this.git[key]?.repo;
    return [key, ...(repo ? [...keys].filter((k) => this.git[k]?.repo === repo) : [])];
  }

  refreshMachines(cx) {
    cx.spawn(async cx => {
      try { const r = await hc(["machine", "ls", "--json"]); if (r.code === 0) this.machines = (JSON.parse(r.stdout).machines ?? []).filter((m) => !m.temporary); } catch {}
      cx.notify();
    });
  }

  rebuilt(machine) {
    return machine?.state === "unreachable" && /^a different core answers there \("[^"]+"\)$/.test(machine.why ?? "");
  }

  reconnect(machine, cx) {
    const name = machine.name;
    if (this.reconnecting[name]?.busy) return;
    const state = this.reconnecting[name] ??= { machine, removed: false };
    state.busy = true;
    state.error = null;
    localStorage.setItem("machines.reconnecting", JSON.stringify(this.reconnecting));
    cx.notify();
    cx.spawn(async cx => {
      try {
        const ask = async args => {
          const r = await hc([...args, "--json"]);
          if (r.code !== 0) {
            let error;
            try { error = JSON.parse(r.stdout || r.stderr).error?.message; } catch {}
            throw new Error(error || r.stderr || r.stdout || "Couldn't connect.");
          }
        };
        if (!state.removed) {
          await ask(["machine", "rm", name]);
          state.removed = true;
          localStorage.setItem("machines.reconnecting", JSON.stringify(this.reconnecting));
        }
        const args = ["machine", "add"];
        if (machine.via) args.push("--via", machine.target);
        else args.push(machine.target);
        args.push("--name", name);
        if (machine.session) args.push("--session", machine.session);
        if (machine.temporary) args.push("--temp");
        await ask(args);
        this.folded.delete(name);
        localStorage.setItem("machines.folded", JSON.stringify([...this.folded]));
        delete this.reconnecting[name];
      } catch (e) {
        state.error = String(e.message ?? e);
        state.busy = false;
      }
      localStorage.setItem("machines.reconnecting", JSON.stringify(this.reconnecting));
      this.refreshMachines(cx);
      cx.notify();
    });
  }

  // One look at a time, each place once however often it was asked for meanwhile.
  refreshGit(keys, cx) {
    for (const k of keys) this.pending.add(k);
    if (this.refreshing) return;
    this.refreshing = true;
    cx.spawn(async (cx) => {
      while (this.pending.size) {
        const keys = [...this.pending];
        this.pending.clear();
        for (const key of keys) await this.check(key, cx);
      }
      const used = new Set(Object.values(this.git).filter(Boolean).map((g) => JSON.parse(g.repo)).filter(([on]) => !on).map(([, repo]) => repo));
      for (const repo of this.watching) if (!used.has(repo)) this.watching.delete(repo);
      this.refreshing = false;
      cx.notify();
    });
  }

  // One place's git: branch, ahead/behind, its repo.
  async check(key, cx) {
    const [on, cwd] = JSON.parse(key);
    this.checked[key] = Date.now();
    this.unsure.delete(key);
    try {
      // No optional locks: a status that touched the index would wake the watch again.
      // Writes nothing under .git (index lock, fsmonitor cookie): watch() would wake on it.
      const r = await exec("git", ["--no-optional-locks", "-c", "core.fsmonitor=false", "status", "--porcelain=v2", "--branch"], { cwd, on });
      if (r.code !== 0) {
        // Only git's own "no" is remembered as no repo; anything else is asked again.
        if (!/not a git repository/i.test(r.stderr)) this.unsure.add(key);
        this.git[key] = null;
        return;
      }
      // The repo's own .git folder names it; a worktree's top differs from it.
      const top = await exec("git", ["rev-parse", "--show-toplevel"], { cwd, on });
      const common = await exec("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd, on });
      const repo = common.stdout.trim();
      const name = repo.endsWith("/.git") ? base(repo.slice(0, -5)) : base(repo).replace(/\.git$/, "");
      const info = { name, branch: null, ahead: 0, behind: 0, repo: JSON.stringify([on, repo]), linked: repo !== `${top.stdout.trim()}/.git` };
      for (const line of r.stdout.split("\n")) {
        if (line.startsWith("# branch.head ")) info.branch = line.slice(14);
        else if (line.startsWith("# branch.ab ")) {
          const [a, b] = line.slice(12).split(" ");
          info.ahead = Math.abs(parseInt(a, 10)) || 0;
          info.behind = Math.abs(parseInt(b, 10)) || 0;
        }
      }
      this.git[key] = info;
      if (!on) this.watch(repo, cx);
    } catch {
      // Couldn't ask (the machine is away): keep what it showed, look again later.
      this.git[key] ??= null;
      this.unsure.add(key);
    }
  }

  watch(repo, cx) {
    if (this.watching.has(repo)) return;
    this.watching.add(repo);
    cx.spawn(async (cx) => {
      try {
        while (this.watching.has(repo)) {
          await watchFolder(repo);
          const mine = JSON.stringify([null, repo]);
          if (this.watching.has(repo)) this.refreshGit(Object.keys(this.git).filter((k) => this.git[k]?.repo === mine), cx);
        }
      } catch { this.watching.delete(repo); }
    });
  }

  menu(w) {
    openSpaceMenu({ id: w.id, tree: this.nested.has(w.id) });
  }

  orderingDue(now) {
    return this.ordering && now - this.ordering.at >= 1000
      && this.ordering.machines.every(name => machines().some(m => m.name === name && m.layout === "ready"));
  }

  // Spaces in order, each worktree space moved under its main checkout's.
  ordered() {
    const sp = spaces(), ps = panes();
    const ready = (w) => this.shown.has(w.id) || where(w, ps) in this.git || Date.now() - (this.born[w.id] ??= Date.now()) > 1500;
    for (const w of sp) if (!this.shown.has(w.id) && ready(w)) this.shown.add(w.id);
    const list = sp.map((w, i) => ({ w, i, g: this.git[where(w, ps)] ?? null }));
    const mains = new Set(list.filter((r) => r.g && !r.g.linked).map((r) => r.g.repo));
    const nested = (r) => r.g?.linked && mains.has(r.g.repo);
    const blocks = [];
    const placed = new Set(); // repos whose worktrees are listed (under the first of its spaces)
    for (const r of list) {
      if (nested(r)) continue;
      const block = { row: { ...r, tree: null }, kids: [] };
      blocks.push(block);
      if (!r.g || r.g.linked || placed.has(r.g.repo)) continue;
      placed.add(r.g.repo);
      const kids = list.filter((k) => nested(k) && k.g.repo === r.g.repo);
      block.kids = kids.map((k, n) => ({ ...k, tree: n === kids.length - 1 ? "└─" : "├─" }));
    }
    this.nested = new Set(list.filter(nested).map((r) => r.w.id));
    // Within a machine: Home first, then the groups in their order. The stable sort leaves everything
    // else where it was, and the reconciliation below makes the real space order match.
    const st = groupState();
    const mrank = new Map();
    for (const b of blocks) if (!mrank.has(b.row.w.machine ?? null)) mrank.set(b.row.w.machine ?? null, mrank.size);
    const rank = (b) => {
      const sec = sectionOf(st, b.row.w);
      if (sec === DEFAULT_GROUP) return [-1, 0];
      const gi = st.groups.findIndex((g) => g.id === sec);
      return [gi, st.groups[gi].members.indexOf(b.row.w.id)];
    };
    blocks.sort((a, b) => {
      const [ra, rb] = [rank(a), rank(b)];
      return mrank.get(a.row.w.machine ?? null) - mrank.get(b.row.w.machine ?? null) || ra[0] - rb[0] || ra[1] - rb[1];
    });
    const out = blocks.flatMap((b) => [b.row, ...b.kids]);
    // Simulate the batch so later indexes include earlier moves. An attempted
    // write can lose a sync conflict: allow the echo to settle before retrying.
    const order = sp.map(w => w.id);
    const target = out.map(r => r.w.id);
    const key = JSON.stringify([order, target, machines()]);
    if (order.every((id, i) => id === target[i])) {
      this.ordering = null;
    } else if (this.ordering?.key !== key || this.orderingDue(Date.now())) {
      const moved = new Set();
      this.ordering = { key, at: Date.now(), machines: [] };
      for (let i = 0; i < out.length; i++) {
        const from = order.indexOf(out[i].w.id);
        if (from === i) continue;
        run("space.move", { id: out[i].w.id, index: i + 1 });
        moved.add(out[i].w.machine ?? null);
        order.splice(i, 0, order.splice(from, 1)[0]);
      }
      this.ordering.machines = [...moved];
    }
    return out.filter(r => this.shown.has(r.w.id));
  }

  // The rows, under a header per machine once one isn't this computer.
  grouped(t, collapsed) {
    const rows = this.ordered();
    const remote = [...new Set([...rows.map(r => r.w.machine).filter(Boolean), ...this.machines.map(m => m.name), ...Object.keys(this.reconnecting)])].sort();
    const loading = m => {
      const layout = machines().find(k => k.name === m)?.layout;
      return layout === "loading" || (!layout && this.machines.some(k => k.name === m && k.state === "connected"))
        || spaces().some(s => (s.machine ?? null) === m && !this.shown.has(s.id));
    };
    const loadingRow = m => h_flex().id(`machine-loading-${m ?? "local"}`).h(28).flex_none().px(collapsed ? 0 : 8).items_center().when(collapsed, el => el.justify_center()).text_size(12).text_color(t.dim).child(collapsed ? "…" : "Loading…");
    if (!remote.length) return loading(null) && !rows.length ? [loadingRow(null)] : this.sections(rows, null, t, collapsed);
    const machineNames = [null, ...remote];
    return machineNames.flatMap((m) => {
      const mine = rows.filter((r) => (r.w.machine ?? null) === m);
      const repair = this.reconnecting[m];
      const machine = this.machines.find(k => k.name === m) ?? repair?.machine;
      const connected = !m || machine?.state === "connected";
      const rebuilt = this.rebuilt(machine) || !!repair;
      const folded = this.folded.has(m);
      const icon = svg(`mods/workspace-chrome/${m ? "server" : "monitor"}.svg`).size(13).flex_none();
      const badge = div().absolute().right(-3).bottom(-2).size(6).rounded(3).border_1().border_color(t.chrome).bg(connected ? t.ansi2 : t.dim);
      const head = h_flex().id(`machine-${m ?? "local"}`).h(26).flex_none().px(collapsed ? 0 : 8).gap(7).items_center().text_size(11).text_color(t.dim)
        .when(collapsed, el => el.mt(4).w(RAIL_CELL).justify_center().rounded(6).tooltip(m ? `${m} · ${connected ? "connected" : (machine?.state ?? "asleep").replace(/_/g, " ")}` : "This computer"))
        .cursor_pointer().hover(s => s.bg(t.hover))
        .on_click((_e, cx) => {
          folded ? this.folded.delete(m) : this.folded.add(m);
          localStorage.setItem("machines.folded", JSON.stringify([...this.folded]));
          cx.notify();
        })
        .when(!collapsed, el => el.child(icon))
        .when(collapsed, el => el.child(div().relative().flex_none().child(icon).when(Boolean(m), el => el.child(badge))))
        .when(!collapsed, el => el.child(div().flex_1().truncate().child(m ?? "This computer"))
          .when(!connected && !rebuilt, el => el.child(div().flex_none().child((machine?.state ?? "asleep").replace(/_/g, " "))))
          .when(rebuilt, el => el.child(h_flex().flex_none().gap(3).items_center()
            .child(div().max_w(140).truncate().child(repair?.error || "rebuilt ·"))
            .child(div().id(`machine-connect-${m}`).text_color(repair?.error ? t.blocked : t.muted)
              .hover(s => s.text_color(t.foreground))
              .tooltip(repair?.error || "This machine was rebuilt or replaced. Click to connect to the new one.")
              .on_click((_e, cx) => { cx.stop_propagation(); this.reconnect(machine, cx); })
              .child(repair?.busy ? "Connecting…" : "Connect"))))
          .when(connected, el => el.child(div().id(`machine-add-${m ?? "local"}`).flex_none().px(4).rounded(4).hover(s => s.bg(t.hover).text_color(t.foreground))
            .on_click((_e, cx) => { cx.stop_propagation(); run("space.new", { machine: m ?? "" }); }).child("+")))
          .child(div().size(6).rounded(3).flex_none().bg(connected ? t.ansi2 : t.dim))
          .child(svg(`mods/workspace-chrome/chevron-${folded ? "right" : "down"}.svg`).size(11).flex_none()));
      const empty = h_flex().id(`machine-new-${m ?? "local"}`).h(28).flex_none().px(collapsed ? 0 : 8).gap(7).items_center().rounded(7)
        .text_size(12).text_color(t.dim).hover(s => s.bg(t.hover).text_color(t.foreground))
        .on_click(() => run("space.new", { machine: m ?? "" }))
        .when(collapsed, el => el.w(RAIL_CELL).rounded(6).justify_center().tooltip(`New space on ${m ?? "this computer"}`)
          .child(h_flex().size(18).rounded(5).border_1().border_color(t.dim).items_center().justify_center()
            .child(svg("mods/workspace-chrome/plus.svg").size(10))))
        .when(!collapsed, el => el.child(svg("mods/workspace-chrome/plus.svg").size(12)).child("New space there"));
      if (!collapsed && rebuilt) return [head];
      const cell = collapsed ? railCell : (el) => el;
      return [cell(head), ...(folded ? [] : mine.length ? this.sections(mine, m, t, collapsed) : [loading(m) ? loadingRow(m) : cell(empty)])];
    });
  }

  // After the name: "herdr \u00b7 spike \u21912 \u21931". The repo or branch goes when the
  // name already says it (a worktree is named after its branch). Local change vs the shipped
  // `spaces` mod: master/main are shown too, so a git space always shows its branch.
  gitTail(g, tree, name, t) {
    const raw = g.branch ?? "detached";
    const same = (a) => a.toLowerCase() === name.toLowerCase();
    const branch = same(raw) ? "" : raw;
    const repo = tree || same(g.name) ? "" : g.name;
    // Natural width, shrinking only once the name has nothing left to give (see row()).
    return h_flex()
      .flex_shrink(0.01)
      .min_w(0)
      .gap(5)
      .items_center()
      .text_size(11.5)
      .text_color(t.dim)
      // "repo · [branch icon] branch": the icon belongs to the branch name only.
      .when(Boolean(repo), (el) => el.child(div().min_w(0).truncate().child(repo)))
      .when(Boolean(repo && branch), (el) => el.child(div().flex_none().child("\u00b7")))
      .when(Boolean(branch), (el) => el.child(svg("mods/workspace-chrome/git-branch.svg").size(11).flex_none().text_color(t.dim)))
      .when(Boolean(branch), (el) => el.child(div().min_w(0).truncate().child(branch)))
      .when(g.ahead > 0, (el) => el.child(div().flex_none().text_color(t.ansi2).child(`\u2191${g.ahead}`)))
      .when(g.behind > 0, (el) => el.child(div().flex_none().text_color(t.ansi1).child(`\u2193${g.behind}`)));
  }

  row({ w, i, g, tree }, t, indent = 0) {
    const on = w.active;
    const fromIndex = this.pressed === null ? -1 : spaces().findIndex(s => s.id === this.pressed);
    const colors = shared("space.colors") ?? {};
    const color = colors[w.id] ?? "ansi6";
    const fill = color.startsWith("#") ? color : (MARK[color] ?? t[color]);
    return v_flex()
      .relative()
      .id(`space-${w.id}`)
      .px(8)
      .when(indent > 0, (el) => el.ml(indent))
      .h(rowHeight({ tree }))
      .flex_none()
      .justify_center()
      .rounded(8)
      .when(on, (el) => el.bg(t.selected))
      .when(!on, (el) => el.hover((s) => s.bg(t.hover)))
      .when(this.pressed === w.id && this.over !== w.id, (el) => el.opacity(0.5))
      .when(this.pressed !== null && this.over === w.id && this.pressed !== w.id, (el) => el.child(
        div().absolute().left(0).right(0).h(2).bg(t.accent)
          .when(fromIndex < i, line => line.bottom(0))
          .when(fromIndex > i, line => line.top(0)),
      ))
      .on_mouse_down("left", () => {
        this.pressed = w.id;
        this.over = w.id;
      })
      .on_mouse_move((_e, cx) => {
        const source = spaces().find(s => s.id === this.pressed);
        const over = source && (source.machine ?? null) === (w.machine ?? null) ? w.id : null;
        if (this.pressed !== null && this.over !== over) {
          this.over = over;
          cx.notify();
        }
      })
      .on_mouse_up("left", (_e, cx) => {
        const from = this.pressed;
        const over = this.over;
        this.pressed = null;
        this.over = null;
        if (from !== null && over === w.id && from !== w.id) {
          const index = spaces().findIndex(s => s.id === w.id);
          if (index !== -1) run("space.move", { id: from, index: index + 1 });
          // Dropped on a space: it joins that space's section, next to it (not onto/from worktree rows).
          if (!tree && !this.nested.has(from)) {
            const st = groupState();
            const sec = sectionOf(st, w);
            if (sec === DEFAULT_GROUP) assign(from, DEFAULT_GROUP);
            else {
              const order = spaces().map((x) => x.id);
              const members = st.groups.find((x) => x.id === sec).members;
              const k = members.indexOf(w.id);
              // Moving down lands after the target, moving up in front of it.
              assign(from, sec, order.indexOf(from) < order.indexOf(w.id) ? members[k + 1] ?? null : w.id);
            }
          }
        } else if (from === w.id) run("space.select", { id: w.id });
        cx.notify();
      })
      .on_mouse_down("right", () => this.menu(w))
      .child(
        h_flex()
          .gap(9)
          .items_center()
          .when(Boolean(tree), el => el.pl(22).child(svg("mods/workspace-chrome/branch.svg").size(13).text_color(t.dim)))
          .when(!tree, el => el.child(h_flex().size(18).flex_none().rounded(5).bg(fill).items_center().justify_center().text_size(10.5).font_bold().text_color("#ffffff").child([...w.name][0]?.toUpperCase() ?? "?")))
          // The name gives way first: a far higher shrink weight than the branch text, with a spacer between.
          // It keeps ~56px (a few letters) so a narrow sidebar never reduces it to a bare ellipsis; only then does the
          // branch text shrink.
          .child(div().min_w(56).flex_shrink(100).truncate().text_color(t.foreground).child(w.name))
          .child(div().flex_1().min_w(0))
          .child(g ? this.gitTail(g, tree, w.name, t) : div()),
      );
  }

  compact({ w, i }, t) {
    return railCell(h_flex()
      .id(`space-${w.id}`)
      .relative()
      .w(RAIL_CELL)
      .h(26)
      .rounded(6)
      .justify_center()
      .items_center()
      .when(w.active, (el) => el.bg(t.selected))
      .when(!w.active, (el) => el.hover((s) => s.bg(t.hover)))
      .on_click(() => run("space.select", { id: w.id }))
      .child(div().text_color(w.active ? t.foreground : t.muted).child(String(i + 1)))
      .child(div().absolute().right(5).text_color(tone(t, w.status)).child(glyph(w.status))));
  }

  // ---- groups: commands, per-header "+", sections, menus, name dialog ----------

  // For scripts and tests; also bindable to keys. Values after the first ":" are the arguments.
  command(text, cx) {
    const [name, ...rest] = String(text).split(":");
    const at = { x: 280, y: 160 };
    switch (name) {
      case "group.new": newGroup(rest.join(":")); break;
      case "group.rename": renameGroup(rest[0], rest.slice(1).join(":")); break;
      case "group.color": recolorGroup(rest[0], rest[1]); break;
      case "group.delete": deleteGroup(rest[0]); break;
      case "group.fold": toggleFold(rest[0]); break;
      case "group.assign": assign(rest[0], rest[1]); break;
      case "group.newspace": this.newSpaceIn(rest[0]); break;
      case "group.open":
        if (rest[0] === "space") openSpaceMenu({ id: rest[1], tree: this.nested.has(rest[1]) }, at);
        else if (rest[0] === "group") openGroupMenu(rest[1], at);
        else if (rest[0] === "color") openColor({ id: rest[1], value: groupState().groups.find((g) => g.id === rest[1])?.color ?? "" }, at);
        else if (rest[0] === "name") {
          openName(rest[1] === "rename"
            ? { mode: "rename", id: rest[2], value: groupState().groups.find((g) => g.id === rest[2])?.name ?? "" }
            : { mode: "new", machine: null }, at);
        }
        break;
    }
    cx.notify();
  }

  // A header's "+": a new space that lands in that group. run() hands back no id, so remember what
  // existed and claim the one new space in checkNew() (never persisted, gives up after 10 s).
  newSpaceIn(id) {
    const g = groupState().groups.find((x) => x.id === id);
    if (!g) return;
    this.intent = { group: g.id, ids: new Set(spaces().map((x) => x.id)), until: Date.now() + 10000 };
    run("space.new", { machine: g.machine ?? "" });
  }

  // A group's header. Click folds; right-click opens the group menu; dropping a dragged space on it files
  // the space there.
  header(sec, t, m, count, status, hasActive) {
    const key = `sec:${sec.id}`;
    const over = this.pressed !== null && this.over === key;
    const needs = sec.folded && (status === "blocked" || status === "done");
    const tile = h_flex().size(18).flex_none().rounded(5).items_center().justify_center().bg(fillOf(t, sec.color))
      .child(svg("mods/workspace-chrome/folder.svg").size(11).text_color(inkOn(fillOf(t, sec.color))));
    return h_flex().id(`section-${m ?? "local"}-${sec.id}`).h(28).flex_none().px(8).gap(7).items_center().rounded(7)
      .text_size(12.5).text_color(t.foreground).cursor_pointer()
      .when(over, (el) => el.bg(t.hover).border_1().border_color(t.accent))
      .when(!over && sec.folded && hasActive, (el) => el.bg(t.selected))
      .when(!over && !(sec.folded && hasActive), (el) => el.hover((s) => s.bg(t.hover)))
      .on_click((_e, cx) => { toggleFold(sec.id); cx.notify(); })
      .on_mouse_move((_e, cx) => {
        if (this.pressed === null) return;
        const from = spaces().find((x) => x.id === this.pressed);
        const next = (from?.machine ?? null) === (m ?? null) ? key : null;
        if (this.over !== next) { this.over = next; cx.notify(); }
      })
      .on_mouse_up("left", (_e, cx) => {
        const from = this.pressed;
        if (from === null) return;
        const dropped = this.over === key;
        this.pressed = null;
        this.over = null;
        if (dropped && !this.nested.has(from)) assign(from, sec.id);
        cx.notify();
      })
      .on_mouse_down("right", () => openGroupMenu(sec.id))
      .child(tile)
      .child(div().flex_1().min_w(0).truncate().child(sec.name))
      .when(needs, (el) => el.child(div().size(6).rounded(3).flex_none().bg(tone(t, status))))
      .child(div().id(`section-add-${m ?? "local"}-${sec.id}`).flex_none().size(20).flex().items_center().justify_center().rounded(5)
        .text_color(t.dim).hover((s) => s.bg(t.hover).text_color(t.foreground)).tooltip("New space in this group")
        .on_click((_e, cx) => { cx.stop_propagation(); this.newSpaceIn(sec.id); })
        .child(svg("mods/workspace-chrome/plus.svg").size(12)))
      .child(div().flex_none().text_size(11).text_color(t.dim).child(String(count)))
      .child(svg(`mods/workspace-chrome/chevron-${sec.folded ? "right" : "down"}.svg`).size(11).flex_none().text_color(t.dim));
  }

  // The rows of one machine: with groups, the loose spaces first (no header, no indent), then each group
  // under its own header with its members indented.
  sections(rows, m, t, collapsed) {
    if (collapsed) return rows.map((r) => this.compact(r, t));
    const st = groupState();
    const mine = st.groups.filter((g) => (g.machine ?? null) === (m ?? null));
    if (!mine.length) return rows.map((r) => this.row(r, t));
    const by = new Map(mine.map((g) => [g.id, []]));
    const loose = [];
    let cur = DEFAULT_GROUP;
    for (const r of rows) {
      if (!r.tree) cur = sectionOf(st, r.w); // a worktree row stays with its main checkout
      (cur === DEFAULT_GROUP ? loose : by.get(cur)).push(r);
    }
    const out = loose.map((r) => this.row(r, t));
    for (const g of mine) {
      const rs = by.get(g.id);
      const needs = ["blocked", "done"].find((k) => rs.some((r) => r.w.status === k)) ?? null;
      // One hairline, with a little air, between the loose spaces and the first group; none between groups.
      if (loose.length && g === mine[0]) out.push(div().flex_none().h(1).mx(8).my(5).bg(t.border));
      out.push(this.header({ id: g.id, name: g.name, color: g.color, folded: g.folded }, t, m, rs.length, needs, rs.some((r) => r.w.active)));
      // The members hang off a rail in the group's color, like a tree guide under the header's tile.
      if (!g.folded && rs.length) {
        out.push(v_flex().flex_none().ml(16).pl(4).mt(2).mb(8).border_l(2).border_color(fillOf(t, g.color)).children(rs.map((r) => this.row(r, t))));
      }
    }
    return out;
  }

  // The menus and the dialog are this mod again, opened with props().role.
  initOverlay(cx) {
    this.handle = cx.focus_handle();
    this.at = null;
    if (this.role !== "name" && this.role !== "color") { this.handle.focus(); return; }
    const p = props();
    this.text = p.value ?? "";
    this.input = InputState.new({ value: this.text });
    if (this.text) this.input.set_selected_range({ start: 0, end: this.text.length });
    this.input.on("change", (_e, cx) => { this.text = this.input.value(); cx.notify(); });
    this.input.on("submit", () => (this.role === "color" ? this.submitColor() : this.submitName()));
    this.inputFocused = true;
    this.input.on("focus", (_e, cx) => { this.inputFocused = true; cx.notify(); });
    this.input.on("blur", (_e, cx) => { this.inputFocused = false; cx.notify(); });
    this.input.focus();
    cx.timer.after(600, () => this.input.focus());
  }

  submitName() {
    const p = props();
    const name = this.text.trim();
    if (!name) return;
    closeOverlay(p.overlay);
    if (p.mode === "rename") renameGroup(p.id, name);
    else newGroup(name, p.machine ?? null, p.assign ?? null);
  }

  submitColor() {
    const hex = parseHex(this.text);
    if (!hex) return;
    closeOverlay(props().overlay);
    recolorGroup(props().id, hex);
  }

  spaceItems() {
    const p = props();
    const w = spaces().find((x) => x.id === p.target?.id);
    if (!w) return [];
    const st = groupState();
    const cur = sectionOf(st, w);
    const items = [];
    if (!p.target.tree) {
      for (const g of st.groups) {
        if ((g.machine ?? null) !== (w.machine ?? null)) continue;
        items.push({ label: `Move to ${g.name}`, color: g.color, mark: cur === g.id, run: () => assign(w.id, g.id) });
      }
      items.push({ label: "New group…", icon: "folder-plus", run: () => openName({ mode: "new", machine: w.machine ?? null, assign: w.id }) });
      if (cur !== DEFAULT_GROUP) items.push({ label: "Remove from group", icon: "folder", run: () => assign(w.id, DEFAULT_GROUP) });
      items.push({ sep: true });
    }
    items.push({ label: "Rename", icon: "square-pen", run: () => run("space.rename", { id: w.id }) });
    items.push({ label: "Close", icon: "x", run: () => run("space.close", { id: w.id }) });
    // The shipped menu keeps the worktree actions.
    items.push({ label: "More…", icon: "git-branch", run: () => openOverlay({ mod: "menu", kind: "popup", width: 200, height: 260, props: { tab: "space", target: { id: w.id } } }) });
    return items;
  }

  groupItems() {
    const g = groupState().groups.find((x) => x.id === props().target?.id);
    if (!g) return [];
    return [
      { label: "Rename…", icon: "square-pen", run: () => openName({ mode: "rename", id: g.id, value: g.name }) },
      { swatches: true, current: g.color, id: g.id },
      { sep: true },
      { label: "Delete group", icon: "x", run: () => deleteGroup(g.id) },
    ];
  }

  renderMenu(items) {
    const t = theme();
    const sel = items.map((it, i) => (it.sep || it.swatches ? -1 : i)).filter((i) => i >= 0);
    if (this.at === null) this.at = sel[0] ?? -1;
    const choose = (it) => { closeOverlay(props().overlay); it?.run?.(); };
    return v_flex().id("space-groups-menu").track_focus(this.handle).w_full().min_h(0).p(5).bg(t.popover).text_size(12.8)
      .on_key_down((e, cx) => {
        const k = sel.indexOf(this.at);
        if (!sel.length) return;
        if (e.key === "down") this.at = sel[(k + 1) % sel.length];
        else if (e.key === "up") this.at = sel[(k - 1 + sel.length) % sel.length];
        else if (e.key === "enter") return choose(items[this.at]);
        else if (e.key === "escape") return closeOverlay(props().overlay);
        else return;
        cx.notify();
      })
      .children(items.map((it, i) => {
        if (it.sep) return div().mx(7).my(4).h(1).bg(t.border);
        if (it.swatches) {
          return h_flex().px(8).h(30).gap(9).items_center()
            .children([
              ...PALETTE.map((c) => div().id(`swatch-${c}`).size(18).flex_none().rounded_full().bg(fillOf(t, c)).cursor_pointer()
                .border_1().border_color(it.current === c ? t.foreground : t.popover).tooltip(COLOR_NAMES[c])
                .on_click(() => { closeOverlay(props().overlay); recolorGroup(it.id, c); })),
              // The spectrum: a custom hex color. Ringed when the group already has one.
              div().id("swatch-custom").size(18).flex_none().rounded_full().cursor_pointer()
                .border_1().border_color(isHex(it.current) ? t.foreground : t.popover).tooltip("Custom color")
                .on_click(() => { closeOverlay(props().overlay); openColor({ id: it.id, value: isHex(it.current) ? it.current : "" }); })
                .child(h_flex().size_full().items_center().children(SPECTRUM.map((b) => div().flex_none().w(0.5).h(b.h).bg(b.color)))),
            ]);
        }
        return h_flex().id(`gm-${i}`).h(31).px(8).gap(9).rounded(7).items_center().text_color(t.foreground)
          .when(i === this.at, (el) => el.bg(t.selected))
          .hover((s) => s.bg(t.hover))
          .on_click(() => choose(it))
          .child(it.color
            ? h_flex().size(14).flex_none().rounded(4).bg(fillOf(t, it.color)).items_center().justify_center().child(svg("mods/workspace-chrome/folder.svg").size(9).text_color(inkOn(fillOf(t, it.color))))
            : svg(`mods/workspace-chrome/${it.icon}.svg`).size(14).flex_none().text_color(t.muted))
          .child(div().flex_1().min_w(0).truncate().child(it.label))
          .when(it.mark, (el) => el.child(div().text_size(11).text_color(t.dim).child("✓")));
      }));
  }

  renderColor() {
    const t = theme();
    const p = props() ?? {};
    const hex = parseHex(this.text);
    const button = (id, text, primary, action) => h_flex().id(id).h(32).px(14).items_center().rounded(8)
      .border_1().border_color(primary ? t.solid : t.input).bg(primary ? t.solid : t.raised)
      .text_color(primary ? t.solid_foreground : t.foreground).text_size(12.5).cursor_pointer()
      .when(primary && !hex, (el) => el.opacity(0.45))
      .hover((s) => s.opacity(0.88)).on_click(action).child(text);
    return v_flex().id("space-groups-color").track_focus(this.handle)
      .on_key_down((e, cx) => { if (e.key === "escape") { closeOverlay(p.overlay); cx.stop_propagation(); } })
      .w_full().min_h(0).p(18).bg(t.popover).text_color(t.foreground)
      .child(h_flex().items_center().child(div().flex_1().text_size(15).font_semibold().child("Custom color"))
        .child(div().text_size(11).text_color(t.dim).child("Esc")))
      .child(div().pt(16).pb(7).text_size(11.5).text_color(t.dim).child("Hex, like #c4a7e7"))
      .child(h_flex().gap(10).items_center()
        .child(Input.new(this.input).flex_1().h(36).px(10).rounded(9).border_1().border_color(this.inputFocused ? t.accent : t.input).bg(t.background).text_size(12.8).text_color(t.foreground))
        .child(div().size(36).flex_none().rounded(9).border_1().border_color(t.input).bg(hex ?? t.raised)))
      .child(h_flex().pt(20).gap(8).justify_end()
        .child(button("gc-cancel", "Cancel", false, () => closeOverlay(p.overlay)))
        .child(button("gc-save", "Save", true, () => this.submitColor())));
  }

  renderName() {
    const t = theme();
    const p = props() ?? {};
    const button = (id, text, primary, action) => h_flex().id(id).h(32).px(14).items_center().rounded(8)
      .border_1().border_color(primary ? t.solid : t.input).bg(primary ? t.solid : t.raised)
      .text_color(primary ? t.solid_foreground : t.foreground).text_size(12.5).cursor_pointer()
      .hover((s) => s.opacity(0.88)).on_click(action).child(text);
    return v_flex().id("space-groups-name").track_focus(this.handle)
      .on_key_down((e, cx) => { if (e.key === "escape") { closeOverlay(p.overlay); cx.stop_propagation(); } })
      .w_full().min_h(0).p(18).bg(t.popover).text_color(t.foreground)
      .child(h_flex().items_center().child(div().flex_1().text_size(15).font_semibold().child(p.mode === "rename" ? "Rename group" : "New group"))
        .child(div().text_size(11).text_color(t.dim).child("Esc")))
      .child(div().pt(16).pb(7).text_size(11.5).text_color(t.dim).child("Name"))
      .child(Input.new(this.input).h(36).px(10).rounded(9).border_1().border_color(this.inputFocused ? t.accent : t.input).bg(t.background).text_size(12.8).text_color(t.foreground))
      .child(h_flex().pt(20).gap(8).justify_end()
        .child(button("gn-cancel", "Cancel", false, () => closeOverlay(p.overlay)))
        .child(button("gn-save", "Save", true, () => this.submitName())));
  }

  render() {
    if (this.role === "space-menu") return this.renderMenu(this.spaceItems());
    if (this.role === "group-menu") return this.renderMenu(this.groupItems());
    if (this.role === "name") return this.renderName();
    if (this.role === "color") return this.renderColor();
    const t = theme();
    const collapsed = narrow();
    const palette = ["ansi6", "ansi3", "ansi4", "ansi5", "ansi2", "ansi1"];
    const sp = spaces();
    const ids = new Set(sp.map(p => p.id));
    const kept = Object.fromEntries(Object.entries(shared("space.colors") ?? {}).filter(([id]) => ids.has(id)));
    let changed = Object.keys(kept).length !== Object.keys(shared("space.colors") ?? {}).length;
    for (const p of sp) {
      if (kept[p.id] || p.name === "~") continue;
      const uses = c => Object.values(kept).filter(v => v === c).length;
      kept[p.id] = palette.reduce((best, c) => uses(c) < uses(best) ? c : best);
      changed = true;
    }
    if (changed) setShared("space.colors", kept);
    return v_flex().size_full().min_h(0).bg(t.chrome).text_size(13)
      .child(h_flex().h(31).pl(16).pr(10).items_center().justify_between().text_size(11.5).text_color(t.dim)
        .when(this.pressed !== null && this.over === "ungroup", el => el.bg(t.hover).text_color(t.foreground))
        // It stays put while the list scrolls, so it is the reliable place to drop a space to take it out of its group.
        .on_mouse_move((_e, cx) => { if (this.pressed === null || this.over === "ungroup") return; this.over = "ungroup"; cx.notify(); })
        .on_mouse_up("left", (_e, cx) => {
          const from = this.pressed;
          if (from === null) return;
          const dropped = this.over === "ungroup";
          this.pressed = null;
          this.over = null;
          if (dropped && !this.nested.has(from)) assign(from, DEFAULT_GROUP);
          cx.notify();
        })
        .when(collapsed, el => el.pl(0).pr(0).justify_center())
        .when(!collapsed, el => el.child(this.pressed !== null && this.over === "ungroup" ? "Remove from group" : "Spaces"))
        .child(h_flex().flex_none().items_center()
          .when(!collapsed, el => el.child(div().id("group-new").size(26).flex_none().flex().items_center().justify_center().rounded(6).hover(s => s.bg(t.hover).text_color(t.foreground))
            .tooltip("New group").on_click(() => openName({ mode: "new", machine: null })).child(svg("mods/workspace-chrome/folder-plus.svg").size(14))))
          .child(div().id("space-new").size(26).flex_none().flex().items_center().justify_center().rounded(6).hover(s => s.bg(t.hover).text_color(t.foreground))
            .on_click(() => run("space.new")).child(svg("mods/workspace-chrome/plus.svg").size(14)))))
      .child(v_flex().flex_1().min_h(0).px(collapsed ? 0 : 8).pb(14).overflow_y_scrollbar().mode("always")
        .on_mouse_up("left", (_e, cx) => { this.pressed = null; cx.notify(); })
        .children(this.grouped(t, collapsed)));
  }
}
