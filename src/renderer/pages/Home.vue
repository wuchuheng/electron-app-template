<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import logo from '../assets/genLogo/icon.png'

const router = useRouter()
const { t } = useI18n()

const features = [
  { title: t('homepage.features.zeroConfigIpc.title'), desc: t('homepage.features.zeroConfigIpc.desc') },
  { title: t('homepage.features.autoUpdate.title'), desc: t('homepage.features.autoUpdate.desc') },
  { title: t('homepage.features.themeSystem.title'), desc: t('homepage.features.themeSystem.desc') },
  { title: t('homepage.features.localDatabase.title'), desc: t('homepage.features.localDatabase.desc') },
  { title: t('homepage.features.systemTray.title'), desc: t('homepage.features.systemTray.desc') },
  { title: t('homepage.features.hotReload.title'), desc: t('homepage.features.hotReload.desc') },
  { title: t('homepage.features.bootLoading.title'), desc: t('homepage.features.bootLoading.desc') },
  { title: t('homepage.features.framelessWindow.title'), desc: t('homepage.features.framelessWindow.desc') },
  { title: t('homepage.features.i18nSupport.title'), desc: t('homepage.features.i18nSupport.desc') },
]

const techStack = ['Electron 36', 'Vite 7', 'Vue 3', 'TypeScript', 'Tailwind CSS', 'Element Plus', 'TypeORM', 'better-sqlite3', 'electron-updater', 'vue-i18n']
</script>

