# Pi Rosé Pine Moon Theme Design

## Summary

Create a custom Pi theme based on the official Rosé Pine **Moon** palette, store it in the dotfiles repo, and activate it globally via Pi settings.

## Goals

- Use the official Rosé Pine Moon palette values.
- Keep the theme managed from the dotfiles repo.
- Activate the theme globally for the current user.
- Avoid disturbing Pi runtime state such as auth and session files.

## Non-Goals

- Replacing the entire `~/.pi` directory with a symlink.
- Modifying Pi auth, session, or cache files.
- Creating additional Pi themes or theme variants.

## Chosen Approach

Use dotfiles as the source of truth for theme and settings, while only linking the specific live files Pi needs.

### Files

- Dotfiles theme file: `pi/.pi/agent/themes/rose-pine-moon.json`
- Dotfiles settings file: `pi/.pi/agent/settings.json`
- Live settings symlink: `~/.pi/agent/settings.json -> ~/.dotfiles/pi/.pi/agent/settings.json`
- Live theme symlink: `~/.pi/agent/themes/rose-pine-moon.json -> ~/.dotfiles/pi/.pi/agent/themes/rose-pine-moon.json`

This keeps the active config global while preserving the rest of `~/.pi/agent/` as Pi-managed runtime state.

## Theme Design

The theme will use the official Rosé Pine Moon palette:

- base: `#232136`
- surface: `#2a273f`
- overlay: `#393552`
- muted: `#6e6a86`
- subtle: `#908caa`
- text: `#e0def4`
- love: `#eb6f92`
- gold: `#f6c177`
- rose: `#ea9a97`
- pine: `#3e8fb0`
- foam: `#9ccfd8`
- iris: `#c4a7e7`
- highlightLow: `#2a283e`
- highlightMed: `#44415a`
- highlightHigh: `#56526e`

### Token Mapping Principles

- Backgrounds use `base`, `surface`, `overlay`, and highlight roles for contrast hierarchy.
- Standard text uses terminal default where appropriate, with secondary content using `muted` or `subtle`.
- Semantic states use Rosé Pine accents:
  - success/info leaning to `pine` or `foam`
  - error to `love`
  - warning/headings to `gold`
  - links and strong accents to `iris` or `foam`
- Syntax highlighting will stay readable and aesthetically aligned with Moon rather than mirroring another editor exactly.

## Settings Change

Set the Pi theme name in `pi/.pi/agent/settings.json`:

```json
{
  "theme": "rose-pine-moon"
}
```

Existing settings keys must be preserved.

## Data Flow

1. Pi starts and reads `~/.pi/agent/settings.json`.
2. The symlink resolves to the dotfiles-managed settings file.
3. The selected theme name is `rose-pine-moon`.
4. Pi discovers `~/.pi/agent/themes/rose-pine-moon.json`.
5. That file resolves to the dotfiles-managed theme definition.
6. Pi loads and renders the TUI with Rosé Pine Moon colors.

## Error Handling

- If `~/.pi/agent/themes/` does not exist, create it before linking.
- If a non-symlink live settings file exists, back it up before replacing it.
- If a non-symlink live theme file exists, back it up before replacing it.
- If Pi fails to load the theme, the settings file can be reverted to remove the `theme` key or point to a known-good theme.

## Verification

- Validate the theme JSON shape against Pi’s documented required tokens.
- Confirm the dotfiles repo contains the new theme and updated settings.
- Confirm live symlinks point into `~/.dotfiles/pi/.pi/agent/`.
- Re-read the resulting live settings/theme files to verify contents.

## Alternatives Considered

### 1. Dotfiles only, no live activation

Safe but incomplete because Pi would not immediately use the new theme.

### 2. Write directly into `~/.pi/agent`

Fast but not properly dotfiles-managed.

### 3. Symlink the entire `~/.pi`

Rejected because Pi stores runtime state there, and replacing the whole directory would be unnecessarily risky.

## Recommendation

Implement the dotfiles-managed theme and settings, then link only the active Pi settings file and theme file into the existing live `~/.pi/agent/` directory.