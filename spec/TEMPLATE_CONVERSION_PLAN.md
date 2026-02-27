# Electron App Template Conversion Plan

## Overview

This document details the plan to convert "Flow Translate" (a translation app) into a generic Electron app template by removing all business-specific logic while preserving the core infrastructure.

---

## Classification Rules

### Keep (Template Infrastructure)
- Core Electron app lifecycle
- IPC auto-discovery system
- Database layer (TypeORM + better-sqlite3)
- Window factory pattern
- Boot loading system
- Auto-update service
- System tray integration
- Global hotkey system
- Logging system
- Theme system
- i18n infrastructure
- Custom title bar
- Generic settings infrastructure

### Remove (Business Logic)
- Translation functionality
- AI/LLM integration
- Windows API helpers for automation
- Translation-specific UI components
- Translation-specific settings

---

## Detailed File Analysis

### 1. Main Process (`src/main/`)

#### Files to KEEP (Template Infrastructure)

| File | Action | Notes |
|------|--------|-------|
| `main.ts` | **Modify** | Remove translation-specific imports and logic; keep core app lifecycle |
| `database/data-source.ts` | **Keep** | Core DB infrastructure |
| `database/entities/config.entity.ts` | **Keep** | Generic key-value config storage |
| `database/entities/welcome.entity.ts` | **Delete** | Demo entity, not needed |
| `database/seed.ts` | **Modify** | Remove translation-specific seeds |
| `database/repositories/welcome.repository.ts` | **Delete** | Demo repository |
| `ipc/index.ts` | **Keep** | Auto-discovery system |
| `ipc/system/bootloading.ipc.ts` | **Keep** | Core boot loading event |
| `ipc/system/getBootloadProgressing.ipc.ts` | **Keep** | Core boot progress |
| `ipc/system/getAppInfo.ipc.ts` | **Keep** | Generic app info |
| `ipc/system/reloadHotkeys.ipc.ts` | **Keep** | Hotkey reload system |
| `ipc/config/*.ts` | **Keep** | Generic config CRUD |
| `ipc/window/*.ts` | **Keep** | Window control (close, minimize, maximize, hide, resize, onShow, openUpdate) |
| `ipc/update/*.ts` | **Keep** | Auto-update system |
| `services/bootload.service.ts` | **Keep** | Task registration system |
| `services/update.service.ts` | **Keep** | Auto-update service |
| `services/welcome.service.ts` | **Delete** | Demo service |
| `utils/logger.ts` | **Keep** | Logging system |
| `utils/tray-helper.ts` | **Keep** | System tray |
| `utils/ipc-helper.ts` | **Keep** | Event system utilities |
| `utils/win-api-helper.ts` | **Delete** | Translation-specific automation |
| `windows/windowFactory.ts` | **Modify** | Remove floating window creation; keep main and update windows |

#### Files to DELETE (Business Logic)

| File | Reason |
|------|--------|
| `ipc/translation/startTranslation.ipc.ts` | Translation core logic |
| `ipc/translation/onTranslateChunk.ipc.ts` | Translation streaming event |
| `utils/win-api-helper.ts` | Windows automation for translation paste |
| `services/welcome.service.ts` | Demo service |
| `database/entities/welcome.entity.ts` | Demo entity |
| `database/repositories/welcome.repository.ts` | Demo repository |

---

### 2. Renderer Process (`src/renderer/`)

#### Files to KEEP (Template Infrastructure)

| File | Action | Notes |
|------|--------|-------|
| `index.html` | **Keep** | Entry HTML |
| `renderer.ts` | **Keep** | Entry script |
| `App.tsx` | **Modify** | Remove translation route |
| `config/Route.tsx` | **Modify** | Remove `/flow-translate` route |
| `layout/MainLayout.tsx` | **Keep** | Main layout with theme provider |
| `layout/TitleBar.tsx` | **Keep** | Custom title bar with window controls |
| `layout/Bootloading.tsx` | **Keep** | Splash screen |
| `components/Key.tsx` | **Keep** | Keyboard key display (generic) |
| `hooks/useConfig.ts` | **Keep** | Generic config hook |
| `hooks/useAppTheme.ts` | **Keep** | Theme management |
| `hooks/useTheme.ts` | **Keep** | System theme detection |
| `hooks/useUpdateSystem.tsx` | **Keep** | Update management |
| `i18n/i18n.ts` | **Modify** | Keep infrastructure, remove translation-specific text |
| `styles/global.css` | **Keep** | Global styles with theme variables |
| `pages/Settings/` | **Modify** | Remove AI tab, keep Theme/General/About |
| `pages/Update/` | **Keep** | Update dialog |

