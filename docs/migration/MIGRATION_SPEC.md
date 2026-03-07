# Migration Specification (MIGRATION_SPEC.md)

This document tracks the status of migrating template infrastructure into stable libraries.

## 1. Migration Philosophy

### Why was this done?

This migration was initiated to protect the "Kernel" of the Electron App Template from the risks of AI-assisted development. By extracting critical infrastructure into standalone libraries, we create a physical and architectural boundary that prevents accidental corruption of stable code.

### Problems Solved:

- **Blast Radius**: Prevents accidental corruption of the Update System or Database logic while editing UI features.
- **Environment Pollution**: Physically separates Node.js logic from Browser/React logic at the build level.
- **Maintenance**: Standardizes build tools and engines across all projects cloned from this template.

### Benefits Brought:

- **Immutability**: Core engines are sealed and versioned.
- **Strict Verification**: Every change must pass automated unit tests and a 60s runtime survival test.
- **Portability**: The kernel can be improved once and updated everywhere.

---

> **CRITICAL WORKFLOW NOTICE FOR DEVELOPERS & AI AGENTS**
>
> 1. **AI Agents**: You are permitted to move code and mark a task as `[/]` (Finished by Agent) only after implementing the logic, passing library tests, and passing the `npm run verify` pipeline.
> 2. **AI Agents**: You MUST NOT mark a task as `[x]` (Completed). Only the User/Tester can do this.
> 3. **Sequential Progress**: Do not begin a new task until the previous task has been approved (`[x]`).
> 4. **Ambiguity Rule**: If you have trouble understanding a task or encounter a divergence in the problem-solving path, you **MUST STOP** and ask for clarification.
> 5. **Specification Rule**: You MUST generate a specification document explaining your solution. Do not implement anything until the User has explicitly approved the specification.
> 6. **Active Use Analysis**: You must analyze if code is truly "Kernel" code (immutable/core) and in **active use**. Useless or redundant code must be removed, not migrated.
> 7. **Strict Type Rule**: No `any` types are allowed in public library interfaces. Use `unknown` or specific generic constraints.
> 8. **Dual-Build Rule**: Core library changes must be verified against both ESM (Vite/Preload) and CJS (Main process) build outputs.
> 9. **Cleanup Rule**: Redundant logic must be identified and removed during the analysis phase of each task.

---

**Status Legend:**

- `[ ]` : Pending / Undo
- `[/]` : In Progress (Finished by Agent, awaiting User approval)
- `[x]` : Completed (Verified and approved by User only)

---

## Migration Task List

[x] **T1: Infrastructure & Workspace Foundation**

- **Goal**: Establish the monorepo plumbing and the unit testing framework.
- **Rationale**: Physical isolation is the only way to prevent AI from accidentally modifying core files.
- **Destination**: Root project and `packages/*`.
- **Analysis**: Kernel: Workspace config, Vitest setup, tsup config. Developer Scope: verify scripts.
- **Items**:
  - Initialize NPM Workspaces.
  - Setup `tsup` for CJS/ESM dual-builds.
  - Install and configure **Vitest** for both sub-packages.
  - Implement root `npm run verify` (Lint + Tests + 60s Survival Test).
- **Attention**: Ensure `tsup` is correctly configured to produce separate `dist` folders for each environment.
- **Reference**: Managed via NPM Workspaces. Root `package.json` delegates to sub-packages.
- **Testing Guide**:
  - **Unit Test**: Run `npm run test --workspaces`. Must confirm that Vitest can execute a basic `expect(1+1).toBe(2)` in both `core` and `ui` packages.
  - **Integration**: Verify `dist` folders are created in each package after `npm run build`.

[/] **T2: Fundamental Utility & IPC Engines (Core)**

- **Goal**: Extract the low-level "Main Process" plumbing and the complete IPC machinery.
- **Rationale**: Standardizes how every app handles logs, directories, and IPC communication. Merging the generator and bridge prevents dependency loops.
- **Destination**: `packages/core`.
- **Analysis**: Kernel: IPC helper (broadcasting), **IPC Sync Script (Manifest Generator)**, Logger machinery, Path standardization logic, I18n engine. Developer Scope: Log levels, locale dictionaries.
- **Items**:
  - Move `ipc-helper.ts`, `logger.ts`, `path.util.ts`, `i18n.ts`.
  - Extract Preload Bridge logic to `exposeElectronApi` utility.
  - **Move `sync-ipc-types.js` logic into the Core CLI toolkit**.
- **Attention**: Maintain strict separation between the "Log Engine" and the "Log Destination".
- **Reference**: Template uses `src/main/core.ts` to initialize and export library engines.
- **Testing Guide**:
  - **Logger Test**: Mock `fs` and verify that calling `logger.info('test')` results in a file write with the correct timestamp and level.
  - **Path Test**: Verify `getPaths()` returns the expected directory structure based on a mocked `app.getPath('appData')`.
  - **IPC Generator Test**: Verify that the sync tool correctly parses a mock IPC directory and outputs a valid `.d.ts` file.

[ ] **T3: Shared Types & Constants (UI)**

