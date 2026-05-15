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
      if (r) {
        const s = r as UpdateState
        status.value = s.status
        info.value = s.info
        progress.value = s.progress
        error.value = s.error
      }
    })

    unsub = window.electron.update.onStatusChange((r: unknown) => {
      const s = r as UpdateState
      status.value = s.status
      info.value = s.info
      progress.value = s.progress
      error.value = s.error
    })
  }

  function cleanup() {
    unsub?.()
  }

  async function checkForUpdates() {
    try {
      await window.electron.update.check()
    } catch {
      console.error('Update check failed')
    }
  }

  async function installAndRestart() {
    try {
      await window.electron.update.install()
    } catch (err) {
      throw err
    }
  }

  async function openUpdateWindow() {
    try {
      await window.electron.window.openUpdate()
    } catch {
      console.error('Failed to open update window')
    }
  }

  return {
    status,
    info,
    progress,
    error,
    init,
    cleanup,
    checkForUpdates,
    installAndRestart,
    openUpdateWindow,
  }
})
