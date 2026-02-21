# SEPOffice

Hi - I'm Simon, the author of SEPOffice. This repository contains the SEP Interactive
client applications and supporting services (editor, spreadsheet, and presentation tools).

## What this project is

SEPOffice is a lightweight, browser-first office suite focused on quick content creation,
AI-assisted editing, and local-first workflows. The repository contains a multi-app Electron +
web workspace with the following top-level apps:

- `web/` - React + Vite frontend (SEPWrite, SEPGrid, SEPShow) built for the browser and Electron.
- `apps/api/` - TypeScript API helpers and build scripts used by the web app.
- `services/ai/` - local AI service adapters and helper scripts (Python)

Key features:
- Rich text editor with DOCX export (client-side via `html-to-docx`).
- Spreadsheet-like grid with formulas and large-sheet import/export.
- Slide editor and presentation mode using Konva for canvas rendering.
- AI-assisted helpers (summaries, captions, layout suggestions) with provider abstraction.

## Quickstart

Prerequisites:

- Node.js (18+ recommended)
- npm or pnpm
- (optional) Python if you run the local AI service in `services/ai/`

Install dependencies and run the web app (development):

```bash
npm install
npm run dev --workspace=web
```

Build (production):

```bash
npm run build -w web
```

If you use the Electron shell (`electron-main.js`) you can start the packaged shell after building the web bundle.

## License

This project is distributed under a specialized dual-style license described in `LICENSE.md`.
Please read `LICENSE.md` - it permits free personal and non-commercial use but requires a
separate commercial license for any business or paid use.

## Contributing

If you want to contribute:

- Open an issue describing your change or improvement.
- For bug fixes or small features, please open a pull request against `main`.
- For any commercial usage or redistribution plans please contact me before shipping.

## Contact

Simon Erich Plath - SEP Interactive
*(Contact seplath@sep-interactive.de)*

