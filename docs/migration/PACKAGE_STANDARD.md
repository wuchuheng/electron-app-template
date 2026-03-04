# Package Standard (PACKAGE_STANDARD.md)

All sub-packages in the `packages/` directory must adhere to these standards.

## 1. Directory Structure
```text
packages/<name>/
├── dist/             # Compiled artifacts
├── src/              # TypeScript source
├── package.json      # Dependencies and metadata
├── tsconfig.json     # Compiler configuration
└── tsup.config.ts    # Bundler configuration
```

## 2. Build Standard (`tsup`)
- **Core Library:** Must produce `index.js` (CJS) and `index.mjs` (ESM).
- **UI Library:** Must produce `index.mjs` (ESM) only to prevent Node.js pollution.
- **Minification:** Disabled for Core, Enabled for UI.
- **DTS:** Must generate `.d.ts` files automatically for all exports.

## 3. Quality Control Commands
Every package MUST implement:
- `npm run build`: Executes `tsup`.
- `npm run dev`: Executes `tsup --watch`.
- `npm run lint`: A sequential chain: `prettier --check` -> `eslint` -> `tsc --noEmit`.
- `npm run format`: Executes `prettier --write`.

## 4. Dependencies
- **Peer Dependencies:** `react` and `react-dom` must be peer dependencies in the UI package.
- **External:** Any package that cannot be bundled (like `electron` or `better-sqlite3`) must be marked as `external` in `tsup.config.ts`.
