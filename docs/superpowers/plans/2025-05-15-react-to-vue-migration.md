# React-to-Vue 3 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Electron App Template renderer from React 19 to Vue 3 (Composition API + TypeScript + `<script setup>`) with Element Plus as the UI library.

**Architecture:** Framework replacement only — main process (`src/main/`), preload (`src/preload/`), and shared modules (`src/shared/`) are untouched. The renderer keeps the same IPC bridge (`window.electron`) with full type safety. Each React component file maps 1:1 to a Vue SFC or TypeScript composable.

**Tech Stack:** Vue 3.5 + TypeScript, Element Plus 2.9, vue-router 4, vue-i18n 10, Pinia 2, Tailwind CSS 3, marked (markdown), electron-vite 5.

---

## File Structure

```
src/renderer/
├── components/
│   ├── AppAboutContent.vue          # Was AppAboutContent.tsx
│   └── WindowControlButtons.vue      # Was WindowControlButtons.tsx
├── composables/                      # Was hooks/
│   ├── useAppTheme.ts
│   ├── useConfig.ts
│   ├── useMessage.ts
│   └── useTheme.ts
├── stores/
│   └── update.ts                     # Was hooks/useUpdateSystem.tsx
├── layouts/                          # Was layout/
│   ├── Bootloading.vue
│   ├── MainLayout.vue
│   └── TitleBar.vue
├── pages/
│   ├── Home.vue                      # Was pages/Home/Home.tsx
│   ├── About.vue                     # Was pages/About/AboutPage.tsx
│   └── UpdateDialog.vue              # Was pages/Update/UpdateDialog.tsx
├── router/
│   └── index.ts                      # Was config/Route.tsx
├── i18n/
│   └── index.ts                      # Was i18n/i18n.ts
├── styles/global.css                 # UNCHANGED
├── assets/                           # UNCHANGED
├── App.vue                           # Was App.tsx
├── main.ts                           # Was renderer.ts
└── index.html                        # Minor changes
```

### Files to Modify (non-renderer)

| File | Change |
|------|--------|
| `package.json` | Remove React deps, add Vue + Element Plus deps |
| `electron.vite.config.ts` | Replace `@vitejs/plugin-react` with `@vitejs/plugin-vue` |
| `tsconfig.json` | Remove `"jsx": "react-jsx"`, add Vue types |
| `tailwind.config.js` | Add `.vue` to content glob |
| `src/types/custom.d.ts` | Add `*.vue` module declaration |

### Files to Delete

`src/renderer/renderer.ts`, `App.tsx`, `config/`, `i18n/i18n.ts`, `hooks/`, `context/`, `layout/`, `pages/Home/`, `pages/About/`, `pages/Update/`, `components/AppAboutContent.tsx`, `components/WindowControlButtons.tsx`

---

### Task 1: Install dependencies and update build configuration

**Files:** `package.json`, `electron.vite.config.ts`, `tsconfig.json`, `tailwind.config.js`

- [ ] **Step 1: Update package.json**

Remove from `devDependencies`:
```json
"@types/react", "@types/react-dom", "@vitejs/plugin-react",
"react", "react-dom", "react-i18next", "react-router-dom",
"antd", "@ant-design/v5-patch-for-react-19"
```

Remove from `dependencies`:
```json
"@hello-pangea/dnd", "react-markdown", "react-window"
```

Add to `devDependencies`:
```json
"vue": "^3.5.13",
"vue-router": "^4.5.1",
"vue-i18n": "^10.0.6",
"@vitejs/plugin-vue": "^5.2.4",
"element-plus": "^2.9.9",
"@element-plus/icons-vue": "^2.3.1",
"pinia": "^2.3.1"
```

Add to `dependencies`:
```json
"marked": "^15.0.11"
```

- [ ] **Step 2: Install**

Run: `npm install`

- [ ] **Step 3: electron.vite.config.ts**

Replace `import react from '@vitejs/plugin-react'` with `import vue from '@vitejs/plugin-vue'`.
In the renderer plugins, replace `react()` with `vue()`.

- [ ] **Step 4: tsconfig.json**

Remove `"jsx": "react-jsx"`. Add `"types": ["node", "vue"]`.

- [ ] **Step 5: tailwind.config.js**

Change content glob from `['./src/**/*.{js,jsx,ts,tsx}']` to `['./src/**/*.{vue,js,jsx,ts,tsx}']`.