<template>
  <div class="h-full overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 p-8 dark:from-[#0f0f1a] dark:to-[#1a1a2e]">
    <div class="mx-auto max-w-6xl space-y-8">
      <!-- About Link -->
      <div class="flex justify-end">
        <el-button @click="router.push('/about')">
          {{ t('common.about') }}
        </el-button>
      </div>

      <!-- Hero Section -->
      <div class="text-center">
        <div class="mb-4 inline-flex items-center gap-3">
          <img :src="logo" alt="Logo" class="h-16 w-16 object-contain drop-shadow-lg" />
        </div>
        <h1 class="mb-2 text-4xl font-bold dark:text-white">{{ t('homepage.title') }}</h1>
        <p class="mb-6 text-lg text-gray-600 dark:text-gray-400">{{ t('homepage.subtitle') }}</p>
      </div>

      <el-divider />

      <!-- Quick Start + IPC -->
      <div class="grid gap-6 md:grid-cols-2">
        <el-card class="overflow-hidden rounded-xl border-none dark:!bg-[#16162a]">
          <template #header>
            <span class="flex items-center gap-2">{{ t('homepage.quickStart.title') }}</span>
          </template>
          <div class="space-y-3 font-mono text-sm">
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <el-text class="text-text-secondary"># {{ t('homepage.quickStart.installDeps') }}</el-text><br />
              <el-tag>npm install</el-tag>
            </div>
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <el-text class="text-text-secondary"># {{ t('homepage.quickStart.startDev') }}</el-text><br />
              <el-tag>npm start</el-tag>
            </div>
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <el-text class="text-text-secondary"># {{ t('homepage.quickStart.buildProd') }}</el-text><br />
              <el-tag>npm run build</el-tag>
            </div>
            <div class="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
              <el-text class="text-text-secondary"># {{ t('homepage.quickStart.package') }}</el-text><br />
              <el-tag>npm run package</el-tag>
            </div>
          </div>
        </el-card>

        <el-card class="overflow-hidden rounded-xl border-none dark:!bg-[#16162a]">
          <template #header>
            <span class="flex items-center gap-2">{{ t('homepage.ipc.title') }}</span>
          </template>
          <div class="space-y-2 font-mono text-xs">
            <el-text class="text-text-secondary">// {{ t('homepage.ipc.step1') }}</el-text>
            <div class="rounded bg-gray-100 p-2 dark:bg-gray-800">
              <el-tag type="info">src/main/ipc/user/get.ipc.ts</el-tag>
            </div>
            <el-text class="text-text-secondary">// {{ t('homepage.ipc.step2') }}</el-text>
            <div class="rounded bg-gray-100 p-2 dark:bg-gray-800">
              <el-tag type="info">export default async (id: string) =&gt; {</el-tag><br />
              <el-tag type="info">&nbsp;&nbsp;return await db.findOne(id);</el-tag><br />
              <el-tag type="info">}</el-tag>
            </div>
            <el-text class="text-text-secondary">// {{ t('homepage.ipc.step3') }}</el-text>
            <div class="rounded bg-gray-100 p-2 dark:bg-gray-800">
              <el-tag type="info">npm run ipc:sync</el-tag>
            </div>
            <el-text class="text-text-secondary">// {{ t('homepage.ipc.step4') }}</el-text>
            <div class="rounded bg-gray-100 p-2 dark:bg-gray-800">
              <el-tag type="info">const user = await window.electron.user.get('123');</el-tag>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Built-in Features -->
      <el-card class="overflow-hidden rounded-xl border-none dark:!bg-[#16162a]">
        <template #header>
          <span class="flex items-center gap-2 text-xl">{{ t('homepage.features.title') }}</span>
        </template>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="flex items-start gap-3 rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
          >
            <div>
              <el-text tag="strong" class="block dark:text-white">{{ feature.title }}</el-text>
              <el-text class="text-text-secondary" size="small">{{ feature.desc }}</el-text>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Project Structure + Tech Stack -->
      <div class="grid gap-6 md:grid-cols-2">
        <el-card class="overflow-hidden rounded-xl border-none dark:!bg-[#16162a]">
          <template #header>
            <span class="flex items-center gap-2">{{ t('homepage.projectStructure.title') }}</span>
          </template>
          <div class="font-mono text-sm">
            <div class="space-y-1 text-gray-700 dark:text-gray-300">
              <div><el-tag type="info">src/</el-tag></div>
              <div class="pl-4">
                <el-tag>├── main/</el-tag>
                <el-text class="text-text-secondary"> # {{ t('homepage.projectStructure.mainProcess') }}</el-text>
              </div>
              <div class="pl-8">
                <el-tag type="info">│ ├── ipc/</el-tag>
                <el-text class="text-text-secondary"> # {{ t('homepage.projectStructure.ipcHandlers') }}</el-text>
              </div>
              <div class="pl-8">
                <el-tag type="info">│ ├── services/</el-tag>
                <el-text class="text-text-secondary"> # {{ t('homepage.projectStructure.services') }}</el-text>
              </div>
              <div class="pl-8">
                <el-tag type="info">│ └── database/</el-tag>
                <el-text class="text-text-secondary"> # {{ t('homepage.projectStructure.database') }}</el-text>
              </div>
              <div class="pl-4">
                <el-tag type="info">├── preload/</el-tag>
                <el-text class="text-text-secondary"> # {{ t('homepage.projectStructure.preload') }}</el-text>
              </div>
              <div class="pl-4">
                <el-tag type="info">├── renderer/</el-tag>
                <el-text class="text-text-secondary"> # {{ t('homepage.projectStructure.renderer') }}</el-text>
              </div>
              <div class="pl-4">
                <el-tag type="info">└── shared/</el-tag>
                <el-text class="text-text-secondary"> # {{ t('homepage.projectStructure.shared') }}</el-text>
              </div>
            </div>
          </div>
        </el-card>

        <el-card class="overflow-hidden rounded-xl border-none dark:!bg-[#16162a]">
          <template #header>
            <span class="flex items-center gap-2">{{ t('homepage.techStack.title') }}</span>
          </template>
          <div class="flex flex-wrap gap-2">
            <el-tag
              v-for="(tech, index) in techStack"
              :key="index"
              type="primary"
              effect="plain"
            >
              {{ tech }}
            </el-tag>
          </div>
          <el-divider class="!my-4" />
          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p class="mb-2">{{ t('homepage.techStack.description1') }}</p>
            <p class="mb-0">{{ t('homepage.techStack.description2') }}</p>
          </div>
        </el-card>
      </div>

      <!-- Footer -->
      <div class="text-center text-sm text-gray-500 dark:text-gray-400">
        <el-text class="text-text-secondary">{{ t('common.madeWith') }}</el-text>
      </div>
    </div>
  </div>
</template>
