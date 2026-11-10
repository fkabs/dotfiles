import { View, div } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { closeOverlay, exec, focused, hc, nextCommand, props, run, settings, theme } from "herdr";

// Edit these two things to make the example yours. Only repeatable actions
// start a timer: the first key after Ctrl+Space can take as long as you like.
// Local changes vs herdrdev/herdr-layout-examples tmux-prefix: prefix is
// Ctrl+Space (was Ctrl+B) and BINDINGS gained the old herdr prefix keys.
const REPEAT_MS = 500;
const COLUMNS = 3;
const BINDINGS = [
  ["c", "New tab", "tab.new"],
  ["n", "Next tab", "tab.next"],
  ["p", "Previous tab", "tab.prev"],
  ["T", "Rename tab", "tab.rename"],
  ["X", "Close tab", "tab.close"],
  ["%", "Split right", "pane.split", { direction: "right" }],
  ['"', "Split down", "pane.split", { direction: "down" }],
  ["v", "Split right", "pane.split", { direction: "right" }],
  ["-", "Split down", "pane.split", { direction: "down" }],
  ["J", "Next space", "space.next", {}, true],
  ["K", "Previous space", "space.prev", {}, true],
  ["N", "New space", "space.new"],
  ["W", "Rename space", "space.rename"],
  ["D", "Close space", "space.close"],
  ["h", "Focus left", "pane.go", { direction: "left" }, true],
  ["j", "Focus down", "pane.go", { direction: "down" }, true],
  ["k", "Focus up", "pane.go", { direction: "up" }, true],
  ["l", "Focus right", "pane.go", { direction: "right" }, true],
  ["left", "Focus left", "pane.go", { direction: "left" }, true],
  ["down", "Focus down", "pane.go", { direction: "down" }, true],
  ["up", "Focus up", "pane.go", { direction: "up" }, true],
  ["right", "Focus right", "pane.go", { direction: "right" }, true],
  ["x", "Close pane", "pane.close"],
  ["z", "Zoom pane", "pane.zoom"],
  ["g", "Lazygit (new tab)", "terminal.open", { argv: ["lazygit"], name: "lazygit" }],
  ["e", "Neovim (new tab)", "terminal.open", { argv: ["nvim", "."], name: "nvim" }],
  // A command may be a function instead of a herdr command name.
  // ponytail: local only; a remote space's cwd would open locally, use code --remote ssh-remote+<host> if needed.
  ["o", "VS Code (window)", () => exec("code", focused()?.cwd ? [focused().cwd] : []).catch((e) => console.log(`tmux-prefix: ${e}`))],
  ["d", "Minimize window", "window.minimize"],
  ["w", "Space picker", "mod.open", { name: "picker" }],
  ["b", "Toggle sidebar", "layout.toggle", { id: "sidebar" }],
  ["s", "Settings", "app.settings"],
  ...Array.from({ length: 10 }, (_, i) => [String(i), `Tab ${i === 0 ? 10 : i}`, "tab.select", { index: i === 0 ? 10 : i }]),
];

function forwardKey(e, key) {
  if (["enter", "tab", "backspace", "left", "right", "up", "down", "space"].includes(e.key)) return e.key;
  if (key === " ") return "space";
  if (/^[A-Z]$/.test(key)) return `shift+${key.toLowerCase()}`;
  if (key.length === 1 && "abcdefghijklmnopqrstuvwxyz0123456789`\\[],=-.';/".includes(key)) return key === "\\" ? "backslash" : key;
  return null;
}

export default class TmuxPrefix extends View {
  init(_props, cx) {
    this.handle = cx.focus_handle();
    this.handle.focus();
    this.repeat = false;
    this.generation = 0;
    // The mod-specific key binding beats the global opener while we're open.
    cx.spawn(async (cx) => {
      for (;;) {
        await nextCommand();
        this.sendPrefix(cx);
      }
    });
  }

  dismiss() {
    closeOverlay(props().overlay);
  }

  send(key, cx) {
    this.generation++;
    const terminal = focused()?.terminal;
    if (!terminal) return this.dismiss();
    // hc starts its subprocess at the call, before closing cancels this view's tasks.
    const pending = hc(["keys", terminal, key]);
    cx.spawn(async () => {
      const result = await pending;
      if (result.code !== 0) console.log(`tmux-prefix: ${result.stderr}`);
    });
    this.dismiss();
  }

  sendPrefix(cx) {
    this.send("ctrl+space", cx);
  }

  key(e, cx) {
    cx.stop_propagation();
    const m = e.modifiers;
    if (e.key === "escape") return this.dismiss();
    if (m.control && e.key === "space") return this.sendPrefix(cx);
    const plain = !m.control && !m.alt && !m.platform;
    const key = plain ? (e.key_char ?? (m.shift && e.key.length === 1 ? e.key.toUpperCase() : e.key)) : e.key;
    const binding = plain && BINDINGS.find((b) => b[0] === key);
    if (!binding) {
      const forwarded = this.repeat && plain && forwardKey(e, key);
      if (forwarded) return this.send(forwarded, cx);
      return this.dismiss();
    }
    const [, , command, args = {}, repeatable = false] = binding;
    if (!repeatable) this.dismiss();
    if (typeof command === "function") command();
    else run(command, args);
    if (repeatable) {
      this.repeat = true;
      const generation = ++this.generation;
      cx.timer.after(REPEAT_MS, () => {
        if (this.generation === generation) this.dismiss();
      });
      cx.notify();
    }
  }

  render() {
    const t = theme();
    // Fill column by column: BINDINGS is ordered so each column reads as one topic.
    const per = Math.ceil(BINDINGS.length / COLUMNS);
    const columns = Array.from({ length: COLUMNS }, (_, i) => BINDINGS.slice(i * per, (i + 1) * per));
    return v_flex().id("tmux-prefix").track_focus(this.handle)
      .on_key_down((e, cx) => this.key(e, cx))
      .p(14).gap(8).bg(t.popover).text_color(t.foreground)
      .font_family(settings().font_family ?? "JetBrains Mono").text_size(settings().font_size ?? 14)
      .child(h_flex().justify_between().gap(12).child(div().font_semibold().child(this.repeat ? `Repeat · ${REPEAT_MS} ms` : "Ctrl+Space · waiting for a key"))
        .child(div().text_color(t.muted).child("Esc cancel · ^Space send prefix")))
      .child(h_flex().gap(24).items_start().children(columns.map((col, i) => v_flex().id(`col-${i}`).flex_1().min_w(0).children(col.map(([key, label, , , repeatable]) =>
        h_flex().h(24).flex_none().items_center().gap(12).child(div().w(44).text_color(t.accent).child(key))
          .child(div().flex_1().child(label)).child(div().text_color(t.dim).child(repeatable ? "repeat" : "")))))));
  }
}
