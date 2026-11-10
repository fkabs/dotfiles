import { View, div, svg, image } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, panes, run, openOverlay, theme, window, shared, setShared, layout, settings, home } from "herdr";

// Modified from Herdr's shipped `tabs` mod (Apache-2.0, github.com/herdrdev/herdr-app):
// tabs name themselves, and names may run to 280px (native: 170px).
//
// Auto title: a tab is called after what runs in it. Per tab the first pane with
// something to say wins: a program's own title (a coding agent's conversation title),
// else the name of a program running there, else the folder a shell sits in.
// A name you type yourself stays until you clear it. Spaces keep their own names.
const KEY = "auto-title-tabs.applied"; // tab id -> the last names this mod gave it
const LEGACY_KEY = "tab-titles.set"; // this mod's earlier build: tab id -> { applied }
const GLYPHS = /^[\s\u2800-\u28ff\u00b7\u2022\u25cf\u25cb\u25d0-\u25d3\u2722\u2733\u2736\u273b\u273d\u2726]+/u;

const clean = (s) => String(s ?? "").replace(GLYPHS, "").replace(/\s+/g, " ").trim();

// A title counts when it says more than the program's own name, a path or a host prompt.
function usefulTitle(p) {
  const title = clean(p.title);
  if (!title) return "";
  const own = [p.program?.name, p.program?.key, p.app].filter(Boolean).map((s) => String(s).toLowerCase());
  if (own.includes(title.toLowerCase()) || /^[~/\\]|^[A-Za-z]:[\\/]|\S+@\S+/.test(title)) return "";
  return title;
}

function folderOf(cwd) {
  if (!cwd) return "";
  if (cwd === home()) return "~";
  return cwd.replace(/[\\/]+$/, "").split(/[\\/]/).pop() || "/";
}

// What a tab should be called. Mod panes have no terminal and are ignored.
function nameFor(tabPanes) {
  const terms = tabPanes.filter((p) => p.terminal);
  const programs = terms.filter((p) => !p.program?.shell);
  for (const p of programs) if (usefulTitle(p)) return usefulTitle(p);
  for (const p of programs) if (p.program?.name || p.app) return p.program?.name || p.app;
  for (const p of terms) if (folderOf(p.cwd)) return folderOf(p.cwd);
  return "";
}

function syncTitles() {
  const saved = shared(KEY) ?? {};
  const legacy = shared(LEGACY_KEY) ?? {};
  const byTab = new Map();
  for (const p of panes()) {
    if (!byTab.has(p.tab)) byTab.set(p.tab, []);
    byTab.get(p.tab).push(p);
  }
  const mine = {};
  for (const tab of spaces().flatMap((s) => s.tabs)) {
    let names = saved[tab.id] ?? (legacy[tab.id]?.applied ? [legacy[tab.id].applied] : []);
    const tabPanes = byTab.get(tab.id) ?? [];
    const want = nameFor(tabPanes);
    // Ours: unnamed, still wearing a name this mod gave it, or the launcher's default
    // (the program's name). Any other name was typed by you. Keeping the last few names
    // covers a rename that is queued but not yet applied.
    // ponytail: a name you type that equals one we gave earlier counts as ours.
    const launcher = tabPanes.map((p) => p.program?.name).filter(Boolean);
    const ours = !tab.named || names.includes(tab.name) || launcher.includes(tab.name);
    if (want && want !== tab.name && ours) {
      try {
        run("tab.rename", { id: tab.id, name: want });
        names = [...names.filter((n) => n !== want), want].slice(-3);
      } catch (e) {
        console.log(`auto-title-tabs: ${e}`);
      }
    }
    if (names.length) mine[tab.id] = names;
  }
  if (JSON.stringify(mine) !== JSON.stringify(saved)) setShared(KEY, mine);
}

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

export default class Tabs extends View {
  init(_props, cx) {
    cx.timer.every(3000, () => syncTitles());
    this.pressed = null;
    this.panels = JSON.parse(localStorage.getItem("panels") ?? "{}");
  }

  // The side panel is remembered per space: switching shows that space's choice
  // (closed if it never had one), and opening or closing it records it.
  syncPanel(space, panel, body, enabled) {
    if (!space || !panel) return;
    const now = panel.hidden ? null : body?.active ?? null;
    if (space.id !== this.space) {
      const first = this.space === undefined;
      this.space = space.id; this.pending = null;
      if (!(first && !(space.id in this.panels))) {
        const stored = this.panels[space.id] ?? null, want = enabled.includes(stored) ? stored : null;
        if (want !== now) {
          this.pending = { want, until: Date.now() + 1000 };
          if (want) { run("layout.select", { stack: "panel-body", child: want }); run("layout.show", { id: "panel" }); }
          else run("layout.hide", { id: "panel" });
          return;
        }
      }
    }
    // Until the restore lands (or something else won), the old state isn't a choice.
    if (this.pending) {
      if (this.pending.want !== now && Date.now() < this.pending.until) return;
      this.pending = null;
    }
    if (this.panels[space.id] === now) return;
    this.panels[space.id] = now;
    localStorage.setItem("panels", JSON.stringify(this.panels));
  }