- [ ] **Step 6: src/types/custom.d.ts**

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}
declare module '*.png' { const value: string; export default value }
declare module '*.svg' { const value: string; export default value }
```

---

### Task 2: Create Vue entry infrastructure

**Files:** `src/renderer/main.ts`, `src/renderer/App.vue`, `src/renderer/router/index.ts`, `src/renderer/i18n/index.ts`

- [ ] **Step 1: Create src/renderer/router/index.ts**

```ts
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/renderer/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/renderer/pages/Home.vue') },
      { path: 'about', component: () => import('@/renderer/pages/About.vue') },
    ],
  },
  { path: '/update-dialog', component: () => import('@/renderer/pages/UpdateDialog.vue') },
]

export default createRouter({ history: createWebHashHistory(), routes })
```

- [ ] **Step 2: Create src/renderer/i18n/index.ts**

```ts
import { createI18n } from 'vue-i18n'
import { enTranslations, zhTranslations } from '@/shared/locales'

export default createI18n({
  legacy: false,
  locale: 'zh',
  fallbackLocale: 'zh',
  messages: { en: enTranslations, zh: zhTranslations },
})
```

- [ ] **Step 3: Create src/renderer/App.vue**

```vue
<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
<template>
  <RouterView />
</template>
```

- [ ] **Step 4: Create src/renderer/main.ts**

```ts
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

---

### Task 3: Migrate composables and Pinia store

**Files:** `src/renderer/composables/useTheme.ts`, `useConfig.ts`, `useAppTheme.ts`, `useMessage.ts`, `src/renderer/stores/update.ts`

- [ ] **Step 1: Create composables/useTheme.ts**

```ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useTheme() {
  const isDarkMode = ref(false)
  let mq: MediaQueryList | null = null

  onMounted(() => {
    mq = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode.value = mq.matches
    mq.addEventListener('change', (e: MediaQueryListEvent) => { isDarkMode.value = e.matches })
  })

  onUnmounted(() => mq?.removeEventListener('change', () => {}))

  return isDarkMode
}
```

- [ ] **Step 2: Create composables/useConfig.ts**

```ts
import { ref, readonly } from 'vue'

export function useConfig<T>(key: string, defaultValue: T) {
  const config = ref<T>(defaultValue)
  const loading = ref(true)

  window.electron.config.get(key).then((val: unknown) => {
    if (val !== null && val !== undefined) config.value = val as T
    loading.value = false
  })

  async function saveConfig(newConfig: T) {
    config.value = newConfig
    await window.electron.config.save({ key, value: newConfig as never })
  }

  return { config: readonly(config), saveConfig, loading: readonly(loading) }
}
```

- [ ] **Step 3: Create composables/useMessage.ts**

```ts
import { ElMessage } from 'element-plus'
export function useMessage() { return ElMessage }
```

- [ ] **Step 4: Create composables/useAppTheme.ts**

```ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from './useTheme'
import { CONFIG_KEYS } from '@/shared/constants'
import type { ThemeConfig } from '@/shared/constants'

export function useAppTheme() {
  const isSystemDark = useTheme()
  const theme = ref<ThemeConfig>({ mode: 'light' })
  let unsub: (() => void) | null = null

  onMounted(() => {
    window.electron.config.get(CONFIG_KEYS.THEME).then((val: unknown) => {
      if (val) theme.value = val as ThemeConfig
    })
    unsub = window.electron.config.onThemeUpdate((val: unknown) => {
      if (val) theme.value = val as ThemeConfig
    })
  })

  onUnmounted(() => unsub?.())

  const isDarkMode = computed(() =>
    theme.value.mode === 'dark' || (theme.value.mode === 'system' && isSystemDark.value)
  )

  function toggleTheme() {
    const nextMode: ThemeConfig['mode'] = isDarkMode.value ? 'light' : 'dark'
    window.electron.config.save({
      key: CONFIG_KEYS.THEME,
      value: { ...theme.value, mode: nextMode },
    } as never)
  }

  return { theme, isDarkMode, toggleTheme }
}
```

- [ ] **Step 5: Create stores/update.ts**

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UpdateState } from '@/shared/update-types'

