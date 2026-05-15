# React-to-Vue 3 Migration Design

**Date:** 2025-05-15
**Status:** Draft
**Project:** Electron App Template

## Overview

Migrate the Electron App Template renderer from React 19 to Vue 3 (Composition API) with Element Plus as the UI component library. The main process, preload, and shared modules remain unchanged.

## Goals

- Replace React 19 with Vue 3 + Composition API + TypeScript
- Replace Ant Design 5 with Element Plus (UI components) + element-plus/icons-vue
- Replace react-router-dom with vue-router (Hash mode)
- Replace react-i18next with vue-i18n
- Replace React hooks with Vue composables + Pinia stores
- Replace react-markdown with vue-markdown
- Replace react-window with vue-virtual-scroller
- Replace @hello-pangea/dnd with vuedraggable
- Maintain full type safety via existing IPC type generation
- Preserve Tailwind CSS + custom CSS variable theming

## Non-Goals

- No changes to main process (`src/main/`)
- No changes to preload (`src/preload/`)
- No changes to shared modules (`src/shared/`)
- No changes to IPC type system
- No changes to build system (electron-vite remains)
- No redesign of existing UI layouts

## Dependencies

### Remove
```json
{
  "devDependencies": {
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.5",
    "@vitejs/plugin-react": "^5.1.4",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-i18next": "^15.5.2",
    "react-router-dom": "^7.6.1",
    "antd": "^5.25.4",
    "@ant-design/v5-patch-for-react-19": "^1.0.3"
  },
  "dependencies": {
    "@hello-pangea/dnd": "^18.0.1",
    "react-markdown": "^10.1.0",
    "react-window": "^2.2.7"
  }
}
```

### Add
```json
{
  "devDependencies": {
    "vue": "^3.5.x",
    "vue-router": "^4.x",
    "vue-i18n": "^10.x",
    "@vitejs/plugin-vue": "^5.x",
    "element-plus": "^2.9.x",
    "@element-plus/icons-vue": "^2.x",
    "pinia": "^2.x"
  },
  "dependencies": {
    "vue-markdown": "^2.x",
    "vue-virtual-scroller": "^2.x",
    "vuedraggable": "^4.x"
  }
}
```

### Keep (renderer-relevant)
- `tailwindcss` + `postcss` + `autoprefixer`
- `dayjs`
- `i18next` → **replaced by** `vue-i18n` (shared locales stay, only renderer binding changes)
- `changelog-parser`, `semver`, `yaml` (main process deps, untouched)

## Build Configuration

### electron.vite.config.ts
- Replace `@vitejs/plugin-react` with `@vitejs/plugin-vue`
- No other config changes needed

### tsconfig.json
- Remove `"jsx": "react-jsx"` (Vue SFCs use `.vue` files)
- Add `"vue"` to `types` array if needed for `.vue` module declarations

### tailwind.config.js
- Add `*.vue` to content glob: `['./src/**/*.{vue,js,jsx,ts,tsx}']`

## Project Structure (Renderer)

```
src/renderer/
├── assets/
├── components/
│   ├── AppAboutContent.vue      # Was AppAboutContent.tsx
│   └── WindowControlButtons.vue  # Was WindowControlButtons.tsx
├── composables/
│   ├── useAppTheme.ts            # Was hooks/useAppTheme.ts
│   ├── useConfig.ts              # Was hooks/useConfig.ts
│   ├── useMessage.ts             # Was hooks/useMessage.ts
│   └── useTheme.ts              # Was hooks/useTheme.ts
├── stores/
│   └── update.ts                 # Was hooks/useUpdateSystem.tsx
├── layouts/
│   ├── MainLayout.vue            # Was MainLayout.tsx
│   ├── Bootloading.vue           # Was Bootloading.tsx
│   └── TitleBar.vue              # Was TitleBar.tsx
├── pages/
│   ├── Home.vue                  # Was Home/Home.tsx
│   ├── About.vue                 # Was About/AboutPage.tsx
│   └── UpdateDialog.vue          # Was Update/UpdateDialog.tsx
├── router/
│   └── index.ts                  # Was config/Route.tsx
├── i18n/
│   └── index.ts                  # Was i18n/i18n.ts
├── styles/
│   └── global.css                # Unchanged
├── App.vue                       # Was App.tsx
├── main.ts                       # Was renderer.ts
└── index.html                    # Minor changes
```

## Routing

Replace React Router HashRouter with Vue Router hash mode:

