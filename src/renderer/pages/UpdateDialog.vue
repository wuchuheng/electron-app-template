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
  try {
    await updateStore.installAndRestart()
  } catch {
    isRestarting.value = false
    ElMessage.error(t('update.error'))
  }
}

function handleClose() {
  window.electron.window.hide()
}

function renderMarkdown(notes: string): string {
  return marked(formatReleaseNotes(notes)) as string
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
      <!-- Title bar -->
      <div class="titlebar drag flex h-titlebar select-none items-center justify-end px-2 py-2 text-text-primary">
        <WindowControlButtons
          :show-minimize="false"
          :show-maximize="false"
          @close="handleClose"
        />
      </div>

      <!-- Content -->
      <div class="flex min-h-0 flex-1 flex-col p-6 pt-0">
        <!-- Dialog Header -->
        <div class="no-drag mb-2 text-center">
          <div class="mb-2 inline-block rounded-full bg-green-500/10 p-3">
            <el-icon class="text-4xl text-green-500">
              <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" />
              </svg>
            </el-icon>
          </div>
          <div>
            <h4 class="m-0 text-lg font-semibold">{{ t('update.title') }}</h4>
            <el-tag type="primary" class="mt-1">
              {{ t('update.newVersion', { version: info.version }) }}
            </el-tag>
          </div>
        </div>

        <el-divider style="margin: 12px 0" />

        <!-- Version Meta -->
        <div class="no-drag mb-4 flex items-center justify-around rounded-lg bg-background-secondary p-3">
          <el-space>
            <el-text class="text-text-secondary">{{ formatBytes(info.files?.[0]?.size || 0) }}</el-text>
          </el-space>
          <el-divider direction="vertical" />
          <el-space>
            <el-text class="text-text-secondary">{{ dayjs(info.releaseDate).format('YYYY-MM-DD') }}</el-text>
          </el-space>
        </div>

        <!-- Release Notes -->
        <div class="no-drag mb-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div class="border-b border-gray-200 bg-background-secondary px-4 py-2 dark:border-gray-700">
            <el-text tag="strong" size="small" class="uppercase tracking-wider">
              {{ t('update.releaseNotes') }}
            </el-text>
          </div>
          <div class="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 flex-1 overflow-y-auto bg-white/50 p-4 dark:bg-black/10">
            <div
              class="prose prose-sm dark:prose-invert max-w-none text-text-secondary"
              v-html="renderMarkdown(info.releaseNotes || '')"
            />
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="no-drag mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
        >
          {{ error }}
        </div>

        <!-- Install Button -->
        <div class="no-drag mt-auto pb-6 pt-4">
          <el-button
            type="primary"
            size="large"
            class="w-full h-12 text-base"
            :loading="isRestarting"
            @click="handleRestart"
          >
            {{ t('update.restartBtn') }}
          </el-button>
          <div class="mt-2 text-center text-xs text-gray-400">{{ t('update.restarting') }}</div>
        </div>
      </div>
    </div>
  </template>
</template>