export const useUpdateStore = defineStore('update', () => {
  const status = ref<UpdateState['status']>('idle')
  const info = ref<UpdateState['info']>(null)
  const progress = ref<UpdateState['progress']>(null)
  const error = ref<UpdateState['error']>(null)
  let unsub: (() => void) | null = null

  function init() {
    window.electron.update.getState().then((r: unknown) => {
      if (r) { const s = r as UpdateState; status.value = s.status; info.value = s.info; progress.value = s.progress; error.value = s.error }
    })
    unsub = window.electron.update.onStatusChange((r: unknown) => {
      const s = r as UpdateState; status.value = s.status; info.value = s.info; progress.value = s.progress; error.value = s.error
    })
  }

  function cleanup() { unsub?.() }

  async function checkForUpdates() { try { await window.electron.update.check() } catch { console.error('Update check failed') } }
  async function installAndRestart() { try { await window.electron.update.install() } catch (err) { throw err } }
  async function openUpdateWindow() { try { await window.electron.window.openUpdate() } catch { console.error('Failed') } }

  return { status, info, progress, error, init, cleanup, checkForUpdates, installAndRestart, openUpdateWindow }
})
```

---

### Task 4: Create leaf UI components

**Files:** `src/renderer/components/WindowControlButtons.vue`, `src/renderer/layouts/Bootloading.vue`

- [ ] **Step 1: Create components/WindowControlButtons.vue**

```vue
<script setup lang="ts">
defineProps<{ showMinimize?: boolean; showMaximize?: boolean }>()
const emit = defineEmits<{ close: []; minimize: []; maximize: [] }>()
</script>
<template>
  <div class="no-drag flex items-center space-x-1">
    <button v-if="showMinimize !== false" class="titlebar-button rounded-md p-2 transition-all duration-200 hover:bg-hover hover:text-text-primary" aria-label="Minimize" @click="emit('minimize')">
      <span class="text-text-secondary"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg></span>
    </button>
    <button v-if="showMaximize !== false" class="titlebar-button rounded-md p-2 transition-all duration-200 hover:bg-hover hover:text-text-primary" aria-label="Maximize" @click="emit('maximize')">
      <span class="text-text-secondary"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg></span>
    </button>
    <button class="titlebar-button close rounded-md p-2 transition-all duration-200 hover:bg-close-hover hover:text-close-hover-text" aria-label="Close" @click="emit('close')">
      <span class="text-text-secondary hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
    </button>
  </div>
</template>
```

- [ ] **Step 2: Create layouts/Bootloading.vue**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import packageJson from '../../../package.json'
import logo from '../assets/genLogo/icon.png'
import type { BootloadingProgressing } from '../../types/electron'

const processing = ref<BootloadingProgressing>({ progress: 0, title: '' })
const loading = ref(true)

onMounted(() => {
  console.log('Bootloading')
  window.electron.system.getBootloadProgressing().then((r: unknown) => {
    console.log('Bootload progress result:', JSON.stringify(r))
    processing.value = r as BootloadingProgressing
  })
  return window.electron.system.bootloading((v: unknown) => {
    console.log('Bootload event received:', JSON.stringify(v))
    processing.value = v as BootloadingProgressing
    if ((v as BootloadingProgressing).progress >= 100) loading.value = false
  })
})
</script>
<template>
  <template v-if="loading && processing.progress < 100">
    <div class="flex h-screen flex-col items-center justify-center gap-5">
      <img class="h-32 w-32" :src="logo" />
      <h1 class="text-3xl font-bold text-primary-600">{{ packageJson.productName }}</h1>
      <el-progress class="w-80" :percentage="processing.progress" />
    </div>
  </template>
  <slot v-else />
</template>
```

---

### Task 5: Create layout components

**Files:** `src/renderer/layouts/TitleBar.vue`, `src/renderer/layouts/MainLayout.vue`

- [ ] **Step 1: Create layouts/TitleBar.vue**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppTheme } from '../composables/useAppTheme'
import { useUpdateStore } from '../stores/update'
import { storeToRefs } from 'pinia'
import WindowControlButtons from '../components/WindowControlButtons.vue'

const emit = defineEmits<{ toggleLanguage: [] }>()
const { t } = useI18n()
const { isDarkMode, toggleTheme } = useAppTheme()
const updateStore = useUpdateStore()
const { status, info } = storeToRefs(updateStore)

