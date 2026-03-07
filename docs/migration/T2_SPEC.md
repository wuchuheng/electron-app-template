# Migration Specification (T2_SPEC.md) - Fundamental Utility & IPC Engines

**Goal**: Extract the low-level "Main Process" plumbing and the complete IPC machinery into `@wuchuheng/electron-template-core`.

## 1. Scope of Changes

### 1.1 Files to Move (Source -> Core Library)
- `src/main/utils/ipc-helper.ts` -> `packages/core/src/ipc/helper.ts`
- `src/main/utils/logger.ts` -> `packages/core/src/utils/logger.ts`
- `src/main/utils/path.util.ts` -> `packages/core/src/utils/path.ts`
- `src/main/utils/i18n.ts` -> `packages/core/src/utils/i18n.ts`

### 1.2 Logic Extraction
- **Preload Bridge**: Extract bridge initialization from `src/preload/preload.ts` to `packages/core/src/preload/bridge.ts`.
- **IPC Sync Tool**: Port `scripts/sync-ipc-types.js` to TypeScript in `packages/core/src/cli/sync-ipc.ts`.

## 2. Technical Requirements

- **Zero-Dependency**: Migrated utilities should avoid non-essential dependencies.
- **Node/Electron Separation**: Utilities must handle environment checks (e.g., Logger should check if `app` is available or if it's running in a test/worker environment).
- **Strict Typing**: All `any` types must be replaced with `unknown` or precise interfaces.
- **Dual-Build**: Must support both ESM (Vite) and CJS (Electron Main).

## 3. Verification Plan

### 3.1 Unit Tests (`packages/core/src/__tests__`)
- **Logger**: Verify file rotation and level filtering with a mocked `fs`.
- **Path**: Verify directory resolution using mocked Electron `app.getPath`.
- **IPC Helper**: Verify broadcast and invoke wrapping logic.
- **Sync Tool**: Mock a directory of IPC handlers and verify the generated `.d.ts` structure.

### 3.2 Integration Tests (Root Project)
- Update `tsconfig.json` and Webpack/Vite configs to use the library versions via `@wuchuheng/electron-template-core`.
- Run `npm run verify` to ensure the application starts and functions correctly.

## 4. Acceptance Criteria
- [ ] Files successfully moved and re-exported from `@wuchuheng/electron-template-core`.
- [ ] Library passes all unit tests and linting.
- [ ] Root project successfully compiles using the library.
- [ ] IPC synchronization works via the new library CLI tool.
