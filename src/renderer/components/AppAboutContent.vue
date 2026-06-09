<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUpdateStore } from '../stores/update'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { formatBytes, formatSpeed } from '@/shared/update-types'
import logo from '@/renderer/assets/genLogo/icon.png'

interface AppInfo {
  name: string
  version: string
  description: string
  author: string
  website: string
}

const props = withDefaults(defineProps<{
  showTitle?: boolean
  bordered?: boolean
  className?: string
}>(), {
  showTitle: true,
  bordered: true,
  className: '',
})

function openWebsite(url: string) {
  window.open(url, '_blank')
}

const { t } = useI18n()
const updateStore = useUpdateStore()
const { status, info: updateInfo, progress, error } = storeToRefs(updateStore)

const appInfo = ref<AppInfo | null>(null)
const loading = ref(true)
const lastCheckTime = ref<number | null>(null)

onMounted(async () => {
  const res = await window.electron.system.getAppInfo()
  appInfo.value = res as AppInfo
  loading.value = false
})

watch(error, (err) => {
  if (err) ElMessage.error(t('about.error') + ': ' + err)
})

async function handleCheckUpdate() {
  lastCheckTime.value = Date.now()
  try {
    await updateStore.checkForUpdates()
  } catch {
    ElMessage.error(t('about.error'))
  }
}

async function handleInstall() {
  try {
    await updateStore.installAndRestart()
  } catch {
    ElMessage.error(t('update.error'))
  }
}

const isLatest = computed(() => status.value === 'idle' && lastCheckTime.value !== null)
</script>

<template>
  <div v-if="loading" class="flex h-full items-center justify-center p-8">
    <el-skeleton :loading="loading" animated />
  </div>
  <div v-else :class="['mx-auto max-w-2xl', className]">
    <div
      :class="[
        'rounded-2xl p-8',
        bordered
          ? 'border-border border bg-background-secondary shadow-sm'
          : 'bg-transparent',
      ]"
    >
      <!-- App Icon & Name -->
      <div class="mb-8 text-center">
        <div class="mb-4 inline-block rounded-3xl bg-background-primary p-4 shadow-inner">
          <img :src="logo" alt="Logo" class="h-20 w-20 object-contain" />
        </div>
        <h2 v-if="showTitle" class="mb-1 text-2xl font-bold text-text-primary">
          {{ appInfo?.name || t('appName') }}
        </h2>
        <el-space>
          <el-tag>v{{ appInfo?.version }}</el-tag>
          <el-badge v-if="isLatest" is-dot type="success">
            <el-text type="success" size="small">{{ t('about.latest') }}</el-text>
          </el-badge>
        </el-space>
      </div>

      <!-- Update Section -->
      <div class="mb-10 flex flex-col items-center">
        <div class="border-border w-full max-w-md rounded-xl border bg-background-primary p-6">
          <!-- Ready to install -->
          <div v-if="status === 'ready' && updateInfo" class="text-center">
            <el-text class="mb-4 block font-medium text-text-primary">
              {{ t('about.ready') }} (v{{ updateInfo.version }})
            </el-text>
            <el-button type="primary" size="large" class="w-full h-12 text-lg" @click="handleInstall">
              {{ t('about.restartBtn') }}
            </el-button>
          </div>

          <!-- Downloading -->
          <div v-else-if="status === 'downloading'" class="w-full">
            <div class="mb-2 flex items-end justify-between">
              <el-text tag="strong" type="primary">{{ t('about.downloading') }}</el-text>
              <el-text class="text-text-secondary" size="small">{{ progress?.percent }}%</el-text>
            </div>
            <el-progress
              :percentage="progress?.percent || 0"
              :stroke-color="['#14b8a6', '#2dd4bf']"
            />
            <div class="mt-3 flex justify-between px-1">
              <div>
                <el-text class="text-text-secondary" size="small">
                  {{ t('about.speed', { speed: '' }).replace(': ', '') }}
                </el-text>
                <br />
                <el-text class="font-mono text-xs text-text-primary">
                  {{ formatSpeed(progress?.bytesPerSecond) }}
                </el-text>
              </div>
              <div class="text-right">
                <el-text class="text-text-secondary" size="small">{{ t('about.description') }}</el-text>
                <br />
                <el-text class="font-mono text-xs text-text-primary">
                  {{ formatBytes(progress?.transferred || 0) }} / {{ formatBytes(progress?.total || 0) }}
                </el-text>
              </div>
            </div>
          </div>

          <!-- Idle / Check updates -->
          <div v-else class="text-center">
            <el-button
              type="primary"
              plain
              size="large"
              :loading="status === 'checking'"
              class="px-8"
              @click="handleCheckUpdate"
            >
              {{ status === 'checking' ? t('about.checking') : t('about.checkUpdates') }}
            </el-button>
            <div v-if="isLatest" class="mt-3">
              <el-text class="text-text-secondary" size="small" tag="i">{{ t('update.latest') }}</el-text>
            </div>
          </div>
        </div>
      </div>

      <el-divider dashed />

      <!-- App Info & Links -->
      <div class="space-y-4 px-4">
        <p v-if="appInfo?.description" class="text-center italic leading-relaxed text-text-secondary">
          {{ appInfo.description }}
        </p>

        <div class="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <span v-if="appInfo?.author" class="text-text-secondary">
            {{ appInfo.author }}
          </span>
          <span v-if="appInfo?.website" class="text-text-secondary">
            <a
              href="#"
              @click.prevent="openWebsite(appInfo.website!)"
              class="text-primary-500 hover:text-primary-400 hover:underline"
            >
              {{ t('about.website') || 'Website' }}
            </a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