function handleMinimize() { window.electron.window.minimize() }
function handleMaximize() { window.electron.window.maximize() }
function handleClose() { window.electron.window.close() }
function handleUpdateClick() {
  if (status.value === 'ready' && info.value) updateStore.openUpdateWindow()
}
</script>
<template>
  <div class="titlebar drag flex h-titlebar select-none items-center justify-between px-2 py-2 text-text-primary">
    <div class="no-drag flex items-center space-x-3">
      <span class="text-sm font-medium opacity-80">{{ t('appName') }}</span>
    </div>
    <div class="no-drag flex items-center space-x-1">
      <el-tag v-if="status === 'ready' && info" color="green" class="cursor-pointer text-xs" @click="handleUpdateClick">
        Update Ready: v{{ info.version }}
      </el-tag>
      <button class="titlebar-button rounded-md p-2 transition-all duration-200 hover:bg-hover hover:text-text-primary" aria-label="Switch Language" @click="emit('toggleLanguage')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z" fill="currentColor"/></svg>
      </button>
      <button class="titlebar-button rounded-md p-2 transition-all duration-200 hover:bg-hover hover:text-text-primary" aria-label="Toggle Theme" @click="toggleTheme">
        <svg v-if="isDarkMode" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.54 20.96 11.08 20.9 10.64C19.92 12.01 18.32 12.9 16.5 12.9C13.52 12.9 11.1 10.48 11.1 7.5C11.1 5.69 11.99 4.08 13.36 3.1C12.92 3.04 12.46 3 12 3Z" fill="currentColor"/></svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM2 13H4C4.55 13 5 12.55 5 12C5 11.45 4.55 11 4 11H2C1.45 11 1 11.45 1 12C1 12.55 1.45 13 2 13ZM20 13H22C22.55 13 23 12.55 23 12C23 11.45 22.55 11 22 11H20C19.45 11 19 11.45 19 12C19 12.55 19.45 13 20 13ZM11 2V4C11 4.55 11.45 5 12 5C12.55 5 13 4.55 13 4V2C13 1.45 12.55 1 12 1C11.45 1 11 1.45 11 2ZM11 20V22C11 22.55 11.45 23 12 23C12.55 23 13 22.55 13 22V20C13 19.45 12.55 19 12 19C11.45 19 11 19.45 11 20ZM5.99 4.58C5.6 4.19 4.96 4.19 4.58 4.58C4.19 4.97 4.19 5.61 4.58 5.99L5.64 7.05C6.03 7.44 6.67 7.44 7.05 7.05C7.44 6.66 7.44 6.02 7.05 5.64L5.99 4.58ZM18.36 16.95C17.97 16.56 17.33 16.56 16.95 16.95C16.56 17.34 16.56 17.98 16.95 18.36L18.01 19.42C18.4 19.81 19.04 19.81 19.42 19.42C19.81 19.03 19.81 18.39 19.42 18.01L18.36 16.95ZM19.42 5.99C19.81 5.6 19.81 4.96 19.42 4.58C19.03 4.19 18.39 4.19 18.01 4.58L16.95 5.64C16.56 6.03 16.56 6.67 16.95 7.05C17.34 7.44 17.98 7.44 18.36 7.05L19.42 5.99ZM7.05 18.36C7.44 17.97 7.44 17.33 7.05 16.95C6.66 16.56 6.02 16.56 5.64 16.95L4.58 18.01C4.19 18.4 4.19 19.04 4.58 19.42C4.97 19.81 5.61 19.81 5.99 19.42L7.05 18.36Z" fill="currentColor"/></svg>
      </button>
      <WindowControlButtons @close="handleClose" @minimize="handleMinimize" @maximize="handleMaximize" />
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create layouts/MainLayout.vue**

```vue
<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppTheme } from '../composables/useAppTheme'
import TitleBar from './TitleBar.vue'
import Bootloading from './Bootloading.vue'
import { storeToRefs } from 'pinia'
import { useUpdateStore } from '../stores/update'

const route = useRoute()
const { i18n } = useI18n()
const { isDarkMode } = useAppTheme()
const updateStore = useUpdateStore()
updateStore.init()

const isUpdateDialog = computed(() => route.path.includes('/update-dialog'))

function onToggleLanguage() {
  const newLang = i18n.locale.value.startsWith('en') ? 'zh' : 'en'
  i18n.locale.value = newLang
}
</script>
<template>
  <el-config-provider :locale="isDarkMode ? undefined : undefined">
    <div :class="['flex h-screen flex-col bg-background-primary transition-colors duration-300']">
      <TitleBar v-if="!isUpdateDialog" @toggle-language="onToggleLanguage" />
      <main class="flex-1 overflow-y-auto">
        <Bootloading v-if="!isUpdateDialog">
          <RouterView />
        </Bootloading>
        <RouterView v-else />
      </main>
    </div>
  </el-config-provider>
</template>
```

---

### Task 6: Create AppAboutContent component

**Files:** `src/renderer/components/AppAboutContent.vue`

- [ ] **Step 1: Create components/AppAboutContent.vue**

