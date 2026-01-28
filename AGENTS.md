# Repository Guidelines

This guide is for contributors working on the Looker → Gmail → Local Service → TRMNL pipeline.

## Project Structure & Module Organization

- `local-service/`: Node.js service that reads Gmail, parses PDFs, and POSTs to TRMNL webhook.
- `trmnl-plugin/`: TRMNL Private Plugin template (HTML/CSS/Liquid).
- `scripts/`: Utilities and setup helpers (notably `parse-csv.js` for local parsing tests).
- `docs/`: Looker configuration docs; see `docs/looker-setup.md`.
- Root docs: `README.md`, `SETUP.md`, `PLANNING.md`, `PROJECT_STRUCTURE.md`.

## Build, Test, and Development Commands

- `node scripts/parse-csv.js <csv-file> "Report Title"`: Local parse/transformation smoke test.
- `npm run test-parse`: Alias for `node scripts/parse-csv.js` (expects CLI args).
- From `local-service/`: `node index.js` (or `node index.js --preview` for local preview).

There is no build step; deployment is copy/paste into TRMNL and run the local service per the guides.

## Coding Style & Naming Conventions

- JavaScript is plain Node/CommonJS in `scripts/` and `local-service/`.
- Keep the existing 2-space indentation and inline comments style in JS files.
- HTML/CSS lives in `trmnl-plugin/plugin.html` and uses Liquid placeholders like `{{ report_title }}`.

## Testing Guidelines

- No formal test framework is configured.
- Use `scripts/parse-csv.js` with sample CSVs to validate parsing and TRMNL payload shape.
- When changing parsing/transform logic, test both CSV attachment and body-parsing paths.

## Commit & Pull Request Guidelines

- This workspace does not include Git history; no established commit convention is detectable.
- Use concise, imperative commit subjects (e.g., "Fix CSV metric extraction").
- PRs should explain what changed, link related issues, and include example input/output when modifying parsing or rendering.

## Security & Configuration Notes

- Gmail and TRMNL credentials should never be committed; keep them in `.env` or platform configs.
- E-ink displays are monochrome: avoid color-only meaning in `trmnl-plugin/plugin.html`.