  render() {
    const t = theme();
    const space = spaces().find(p => p.active);
    const shown = space?.tabs ?? [];
    const stop = (_e, cx) => cx.stop_propagation();
    const button = (id, label, action) => div().id(id).size(26).flex_none().flex().items_center().justify_center().rounded(6).text_color(t.dim).hover(s => s.bg(t.hover).text_color(t.foreground))
      .on_mouse_down("left", stop).on_click(action).child(label);
    const item = (c, i) => {
      const program = panes().find(p => p.tab === c.id && p.program?.agent)?.program ?? panes().find(p => p.tab === c.id)?.program;
      const name = /^tb\d+$/.test(c.name) ? program?.name ?? "Terminal" : c.name;
      return h_flex().id(`tab-${c.id}`).h(29).px(10).gap(7).rounded(7).items_center().flex_none().text_size(12.8)
        .border(1).border_color(c.active ? t.border : t.chrome).bg(c.active ? t.raised : t.chrome).text_color(c.active ? t.foreground : t.muted)
        .hover(s => s.bg(t.hover))
        .on_mouse_down("left", (e, cx) => { cx.stop_propagation(); this.pressed = i; if (e.click_count === 2) run("tab.rename", { id: c.id }); })
        .on_mouse_up("left", () => {
          const from = this.pressed; this.pressed = null;
          if (from !== null && from !== i) run("tab.move", { id: shown[from].id, index: space.tabs.findIndex(x => x.id === c.id) + 1 });
          else run("tab.select", { id: c.id });
        })
        .on_mouse_down("right", (_e, cx) => { cx.stop_propagation(); openOverlay({ mod: "menu", kind: "popup", width: 200, props: { tab: "tab", target: { id: c.id, space: space.id } } }); })
        .when(Boolean(program?.icon), el => el.child(program.tint ? svg(program.icon).size(14).text_color(t.muted) : image(program.icon).size(14)))
        .child(div().max_w(280).truncate().child(c.zoomed ? `${name} Z` : name))
        .when(c.status === "working", el => el.child(svg("mods/workspace-chrome/spinner.svg").size(12).flex_none().text_color(t.working).spin(900)))
        .when(c.status === "blocked" || c.status === "done", el => el.child(div().size(6).rounded(3).bg(t[c.status])))
        .when(c.active, el => el.child(div().id(`close-${c.id}`).text_color(t.dim).on_mouse_down("left", stop).on_click((_e, cx) => { cx.stop_propagation(); run("tab.close", { id: c.id }); }).child(svg("mods/pane/close.svg").size(12))));
    };
    const root = layout(), sidebar = find(root, "sidebar"), w = window();
    // Old saved rails and a dragged-narrow sidebar can be smaller than the window buttons.
    const lightsPadding = w?.platform === "macos" && w.titlebar === "none" && !w.fullscreen && root?.traffic_lights
      ? Math.max(10, (root.traffic_lights[0] + 64) / settings().zoom - (sidebar?.hidden ? 0 : sidebar?.size?.px ?? 0))
      : 10;
    const panel = find(root, "panel"), body = find(root, "panel-body");
    const enabled = shared("workspace.panels") ?? ["files", "changes"];
    this.syncPanel(space, panel, body, enabled);
    const panelButton = (id, label, icon) => {
      const on = panel && !panel.hidden && body?.active === id;
      return h_flex().id(`panel-${id}`).h(26).px(8).gap(5).flex_none().items_center().rounded(6)
        .text_size(12).bg(on ? t.selected : t.chrome).text_color(on ? t.foreground : t.muted)
        .hover(s => s.bg(t.hover)).on_mouse_down("left", stop)
        .on_click(() => {
          if (on) run("layout.hide", { id: "panel" });
          else { run("layout.select", { stack: "panel-body", child: id }); run("layout.show", { id: "panel" }); }
        }).child(svg(icon).size(14)).child(label);
    };
    return h_flex().size_full().min_w(0).px(10).pl(lightsPadding).gap(3).items_center().bg(t.chrome).border_b(1).border_color(t.border)
      .on_mouse_up("left", () => { this.pressed = null; })
      .on_scroll_wheel(e => { if (Math.abs(e.delta.y) >= 1) run(e.delta.y > 0 ? "tab.prev" : "tab.next"); })
      .child(h_flex().id("tab-scroll").flex_1().min_w(0).h_full().items_center().gap(3).overflow_x_scrollbar().children(shown.map(item)))
      .child(button("tab-new", "+", () => openOverlay({ mod: "new-menu", kind: "popup", width: 250, height: 512 })))
      .when(enabled.includes("files"), el => el.child(panelButton("files", "Files", "mods/files/file.svg")))
      .when(enabled.includes("changes"), el => el.child(panelButton("changes", "Changes", "mods/changes/changes.svg")))
      .when(w?.buttons, el => el.child(button("minimize", w.platform === "windows" ? svg("mods/auto-title-tabs/win-min.svg").size(16) : "−", () => run("window.minimize")))
        .child(button("maximize", w.platform === "windows" ? svg(`mods/auto-title-tabs/${w.maximized ? "win-restore" : "win-max"}.svg`).size(16) : "□", () => run("window.maximize")))
        .child(button("close-window", w.platform === "windows" ? svg("mods/auto-title-tabs/win-close.svg").size(16) : svg("mods/pane/close.svg").size(13), () => run("window.close"))));
  }
}
