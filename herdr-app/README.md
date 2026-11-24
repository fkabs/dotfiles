# herdr-app

Config for the [Herdr](https://herdr.dev) desktop app, linked into `~/.config/herdr-app`
(JSON instead of TOML). Stowed with `--no-folding`: the app owns the rest of that dir
(layouts, shipped mods, `.d.ts`, `AGENTS.md`, `shared.json`), keep it out of the repo.

Stow does not link this file: a `README.*` at a package root is on its ignore list.

## Tracked

| Path (under `.config/herdr-app/`) | What |
|---|---|
| `keys.json` | app defaults plus `ctrl-space` → the `tmux-prefix` mod |
| `settings.json` | font, theme, telemetry off |
| `themes/rose-pine-moon.json` | theme |
| `layouts/home.json` | the only layout |
| `mods/tmux-prefix/` | prefix-key mod (from Herdr's examples, changed) |
| `mods/auto-title-tabs/`, `mods/auto-title-spaces/`, `mods/home-files/`, `mods/home-changes/` | my own mods (each `main.js`, `mod.json`) |

## New machine

1. `just install` (or `just install herdr-app`).
2. Copy the [third-party mods](#third-party-mods).
3. Start Herdr, then `herdr-app do layout.switch '{"name":"home"}'`.

Not carried over: `shared.json` (space groups, panel choices and the mods' own settings
are app state).

## Working on mods

- **Reload:** the app doesn't notice edits made through a stow symlink. After changing a
  stowed mod, `touch -h ~/.config/herdr-app/mods/<mod>/main.js`, else it keeps running the
  old code while `herdr-app check` passes on the new. (Layout edits are noticed.)
- **Check:** `herdr-app status` and `herdr-app check`. Run `check` on the linked
  `~/.config/herdr-app/mods/...` copy: on the repo path it writes `gpui-kit.d.ts` and
  `jsconfig.json` into the repo.
- **One `main.js` per mod.** A mod with relative imports can't be stow-linked (`herdr-app
  check` rejects an import resolving into `~/.dotfiles`, and the SVG loader ignores
  symlinks, so `auto-title-tabs` keeps its clone's `win-*.svg` as real untracked files,
  Windows only, and `home-files` uses the shipped `mods/files/*.svg`). Menus and dialogs
  are the same mod opened as a popup with `props().role`.
- `shared()` returns read-only objects: copy before mutating.
- In zsh write `${VAR}` before a `:` in test commands (`$P:P` is a path modifier).
- A new tracked file needs `just restow herdr-app`.
- The four mods of my own are modified copies of Herdr's shipped `tabs`, `spaces`, `files`
  and `changes` mods (Apache-2.0); each file's header says so.

## Keys and the `tmux-prefix` mod

`keys.json` is the app defaults plus `ctrl-space` → `tmux-prefix` (old herdr prefix). Once
edited it no longer receives new default keys, add them by hand.

The mod is
[herdrdev/herdr-layout-examples](https://github.com/herdrdev/herdr-layout-examples/tree/main/tmux-prefix)
with prefix Ctrl+Space instead of Ctrl+B and extra keys in `BINDINGS` in `main.js`:
`v - b s w N W D T X g e o t f`. It runs `hc keys` to send the literal prefix. Edits are
live.

- `g`: the Git Good dialog (a third-party mod, below; lazygit moved to the Changes panel's
  header menu)
- `o`: a VS Code window on the focused pane's folder
- `t`: a new Ghostty window there (macOS only, `--window-save-state=never` or it restores
  an old window)
- `f`: Finder there (`xdg-open` on Linux)

## The `home` layout

`main` cloned (`herdr-app do layout.clone`), with `"mod": "tabs"`, `"mod": "spaces"`,
`"mod": "files"` and `"mod": "changes"` swapped for my four mods (the block ids stay
`files`/`changes`: the tab bar's panel buttons use them). It stops following Herdr's
updates to `main`; `ctrl-shift-l` switches back.

The agents slot uses the third-party `"auto-agents"` (agent rows show the tab name only),
and the bottom bar is a row, `status-row`: `workspace-status` (weight 1) and the
third-party `usage-limits` (weight 2.2; Claude Code/Codex limits and OpenCode/Pi tokens,
more on hover).

## My mods

### `auto-title-tabs`: the tab bar

A tab is named after what runs in it: the first pane with a useful terminal title (a
coding agent's conversation title), else a program's name, else a shell's folder. A name
typed by hand stays until cleared. Spaces keep their own names. Names are 280px wide.

### `auto-title-spaces`: the spaces sidebar

- A git space always shows its branch in grey after its name, with a branch icon (the
  shipped one hides `main`/`master`). The name shortens before the branch does.
- Icons are one Codicons set (outline): open `U+EAF7` / closed `U+EA83` folder, new group
  `U+EA80`, remove from group `U+EBAC` (export) and branch `U+EC6F`, all in the `ICONS`
  constant. They are Nerd Font glyphs in the Propo variant of the terminal font (one
  `replace()` in the `nerd()` helper; the Mono variant squeezes icons into one cell, Propo
  draws them proportionally), not SVGs.
- It groups spaces: named, colored, foldable groups, with the spaces that are in no group
  left **loose** above them (no header, no indent; nothing is stored for a loose space, so
  spaces made by cmd-n or a worktree are loose by default). A small gap (no line)
  separates them from the first group (none between groups), and a group's members hang
  off a rail in the group's color.
- The folder-plus button next to the Spaces `+` makes a group. Right-click a space →
  *Move to <group>* / *New group…* / *Remove from group*, or drag it onto a header (onto
  the fixed "Spaces" title bar or a loose row to take it out, onto a space to take its
  place). Right-click a group header → Rename, color, Delete (folding is the header's
  chevron/click only). The color row is the six rose-pine-moon theme colors (`ansi1..6`
  tokens, so they follow the theme) plus a spectrum swatch that opens a hex dialog for a
  custom `#rrggbb`. Each header's `+` makes a space inside it.
- Order is kept in the real space order, so `space.next/prev`, `ctrl-1..9` and the prefix
  `J`/`K` follow the list.
- State is the shared key `space.groups` in `shared.json` (app state, **not** tracked: a
  new machine starts with no groups; `members` per group are space ids).
- Scriptable and testable with
  `herdr-app do 'auto-title-spaces.group.<new:NAME | rename:ID:NAME | color:ID:ansiN\|#hex | delete:ID | fold:ID | assign:SPACE:ID\|none | newspace:ID | open:space:ID\|group:ID\|name:new>'`.

### `home-files`: the Files panel

A click on a file previews it in the panel, as the shipped mod does, but drawn like the
diff in `home-changes` with syntax colors from `bat` (same flags and fallbacks) instead of
Herdr's editor, so its text can't be selected.

Right-click a file → *Open in Neovim (split)* (right of the focused pane), *Open in Neovim
(tab)*, *Open in Visual Studio Code* (`code <folder> <file>`: the pane's folder gets a
window, or its open window is reused; if `code` doesn't start, an nvim tab), *Show in
Finder*, *Copy relative path* (relative to the pane's folder), *Copy absolute path*; a
folder gets Finder and the two copies. VS Code and Finder are hidden on a remote space.

Testable with
`herdr-app do 'home-files.<show | menu | code | nvim | nvim-tab | finder | copy-rel | copy-full>:<path>'`
(a folder ends in `/`; `show:` alone goes back to the tree).

### `home-changes`: the Changes panel

The diff has syntax colors from `bat`, run once per diff and side (the file, and `git show
HEAD:<path>`) with my bat config: theme `ansi` and italics apply, only `--style=plain
--tabs=4` is forced, and bat's 16 colors map to the theme's `ansi0..15`. A line bat prints
differently (cut at 4000 characters, file changed since) and a machine without bat stay
plain.

Right-click a changed file → *Difftool:* Beyond Compare, VS Code, difftastic, exiftool,
the four tools of `git/.gitconfig` (`git difftool -y -t <tool> HEAD -- <path>`; an
untracked file is compared with `/dev/null` by `--no-index`). `bc` and `vscode` start in
the background (local spaces only), `difft` and `exiftool` in a new tab.

Right-click the panel's header ("Changes · N files") → *Open in Visual Studio Code* (`code
<repo>`, local spaces only), *Open in Lazygit* (a new tab in the repo).

Testable with `herdr-app do 'home-changes.<menu | bc | vscode | difft | exiftool>:<path>'`
and `'home-changes.<repo-menu | code | lazygit>'`; the panel only refreshes while the
window is focused, so switch tabs to make it reload during a test.

## Third-party mods

Not in the repo. They have relative imports, helper scripts and icons, so they can't be
stowed: copy each mod's folder into `~/.config/herdr-app/mods/<name>` (copy, don't
symlink), then `herdr-app check ~/.config/herdr-app/mods/<name>`. A running window only
picks up a re-copied mod after switching layouts away and back.

- [`auto-agents`](https://github.com/benjaminsicard/herdr-mods/tree/main/universal-auto-tabs)
  (`mods/auto-agents`): the agents list of the `home` layout, rows show the tab name only
- [`usage-limits`](https://github.com/nozikov/herdr-usage-limits) (`mods/usage-limits`): Claude
  Code and Codex limits in the status bar of the `home` layout
- [`git-good`](https://github.com/CodeyPacker/herdr-mods/tree/main/git-good)
  (`mods/git-good`): git dialog (changed files with diff, staging by file or hunk, commit,
  pull, push, stash, switching and creating branches), on Ctrl+Space `g`

Without `auto-agents` or `usage-limits`, set its slot in `layouts/home.json` back:
`"agents"` for the agents list, the plain `status` block (`"size": {"px": 28}`) for the
bottom row.

When adding one, read its code first (mods run programs and reach the network unchecked)
and add it to this list.
