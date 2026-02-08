# ColorStation

ColorStation is a performance-first color picker extension for Microsoft Edge (Manifest V3).

It starts instantly from the toolbar, samples visible pixels using viewport capture, and provides a precision loupe workflow with persistent local history.

## Table of Contents

- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Requirements](#requirements)
- [Local Development](#local-development)
- [How To Use](#how-to-use)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Options](#options)
- [Troubleshooting](#troubleshooting)
- [Security and Limitations](#security-and-limitations)
- [Project Structure](#project-structure)
- [Build and Package](#build-and-package)
- [Microsoft Edge Add-ons Submission](#microsoft-edge-add-ons-submission)
- [Publish to GitHub (Open Source)](#publish-to-github-open-source)
- [Scripts](#scripts)
- [Privacy and Permissions](#privacy-and-permissions)
- [License](#license)

## Key Features

- Direct action UX: click extension icon -> picker starts immediately (no popup gate).
- Precision overlay:
  - reticle + loupe
  - live HEX / RGB / HSL readout
  - sampling modes `1x1`, `3x3`, `5x5`, `11x11`, `25x25`
- Adaptive capture strategy:
  - robust viewport sampling with `chrome.tabs.captureVisibleTab`
  - adaptive recapture for moving surfaces (video/canvas/animated image targets)
- Strong copy confirmation and post-pick actions (`Pick again`, `History`, `Exit`).
- Local-first storage (no telemetry, no external API calls).
- Persistent history limited to the latest 5 colors.

## How It Works

1. User triggers picker from toolbar icon or command (`Alt+Shift+C`).
2. Background worker ensures content script is present on the active tab.
3. Content script enters pick mode and captures visible tab for sampling.
4. Pointer movement updates reticle/loupe and reads pixel color from the latest capture buffer.
5. On click, color is copied and saved to local history, then post-pick controls appear.

## Requirements

- Node.js 20+ (recommended)
- npm 10+
- Microsoft Edge (Chromium-based)

## Local Development

```bash
npm install
npm run typecheck
npm run build
```

Load unpacked extension from:

- `dist/`

## How To Use

### 1. Start Picking

- Click the ColorStation toolbar icon, or
- Press `Alt+Shift+C`

The picker enters live mode immediately.

### 2. Choose a Color

- Move cursor over any visible pixel.
- Use loupe preview for precision.
- Click once to confirm selection.

### 3. Copy + Confirm

- Selected color is copied immediately (default format from options).
- A large `Color Copied` confirmation appears.

### 4. Continue or Exit

After confirmation, use floating actions:

- `Pick again` -> re-enter pick mode
- `History` -> open recent 5 colors, click a row to copy
- `Exit` -> fully remove overlay and listeners

## Keyboard Shortcuts

In pick mode:

- `Esc` -> exit
- `Space` -> cycle sampling mode
- `G` -> toggle pixel grid
- `+` / `-` -> zoom loupe in/out

Global command (manifest command):

- `Alt+Shift+C` -> start picker

## Options

Available in the extension options page:

- Default copy format (`HEX`, `RGB`, `HSL`)
- Default sampling size
- Default grid state
- Prefer native EyeDropper fallback

Open options page by either:

- right-clicking the extension icon -> `Extension options`, or
- opening `edge://extensions`, selecting ColorStation, then `Extension options`.

## Troubleshooting

### Picker does not start on click

- Reload the extension in `edge://extensions`.
- Make sure you loaded the unpacked extension from `dist/`.

### Color cannot be captured on some pages

- This is expected on restricted/protected contexts.
- Try regular web pages first, or use the native EyeDropper fallback if available.

### Build succeeds but behavior is stale

- Re-run `npm run build`.
- Reload extension and hard-refresh the target tab.

## Security and Limitations

- ColorStation does not bypass browser security boundaries.
- Some pages/surfaces may block capture (browser internal pages, protected/DRM surfaces, restricted contexts).
- On blocked contexts, the extension fails gracefully.

## Project Structure

```text
public/
  manifest.json
  icons/
src/
  background/
    service_worker.ts
  content/
    content_script.ts
  options/
    main.ts
    style.css
  shared/
    constants.ts
    storage.ts
    types.ts
scripts/
  generate-icons.mjs
```

## Build and Package

Build production artifacts:

```bash
npm run build
```

Output directory:

- `dist/`

Create zip package for store upload:

```bash
cd dist
zip -r ../colorstation-edge.zip .
cd ..
```

## Microsoft Edge Add-ons Submission

Checklist before upload:

1. Run `npm run typecheck` and `npm run build`.
2. Verify extension works via unpacked load in Edge.
3. Confirm `manifest.json` is MV3 and permissions are minimal.
4. Ensure no remote code execution, no external scripts, no tracking.
5. Upload `colorstation-edge.zip` to Edge Add-ons Partner Center.

## Publish to GitHub (Open Source)

If this repo is not connected yet:

```bash
git init
git add .
git commit -m "feat: initial ColorStation release"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If remote is already configured:

```bash
git add .
git commit -m "chore: refine release for Edge store"
git push
```

## Scripts

- `npm run typecheck` -> TypeScript validation
- `npm run build` -> generate icons + production build
- `npm run dev` -> build in watch mode
- `npm run clean` -> remove `dist/`

## Privacy and Permissions

See:

- [`PRIVACY.md`](./PRIVACY.md)
- [`PERMISSIONS.md`](./PERMISSIONS.md)

## License

[MIT](./LICENSE)