```vue
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUpdateStore } from '../stores/update'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { formatBytes, formatSpeed } from '@/shared/update-types'
import logo from '@/renderer/assets/genLogo/icon.png'

interface AppInfo { name: string; version: string; description: string; author: string; website: string }

const props = withDefaults(defineProps<{ showTitle?: boolean; bordered?: boolean; className?: string }>(), {
  showTitle: true, bordered: true, className: '',
})

const { t } = useI18n()
const updateStore = useUpdateStore()
const { status, info: updateInfo, progress, error } = storeToRefs(updateStore)

const appInfo = ref<AppInfo | null>(null)
const loading = ref(true)
const lastCheckTime = ref<number | null>(null)

onMounted(() => {
  window.electron.system.getAppInfo().then((r: unknown) => {
    appInfo.value = r as AppInfo
    loading.value = false
  })
})

watch(error, (err) => {
  if (err) ElMessage.error(t('about.error') + ': ' + err)
})

async function handleCheckUpdate() {
  lastCheckTime.value = Date.now()
  try { await updateStore.checkForUpdates() } catch { ElMessage.error(t('about.error')) }
}

async function handleInstall() {
  try { await updateStore.installAndRestart() } catch { ElMessage.error(t('update.error')) }
}

const isLatest = computed(() => status.value === 'idle' && lastCheckTime.value !== null)
</script>
<template>
  <div v-if="loading" class="flex h-full items-center justify-center p-8">
    <el-skeleton :loading="loading" animated />
  </div>
  <div v-else :class="['mx-auto max-w-2xl', className]">
    <div :class="['rounded-2xl p-8', bordered ? 'border-border border bg-background-secondary shadow-sm' : 'bg-transparent']">
      <div class="mb-8 text-center">
        <div class="mb-4 inline-block rounded-3xl bg-background-primary p-4 shadow-inner">
          <img :src="logo" alt="Logo" class="h-20 w-20 object-contain" />
        </div>
        <h2 v-if="showTitle" class="mb-1 text-2xl font-bold text-text-primary">{{ appInfo?.name || t('appName') }}</h2>
        <el-space>
          <el-tag>{{ 'v' + appInfo?.version }}</el-tag>
          <el-badge v-if="isLatest" is-dot type="success">
            <el-text type="success" size="small">{{ t('about.latest') }}</el-text>
          </el-badge>
        </el-space>
      </div>

      <div class="mb-10 flex flex-col items-center">
        <div class="border-border w-full max-w-md rounded-xl border bg-background-primary p-6">
          <!-- Update ready state -->
          <div v-if="status === 'ready' && updateInfo" class="text-center">
            <el-text class="mb-4 block font-medium">{{ t('about.ready') }} (v{{ updateInfo.version }})</el-text>
            <el-button type="primary" size="large" class="w-full h-12 text-lg" @click="handleInstall">
              {{ t('about.restartBtn') }}
            </el-button>
          </div>
          <!-- Downloading state -->
          <div v-else-if="status === 'downloading'" class="w-full">
            <div class="mb-2 flex items-end justify-between">
              <el-text type="primary" tag="strong">{{ t('about.downloading') }}</el-text>
              <el-text type="secondary" size="small">{{ progress?.percent }}%</el-text>
            </div>
            <el-progress :percentage="progress?.percent || 0" :stroke-color="['#14b8a6', '#2dd4bf']" />
            <div class="mt-3 flex justify-between px-1">
              <div><el-text type="secondary" size="small">{{ t('about.speed', { speed: '' }) }}</el-text><br /><el-text class="font-mono text-xs">{{ formatSpeed(progress?.bytesPerSecond) }}</el-text></div>
              <div class="text-right"><el-text type="secondary" size="small">{{ t('about.description') }}</el-text><br /><el-text class="font-mono text-xs">{{ formatBytes(progress?.transferred || 0) }} / {{ formatBytes(progress?.total || 0) }}</el-text></div>
            </div>
          </div>
          <!-- Idle state -->
          <div v-else class="text-center">
            <el-button :loading="status === 'checking'" @click="handleCheckUpdate" type="primary" plain size="large" class="px-8">
              {{ status === 'checking' ? t('about.checking') : t('about.checkUpdates') }}
            </el-button>
            <div v-if="isLatest" class="mt-3"><el-text type="secondary" size="small" tag="i">{{ t('update.latest') }}</el-text></div>
          </div>
        </div>
      </div>

      <el-divider dashed />

      <div class="space-y-4 px-4">
        <p v-if="appInfo?.description" class="text-center italic leading-relaxed text-text-secondary">{{ appInfo.description }}</p>
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <span v-if="appInfo?.author" class="text-text-secondary">{{ appInfo.author }}</span>
          <span v-if="appInfo?.website" class="text-text-secondary">
            <a href="#" @click.prevent="window.open(appInfo.website, '_blank')" class="text-primary-500 hover:text-primary-400 hover:underline">{{ t('about.website') || 'Website' }}</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
```