#### Files to DELETE (Business Logic)

| File | Reason |
|------|--------|
| `pages/FlowTranslate/` | Translation UI |
| `hooks/useTranslation.ts` | Translation state management |
| `hooks/useOpenAI.ts` | OpenAI client |
| `hooks/useShortcuts.ts` | Translation-specific shortcuts (Space x3) |
| `hooks/useAutoResize.ts` | Floating window auto-resize |

---

### 3. Shared Module (`src/shared/`)

#### Files to MODIFY

| File | Action | Notes |
|------|--------|-------|
| `constants.ts` | **Modify** | Remove `AI_PROVIDER_CATALOG`, `AiConfig`, `DEFAULT_AI_CONFIG`; keep `ThemeConfig`, `AppConfig`, `CONFIG_KEYS` |
| `ipc-manifest.json` | **Regenerate** | After removing translation IPC |
| `update-types.ts` | **Keep** | Generic update types |
| `utils.ts` | **Keep** | Generic utilities (hexToRgba) |

---

### 4. Other Files

#### Root Config Files - KEEP

| File | Action |
|------|--------|
| `package.json` | **Modify** - Remove OpenAI dependency, update name/description |
| `electron.vite.config.ts` | **Keep** |
| `electron-builder.yml` | **Modify** - Update app ID/name |
| `tsconfig.json` | **Keep** |
| `.env.example` | **Modify** - Remove AI-related env vars |
| `.gitignore` | **Keep** |
| `README.md` | **Rewrite** - Template usage documentation |

#### Scripts - KEEP/MODIFY

| File | Action |
|------|--------|
| `scripts/manage.ts` | **Keep** |
| `scripts/release-update.ts` | **Keep** |
| `scripts/gen-logo.js` | **Keep** |
| `scripts/sync-ipc-types.js` (if exists) | **Keep** |

#### Spec Files - DELETE

| File | Reason |
|------|--------|
| `spec/feature_*.md` | Feature-specific specs |
| `spec/GIT_DIFF_REPORT.md` | Diff report |

#### Resources - KEEP

| Directory | Action |
|-----------|--------|
| `resources/` | **Keep** - App resources |

---

## Implementation Steps

### Phase 1: Main Process Cleanup

1. **Delete translation-related files:**
   - `src/main/ipc/translation/` (entire directory)
   - `src/main/utils/win-api-helper.ts`
   - `src/main/services/welcome.service.ts`
   - `src/main/database/entities/welcome.entity.ts`
   - `src/main/database/repositories/welcome.repository.ts`

2. **Modify `main.ts`:**
   - Remove `capturePreviousWindow` import
   - Remove floating window creation
   - Remove translation-related code
   - Keep: main window, tray, IPC handlers, update service, boot loading, global shortcuts

3. **Modify `windowFactory.ts`:**
   - Remove `createFloatingWindow` function
   - Keep `createWindow` (main) and `createUpdateWindow`

4. **Modify `seed.ts`:**
   - Remove welcome-related seeds
   - Keep minimal/generic seed data

### Phase 2: Renderer Process Cleanup

1. **Delete translation-related files:**
   - `src/renderer/pages/FlowTranslate/` (entire directory)
   - `src/renderer/hooks/useTranslation.ts`
   - `src/renderer/hooks/useOpenAI.ts`
   - `src/renderer/hooks/useShortcuts.ts`
   - `src/renderer/hooks/useAutoResize.ts`

2. **Modify routing:**
   - Remove `/flow-translate` route from `Route.tsx`

3. **Modify Settings page:**
   - Remove `AiSettingsTab.tsx`
   - Update `SettingsPage.tsx` to only have Theme/General/About tabs

4. **Modify `i18n/i18n.ts`:**
   - Keep infrastructure
   - Update translation files to remove AI/translation-specific text

### Phase 3: Shared Module Cleanup

