# Migration Specification (MIGRATION_SPEC.md)

This document tracks the status of migrating template infrastructure into stable libraries.

> **CRITICAL WORKFLOW NOTICE FOR DEVELOPERS & AI AGENTS**
> 1. **AI Agents**: You are permitted to move code and mark a task as `[/]` (In Progress / Finished by Agent) once you have completed the implementation and verified it with `npm run verify`.
> 2. **AI Agents**: You MUST NOT mark a task as `[x]` (Completed).
> 3. **User / Tester**: Only the human tester is authorized to mark a task as `[x]` after successful manual verification of the published artifacts.
> 4. **Sequential Progress**: Do not begin a new task until the previous task has been approved and marked as `[x]` by the User.

**Status Legend:**
- `[ ]` : Pending / Undo (Not started or reverted)
- `[/]` : In Progress (Code migration finished by Agent, awaiting User testing)
- `[x]` : Completed (Verified and approved by User only)

---

## Package Boundaries

### 1. `@wuchuheng/electron-template-ui` (The Base)
- **Environment:** Browser/Renderer (React safe).
- **Format:** ESM only.
- **Responsibilities:** Shared types, constants, React hooks, presentational components.

### 2. `@wuchuheng/electron-template-core` (The Engine)
- **Environment:** Node.js (Main Process & CLI).
- **Format:** ESM/CJS Dual Build.
- **Responsibilities:** CLI scripts, Main process engines (Logger, Path, Database, Update logic).

---

## Migration Task List

[/] **T1: Infrastructure & Workspace Foundation**
- Initialize NPM Workspaces by adding `workspaces: ["packages/*"]` to the root `package.json`.
- Scaffold `packages/core` and `packages/ui` directories.
- Configure `tsup.config.ts` for both libraries (Core: CJS/ESM; UI: ESM).
- Setup root-level `.eslintrc.json`, `.prettierrc.json`, and `.prettierignore` for monorepo isolation.
- Implement the `verify` command in root `package.json` (Sequential Lint -> Typecheck -> Prettier -> 60s Runtime Survival Test).

[ ] **T2: Shared Infrastructure Migration (Cross-Process Logic)**
- Move `src/shared/update-types.ts` (Update status/interfaces) to UI library.
- Move `src/shared/constants.ts` (Default configs for Theme/App) to UI library.
- Move `src/shared/platform-utils.ts` (PLATFORM_MAP) to Core library.
- Move `src/shared/update-config.ts` (URL resolution logic) to Core library.
- Move `src/shared/utils.ts` (Formatting and color helpers) to UI library.
- Refactor imports in the main template to point to the correct library.

[ ] **T3: Renderer Infrastructure (Hooks & Context)**
- Move `src/renderer/context/MessageContext.ts` to UI library.
- Extract `useUpdateSystem` hook to UI library.
- Extract `useAppTheme`, `useConfig`, `useTheme`, `useMessage`, and `useHook` to UI library.
- Implement internal `(window as any).electron` bypasses within these hooks to satisfy library compilation.
- Replace local template hooks with re-exporting wrappers.

[ ] **T4: CLI & Automation Toolkit Migration**
- Move all files from `scripts/` to `packages/core/src/cli/scripts/`.
- Convert all `.js` scripts to strictly typed `.ts` files.
- Refactor script path resolution to use `process.cwd()` for template-agnostic execution.
- Enhance `sync-ipc-types` script to support both Subdirectory-Default and Root-Named export patterns.
- Configure the `electron-template-core` binary command in `packages/core/package.json`.
- Clean the root `package.json` to use the new CLI binary.

[ ] **T5: Utility Engines Extraction (Main Process)**
- Move `src/main/utils/ipc-helper.ts` (Event registry/broadcast logic) to Core library.
- Move `src/main/utils/logger.ts` (File rotation, chalk levels, log streaming) to Core library.
- Move `src/main/utils/path.util.ts` (Standardized appData/storage resolution) to Core library.
- Move `src/main/utils/i18n.ts` (Main process dot-notation translator) to Core library.
- Extract the IPC registration logic from `src/main/ipc/index.ts` into a `registerIpcModules` engine.
- Create `src/main/core.ts` in the template as the single "Hydration Point".

[ ] **T6: Lifecycle & Service Orchestration Engines**
- Extract `UpdateService` logic into a headless engine in Core library.
- Extract `BootloadService` (Task queue, progress calculation) into a headless engine in Core library.
- Extract `createWindow` infrastructure (Dev server probing, Log piping, Error handling) into a `WindowEngine` in Core library.
- Extract `app.on('ready')` logic (Single instance lock, encoding fix) into a `bootstrapApp` orchestrator in Core library.
- Extract TypeORM initialization logic into a `DatabaseEngine` in Core library.
- Extract the `window.electron` bridge logic from `src/preload/preload.ts` into an `exposeElectronApi` utility in Core library.

[ ] **T7: Standard UI Component Extraction**
- Move `UpdateDialog.tsx` to UI library and refactor it into a "dumb" props-only component.
- Move `Bootloading.tsx` (Splash screen) to UI library.
- Move `WindowControlButtons.tsx` and `WindowIcons` to UI library.
- Implement Container wrappers in the template (`src/renderer/pages/Update/index.tsx`, etc.) to connect library UI to app-level state.
- Update `src/renderer/layout/MainLayout.tsx` to use library layouts.

---

## Acceptance Criteria per Task
1. Files moved to destination.
2. Library `npm run lint` passes (Format + Lint + TypeCheck).
3. Template `npm run verify` passes:
   - Root TypeCheck passes.
   - Root Lint passes.
   - `npm run start` survives 60 seconds without errors.
4. Version bumped: `npm version beta.<n+1>`.
5. `CHANGELOG.md` updated.
6. `npm run release` executed to publish the latest changes to the submodule remotes and the remote update server.
7. **User approval received (Status changed to `[x]` by User).**