---

### Task 7: Create page components

**Files:** `src/renderer/pages/Home.vue`, `src/renderer/pages/About.vue`, `src/renderer/pages/UpdateDialog.vue`

- [ ] **Step 1: Create pages/Home.vue**

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import logo from '../assets/genLogo/icon.png'

const router = useRouter()
const { t } = useI18n()

const features = [
  { icon: 'el-icon-thunderbolt', title: t('homepage.features.zeroConfigIpc.title'), desc: t('homepage.features.zeroConfigIpc.desc') },
  { icon: 'el-icon-rocket', title: t('homepage.features.autoUpdate.title'), desc: t('homepage.features.autoUpdate.desc') },
  { icon: 'el-icon-skin', title: t('homepage.features.themeSystem.title'), desc: t('homepage.features.themeSystem.desc') },
  { icon: 'el-icon-database', title: t('homepage.features.localDatabase.title'), desc: t('homepage.features.localDatabase.desc') },
  { icon: 'el-icon-apple', title: t('homepage.features.systemTray.title'), desc: t('homepage.features.systemTray.desc') },
  { icon: 'el-icon-refresh', title: t('homepage.features.hotReload.title'), desc: t('homepage.features.hotReload.desc') },
  { icon: 'el-icon-loading', title: t('homepage.features.bootLoading.title'), desc: t('homepage.features.bootLoading.desc') },
  { icon: 'el-icon-tools', title: t('homepage.features.framelessWindow.title'), desc: t('homepage.features.framelessWindow.desc') },
  { icon: 'el-icon-global', title: t('homepage.features.i18nSupport.title'), desc: t('homepage.features.i18nSupport.desc') },
]