- **Goal**: Isolate data structures to prevent Node.js pollution in the renderer.
- **Rationale**: Prevents the browser from crashing when importing simple constants.
- **Destination**: `packages/ui`.
- **Analysis**: Kernel: `UpdateStatus` types, PLATFORM_MAP, generic formatting utils. Developer Scope: Default theme values.
- **Items**:
  - Move `shared/update-types.ts`, `shared/constants.ts`, and `shared/utils.ts`.
- **Attention**: The UI library MUST NOT import anything from `packages/core` that contains Node built-ins.
- **Reference**: Template project imports types/constants via `@wuchuheng/electron-template-core-ui`.
- **Testing Guide**:
  - **Isolation Test**: Create a test that imports these constants and verify it can run in a pure `jsdom` environment without failing on Node.js-only modules like `fs` or `electron`.
  - **Util Test**: Verify `hexToRgba` converts various hex formats to accurate RGBA strings.

[ ] **T4: The Update System (Feature Extraction)**

- **Goal**: Secure the most critical feature of the application.
- **Rationale**: This is the application's "Umbilical Cord." It must be isolated and unit-tested exhaustively.
- **Destination**: Both libraries (Logic in Core, Hooks in UI).
- **Analysis**: Kernel: `electron-updater` integration, release script logic, changelog parsing. Developer Scope: Update URLs, SSH keys.
- **Items**:
  - Move `update.service.ts` and `update-config.ts` to Core.
  - Move `release-update.ts` and `change-log.ts` scripts to Core CLI.
  - Move `useUpdateSystem` hook to UI.
- **Attention**: Refactor `UpdateDialog` to be "Dumb" (props-only) to avoid Node.js pollution in the library.
- **Reference**: Template re-exports hooks from the library.
- **Testing Guide**:
  - **Service Test**: Mock `electron-updater`'s `autoUpdater`. Simulate an `update-available` event and verify the service's internal state updates to `downloading` and triggers the `onStatusChange` callback.
  - **Hook Test**: (Vitest + React Testing Library) Verify that `useUpdateSystem` correctly calls `window.electron.update.getState()` on mount.

[ ] **T5: CLI & Developer Scaffolding**

- **Goal**: Standardize the development experience across projects.
- **Rationale**: Developers should get build tool improvements via a simple package update.
- **Destination**: `packages/core`.
- **Analysis**: Kernel: Scaffolding templates, Build orchestration logic. Developer Scope: App name syncing.
- **Items**:
  - Move `ipc-gen.js`, `manage.ts`, and `sync-app-name.ts` to Core CLI.
- **Attention**: Refactor all scripts to use `process.cwd()` instead of `__dirname` so they operate on the user's project, not the library folder.
- **Reference**: Root `package.json` calls `electron-template-core <command>`.
- **Testing Guide**:
  - **CLI Scaffolder Test**: Run the `gen-ipc` command and verify a boilerplate file is created in the correct location.

[ ] **T6: Lifecycle & Database Engines**

- **Goal**: Abstract Electron boilerplate and database connections.
- **Rationale**: The bootstrap sequence (Single instance, encoding fix, bootloading) is boilerplate that developers should never touch.
- **Destination**: `packages/core`.
- **Analysis**: Kernel: Bootload task runner, TypeORM initialization, Single-instance lock. Developer Scope: Entities, Startup tasks.
- **Items**:
  - Move `bootstrapApp` lifecycle logic.
  - Move `createDatabaseEngine` logic.
- **Attention**: Use "Inversion of Control" (callbacks) to allow the library to handle logic while the app handles specific UI responses.
- **Reference**: `main.ts` calls `bootstrapApp({ ... })` from the library.
- **Testing Guide**:
  - **Lifecycle Test**: Mock `electron.app` and verify that `bootstrapApp` correctly registers `ready` and `second-instance` listeners.
  - **DB Test**: Verify `createDatabaseEngine` correctly assembles a TypeORM `DataSourceOptions` object from the provided entities and paths.

[ ] **T7: Standard UI Components**

- **Goal**: Standardize the professional template visuals.
- **Rationale**: Every app based on this template should have a professional, standard "Out of Box" experience.
- **Destination**: `packages/ui`.
- **Analysis**: Kernel: Layouts, Animations, Icons. Developer Scope: Brand logo, specific text.
- **Items**:
  - Move `UpdateDialog.tsx`, `Bootloading.tsx`, `WindowControlButtons.tsx`.
- **Attention**: Refactor components to be "Dumb" (props-only). They should not have internal side-effects or dependencies on global state.
- **Reference**: Template uses "Container" components to connect library UI to local hooks.
- **Testing Guide**:
  - **Component Test**: (Vitest + React Testing Library) Render `UpdateDialog` with a mock `status="ready"`. Verify that the "Restart Now" button is visible and that clicking it triggers the `onRestart` prop function.
  - **Snapshot Test**: Use Vitest snapshots to ensure the visual structure of the Splash screen doesn't change unexpectedly.

---

## Acceptance Criteria per Task

1. Files moved and unit tests created in library (`packages/<name>/src/__tests__`).
2. Library `npm run lint` and `npm run test` passes.
3. Template `npm run verify` passes:
   - Root TypeCheck passes.
   - Root Lint passes.
   - `npm run start` survives 60 seconds without errors.
4. Submodule commit pointer updated in root project.
5. Version bumped, `CHANGELOG.md` updated, and `npm run release` executed from root.
6. **User approval received (User marks task as `[x]`).**