1. **Modify `constants.ts`:**
   - Remove:
     - `AiProviderConfig` type
     - `AI_PROVIDER_CATALOG` array
     - `AiConfig` type
     - `DEFAULT_AI_CONFIG`
   - Keep:
     - `ThemeConfig` type
     - `DEFAULT_THEME_CONFIG`
     - `AppConfig` type
     - `DEFAULT_APP_CONFIG`
     - `CONFIG_KEYS` (modify to remove AI key)

2. **Regenerate `ipc-manifest.json`**

### Phase 4: Root Files Cleanup

1. **Update `package.json`:**
   - Change name to `electron-app-template`
   - Update description
   - Remove `openai` dependency
   - Update product name

2. **Update `electron-builder.yml`:**
   - Change appId
   - Change productName

3. **Update `.env.example`:**
   - Remove AI-related env vars
   - Keep update server URLs

4. **Rewrite `README.md`:**
   - Template usage documentation
   - Feature list
   - Getting started guide

5. **Delete spec files:**
   - All `spec/feature_*.md`
   - `spec/GIT_DIFF_REPORT.md`

### Phase 5: Code Quality

1. **Remove all Chinese comments**
2. **Ensure consistent code style**
3. **Update type definitions**
4. **Test the template builds successfully**

---

## Summary of Changes

### Files to Delete (29 files/directories)

**Main Process:**
- `src/main/ipc/translation/` (directory)
- `src/main/utils/win-api-helper.ts`
- `src/main/services/welcome.service.ts`
- `src/main/database/entities/welcome.entity.ts`
- `src/main/database/repositories/welcome.repository.ts`

**Renderer:**
- `src/renderer/pages/FlowTranslate/` (directory)
- `src/renderer/hooks/useTranslation.ts`
- `src/renderer/hooks/useOpenAI.ts`
- `src/renderer/hooks/useShortcuts.ts`
- `src/renderer/hooks/useAutoResize.ts`
- `src/renderer/pages/Settings/components/AiSettingsTab.tsx`

**Spec:**
- `spec/feature_background_tray.md`
- `spec/feature_settings_architecture.md`
- `spec/feature_update_feedback.md`
- `spec/GIT_DIFF_REPORT.md`

**Other deleted files (from git status):**
- `.claude`
- `forge.config.ts`
- `screenshot.png`
- `src/main/database/entities/welcom.ts` (typo version)
- `src/main/database/repositories/welcom.repository.ts` (typo version)
- `src/renderer/hools/useMessage.ts`
- `src/renderer/layout/Maylayout.tsx`
- `src/renderer/pages/About/About.tsx`
- `src/renderer/pages/Home/Home.tsx`
- `src/renderer/renderer.html`
- `webpack.main.config.ts`
- `webpack.plugins.ts`
- `webpack.renderer.config.ts`
- `webpack.rules.ts`

### Files to Modify (20+ files)

- `src/main/main.ts`
- `src/main/windows/windowFactory.ts`
- `src/main/database/seed.ts`
- `src/shared/constants.ts`
- `src/renderer/App.tsx`
- `src/renderer/config/Route.tsx`
- `src/renderer/pages/Settings/SettingsPage.tsx`
- `src/renderer/i18n/i18n.ts`
- `package.json`
- `electron-builder.yml`
- `.env.example`
- `README.md`
- And more...

---

## Template Features (What Remains)

1. **Core Infrastructure**
   - Electron app lifecycle
   - IPC auto-discovery system
   - Window factory pattern
   - Boot loading with progress

2. **Database**
   - TypeORM + better-sqlite3
   - Key-value config storage
   - Auto-migration

3. **Auto-Update**
   - electron-updater integration
   - Background download
   - Update dialog

4. **System Integration**
   - System tray
   - Global hotkeys
   - Run in background
   - Auto-start on boot

5. **UI/UX**
   - React + TypeScript
   - Custom title bar
   - Dark/Light theme
   - i18n support (English/Chinese)
   - Ant Design components
   - Tailwind CSS

6. **Developer Experience**
   - Electron Vite build
   - Hot reload
   - Logging system
   - Type-safe IPC

---

## Notes

- All Chinese comments must be removed
- Keep code comments in English only
- Ensure the template builds and runs successfully after conversion
- Update all documentation to reflect the template nature of the project