const techStack = ['Electron 36', 'Vite 7', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'Element Plus', 'TypeORM', 'better-sqlite3', 'electron-updater', 'vue-i18n']
</script>
<template>
  <div class="h-full overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 p-8 dark:from-[#0f0f1a] dark:to-[#1a1a2e]">
    <div class="mx-auto max-w-6xl space-y-8">
      <div class="flex justify-end">
        <el-button @click="router.push('/about')">{{ t('common.about') }}</el-button>
      </div>

      <div class="text-center">
        <div class="mb-4 inline-flex items-center gap-3">
          <img :src="logo" alt="Logo" class="h-16 w-16 object-contain drop-shadow-lg" />
        </div>
        <h1 class="mb-2 text-4xl font-bold dark:text-white">{{ t('homepage.title') }}</h1>
        <p class="mb-6 text-lg text-gray-600 dark:text-gray-400">{{ t('homepage.subtitle') }}</p>
      </div>

      <el-divider />

      <div class="grid gap-6 md:grid-cols-2">
        <el-card shadow="lg" class="overflow-hidden rounded-xl border-none dark:!bg-[#16162a]">
          <template #header><span class="flex items-center gap-2">{{ t('homepage.quickStart.title') }}</span></template>
          <div class="space-y-3 font-mono text-sm">
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <el-text type="secondary"># {{ t('homepage.quickStart.installDeps') }}</el-text><br />
              <el-tag>npm install</el-tag>
            </div>
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <el-text type="secondary"># {{ t('homepage.quickStart.startDev') }}</el-text><br />
              <el-tag>npm start</el-tag>
            </div>
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <el-text type="secondary"># {{ t('homepage.quickStart.buildProd') }}</el-text><br />
              <el-tag>npm run build</el-tag>
            </div>
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <el-text type="secondary"># {{ t('homepage.quickStart.package') }}</el-text><br />
              <el-tag>npm run package</el-tag>
            </div>
          </div>
        </el-card>

        <el-card shadow="lg" class="overflow-hidden rounded-xl border-none dark:!bg-[#16162a]">
          <template #header><span class="flex items-center gap-2">{{ t('homepage.ipc.title') }}</span></template>
          <div class="space-y-2 font-mono text-xs">
            <el-text type="secondary">// {{ t('homepage.ipc.step1') }}</el-text>
            <div class="rounded bg-gray-100 p-2 dark:bg-gray-800"><el-tag type="info">src/main/ipc/user/get.ipc.ts</el-tag></div>
            <el-text type="secondary">// {{ t('homepage.ipc.step2') }}</el-text>
            <div class="rounded bg-gray-100 p-2 dark:bg-gray-800">
              <el-tag type="info">export default async (id: string) =&gt; {</el-tag><br />
              <el-tag type="info">&nbsp;&nbsp;return await db.findOne(id);</el-tag><br />
              <el-tag type="info">}</el-tag>
            </div>
            <el-text type="secondary">// {{ t('homepage.ipc.step3') }}</el-text>
            <div class="rounded bg-gray-100 p-2 dark:bg-gray-800"><el-tag type="info">npm run ipc:sync</el-tag></div>
            <el-text type="secondary">// {{ t('homepage.ipc.step4') }}</el-text>
            <div class="rounded bg-gray-100 p-2 dark:bg-gray-800"><el-tag type="info">const user = await window.electron.user.get('123');</el-tag></div>
          </div>
        </el-card>
      </div>

      <el-card shadow="lg" class="overflow-hidden rounded-xl border-none dark:!bg-[#16162a]">
        <template #header><span class="flex items-center gap-2 text-xl">{{ t('homepage.features.title') }}</span></template>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="(feature, index) in features" :key="index" class="flex items-start gap-3 rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
            <div class="flex-shrink-0">#</div>
            <div>
              <el-text tag="strong" class="block dark:text-white">{{ feature.title }}</el-text>
              <el-text type="secondary" size="small">{{ feature.desc }}</el-text>
            </div>
          </div>
        </div>
      </el-card>

      <div class="grid gap-6 md:grid-cols-2">
        <el-card shadow="lg" class="overflow-hidden rounded-xl border-none dark:!bg-[#16162a]">
          <template #header><span class="flex items-center gap-2">{{ t('homepage.projectStructure.title') }}</span></template>
          <div class="font-mono text-sm">
            <div class="space-y-1 text-gray-700 dark:text-gray-300">
              <div><el-tag type="info">src/</el-tag></div>
              <div class="pl-4"><el-tag>├── main/</el-tag><el-text type="secondary"> # {{ t('homepage.projectStructure.mainProcess') }}</el-text></div>
              <div class="pl-8"><el-tag type="info">│ ├── ipc/</el-tag><el-text type="secondary"> # {{ t('homepage.projectStructure.ipcHandlers') }}</el-text></div>
              <div class="pl-8"><el-tag type="info">│ ├── services/</el-tag><el-text type="secondary"> # {{ t('homepage.projectStructure.services') }}</el-text></div>
              <div class="pl-8"><el-tag type="info">│ └── database/</el-tag><el-text type="secondary"> # {{ t('homepage.projectStructure.database') }}</el-text></div>
              <div class="pl-4"><el-tag type="info">├── preload/</el-tag><el-text type="secondary"> # {{ t('homepage.projectStructure.preload') }}</el-text></div>
              <div class="pl-4"><el-tag type="info">├── renderer/</el-tag><el-text type="secondary"> # {{ t('homepage.projectStructure.renderer') }}</el-text></div>
              <div class="pl-4"><el-tag type="info">└── shared/</el-tag><el-text type="secondary"> # {{ t('homepage.projectStructure.shared') }}</el-text></div>
            </div>
          </div>
        </el-card>

        <el-card shadow="lg" class="overflow-hidden rounded-xl border-none dark:!bg-[#16162a]">
          <template #header><span class="flex items-center gap-2">{{ t('homepage.techStack.title') }}</span></template>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="(tech, index) in techStack" :key="index" type="primary" effect="plain">{{ tech }}</el-tag>
          </div>
          <el-divider class="!my-4" />
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p class="mb-2">{{ t('homepage.techStack.description1') }}</p>
            <p class="mb-0">{{ t('homepage.techStack.description2') }}</p>
          </div>
        </el-card>
      </div>

      <div class="text-center text-sm text-gray-500 dark:text-gray-400">
        <el-text type="secondary">{{ t('common.madeWith') }}</el-text>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Create pages/About.vue**

```vue
<script setup lang="ts">
import AppAboutContent from '../components/AppAboutContent.vue'
</script>
<template>
  <div class="h-full overflow-auto bg-background-primary p-8">
    <AppAboutContent />
  </div>
</template>
```

- [ ] **Step 3: Create pages/UpdateDialog.vue**