```ts
// src/renderer/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/renderer/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/renderer/pages/Home.vue') },
      { path: 'about', component: () => import('@/renderer/pages/About.vue') },
    ],
  },
  {
    path: '/update-dialog',
    component: () => import('@/renderer/pages/UpdateDialog.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
```

- `<Outlet />` → `<router-view />`
- `useNavigate()` → `useRouter()`
- `useLocation()` → `useRoute()`

## i18n

Replace `react-i18next` with `vue-i18n`:

```ts
// src/renderer/i18n/index.ts
import { createI18n } from 'vue-i18n'
import { enTranslations, zhTranslations } from '@/shared/locales'

export default createI18n({
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: {
    en: enTranslations,
    zh: zhTranslations,
  },
})
```

- `useTranslation()` → `useI18n()`
- `t('key')` → `t('key')` (same API)
- `i18n.language` → `i18n.locale.value`

## State Management (Composables + Pinia)

### Stateless IPC → Composables
```ts
// src/renderer/composables/useConfig.ts
export function useConfig() {
  const getConfig = <T>(key: string) => window.electron.config.get(key) as Promise<T | null>
  const saveConfig = (key: string, value: unknown) =>
    window.electron.config.save({ key, value })
  return { getConfig, saveConfig }
}
```

### Stateful IPC → Pinia Stores
```ts
// src/renderer/stores/update.ts
export const useUpdateStore = defineStore('update', () => {
  const status = ref<UpdateState['status']>('idle')
  const info = ref<UpdateInfo | null>(null)
  // ... window.electron.update.onStatusChange(...)
})
```

### Theme → Composables
```ts
// src/renderer/composables/useAppTheme.ts
export function useAppTheme() {
  const isDarkMode = ref(false)
  // ... window.electron.config.get + matchMedia
  return { isDarkMode, toggleTheme }
}
```

## App Entry Point

```ts
// src/renderer/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import './styles/global.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(ElementPlus)
app.mount('#app')
```

## IPC Type Safety

The existing `src/types/generated-electron-api.d.ts` (generated by `scripts/sync-ipc-types.js`) provides full type definitions for `window.electron`. This file is framework-agnostic and requires no changes. Vue templates access it identically:

```vue
<script setup lang="ts">
const info = await window.electron.system.getAppInfo()
// Fully typed — autocomplete works in VS Code
</script>
```

For `.vue` file type support, `src/types/custom.d.ts` needs a Vue SFC declaration:
```ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

## Component Migration Notes

### Tailwind CSS
- All Tailwind classes work identically in Vue templates
- `className=` → `class=` (Vue uses standard HTML `class` attribute)
- Tailwind's `dark:` variant with class strategy continues working

### Element Plus Theme
- Wrap layout in `<el-config-provider>` for dark mode (maps from Ant Design's `ConfigProvider`)
- Element Plus CSS variables can be overridden in `global.css`

### SVG Icons (WindowControlButtons)
- `@ant-design/icons` → `@element-plus/icons-vue`
- Inline SVGs remain unchanged (they're just HTML)

### Message/Notification
- Ant Design's `message.useMessage()` + context → Element Plus's `ElMessage` service (import directly, no context needed)

## Migrated File Summary

**18 files to create/modify** (renderer only):

| Action | Files |
|--------|-------|
| **New** | `src/renderer/main.ts`, `src/renderer/App.vue`, `src/renderer/router/index.ts`, `src/renderer/i18n/index.ts`, `src/renderer/stores/update.ts` |
| **Rewrite** | (all .tsx → .vue files) |
| **Modify** | `electron.vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `package.json`, `src/renderer/index.html`, `src/types/custom.d.ts` |
| **Delete** | All `.tsx` + `hooks/` + `context/` dir (moved to `composables/` + `stores/`) |
| **Unchanged** | `src/main/`, `src/preload/`, `src/shared/`, `src/types/generated-electron-api.d.ts` |

## Order of Implementation

1. Update dependencies and configs (package.json, vite config, tsconfig, tailwind)
2. Create Vue entry point (main.ts, App.vue, router, i18n) with Element Plus
3. Migrate composables from hooks
4. Migrate Pinia store for update system
5. Migrate layouts (Bootloading, TitleBar, MainLayout)
6. Migrate pages (Home, About, UpdateDialog)
7. Migrate components (AppAboutContent, WindowControlButtons)
8. Delete old React files, verify build