```vue
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUpdateStore } from '../stores/update'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { formatBytes, formatReleaseNotes } from '@/shared/update-types'
import dayjs from 'dayjs'
import WindowControlButtons from '../components/WindowControlButtons.vue'

const { t } = useI18n()
const updateStore = useUpdateStore()
const { status, info, error } = storeToRefs(updateStore)
const isRestarting = ref(false)

onMounted(() => {
  const appName = t('appName')
  document.title = t('update.windowTitle', { appName })
})

watch(error, (err) => {
  if (err) ElMessage.error(t('update.error'))
})

async function handleRestart() {
  if (isRestarting.value) return
  isRestarting.value = true
  try { await updateStore.installAndRestart() } catch { isRestarting.value = false; ElMessage.error(t('update.error')) }
}

function handleClose() { window.electron.window.hide() }

function renderMarkdown(notes: string) {
  return marked(formatReleaseNotes(notes))
}
</script>
<template>
  <template v-if="status !== 'ready' || !info">
    <div class="flex h-screen items-center justify-center bg-background-primary text-text-secondary">
      {{ t('update.loading') }}
    </div>
  </template>
  <template v-else>
    <div class="flex h-screen flex-col overflow-hidden border border-gray-100 bg-background-primary dark:border-gray-800">
      <div class="titlebar drag flex h-titlebar select-none items-center justify-end px-2 py-2 text-text-primary">
        <WindowControlButtons :show-minimize="false" :show-maximize="false" @close="handleClose" />
      </div>
      <div class="flex min-h-0 flex-1 flex-col p-6 pt-0">
        <div class="no-drag mb-2 text-center">
          <div class="mb-2 inline-block rounded-full bg-green-500/10 p-3">
            <el-icon class="text-4xl text-green-500"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2"/></svg></el-icon>
          </div>
          <div>
            <h4 class="m-0 text-lg font-semibold">{{ t('update.title') }}</h4>
            <el-tag type="primary" class="mt-1">{{ t('update.newVersion', { version: info.version }) }}</el-tag>
          </div>
        </div>
        <el-divider style="margin: 12px 0" />
        <div class="no-drag mb-4 flex items-center justify-around rounded-lg bg-background-secondary p-3">
          <el-space><el-text type="secondary">{{ formatBytes(info.files?.[0]?.size || 0) }}</el-text></el-space>
          <el-divider direction="vertical" />
          <el-space><el-text type="secondary">{{ dayjs(info.releaseDate).format('YYYY-MM-DD') }}</el-text></el-space>
        </div>
        <div class="no-drag mb-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="border-b border-gray-200 bg-background-secondary px-4 py-2 dark:border-gray-700">
            <el-text tag="strong" size="small" class="uppercase tracking-wider">{{ t('update.releaseNotes') }}</el-text>
          </div>
          <div class="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 flex-1 overflow-y-auto bg-white/50 p-4 dark:bg-black/10">
            <div class="prose prose-sm dark:prose-invert max-w-none text-text-secondary" v-html="renderMarkdown(info.releaseNotes || '')"></div>
          </div>
        </div>
        <div v-if="error" class="no-drag mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{{ error }}</div>
        <div class="no-drag mt-auto pb-6 pt-4">
          <el-button type="primary" size="large" class="w-full h-12 text-base" :loading="isRestarting" @click="handleRestart">
            {{ t('update.restartBtn') }}
          </el-button>
          <div class="mt-2 text-center text-xs text-gray-400">{{ t('update.restarting') }}</div>
        </div>
      </div>
    </div>
  </template>
</template>
```

---

### Task 8: Clean up and verify build

**Files:** Delete old React files

- [ ] **Step 1: Delete old React renderer files**

Delete these files/directories:
```bash
rm -f src/renderer/renderer.ts
rm -f src/renderer/App.tsx
rm -rf src/renderer/config
rm -f src/renderer/i18n/i18n.ts
rm -rf src/renderer/hooks
rm -rf src/renderer/context
rm -rf src/renderer/layout
rm -rf src/renderer/pages/About
rm -rf src/renderer/pages/Home
rm -rf src/renderer/pages/Update
rm -f src/renderer/components/AppAboutContent.tsx
rm -f src/renderer/components/WindowControlButtons.tsx
```

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors. If errors occur, fix them.

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: Lint passes. Fix any auto-fixable issues with `npm run lint -- --fix`.

- [ ] **Step 4: Start dev server and verify**

Run: `npm start`
Expected: Electron app launches with Vue 3 + Element Plus renderer. All pages (Home, About, Update) render correctly. Dark mode toggle works. Language toggle works.

---

## Self-Review Checklist

1. **Spec coverage:** Every spec requirement has a corresponding task — deps, config, entry point, routing, i18n, composables, store, all components, all pages, cleanup.
2. **No placeholders:** All code blocks are complete Vue SFCs with real imports and logic.
3. **Type consistency:** Pinia store uses `storeToRefs` consistently. Composables use `ref`/`computed` consistently. All IPC calls keep their original signatures.
4. **Scope:** Renderer-only migration. No main/preload/shared changes.
