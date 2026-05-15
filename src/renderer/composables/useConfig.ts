import { ref, readonly } from 'vue'

export function useConfig<T>(key: string, defaultValue: T) {
  const config = ref<T>(defaultValue)
  const loading = ref(true)

  window.electron.config.get(key).then((val: unknown) => {
    if (val !== null && val !== undefined) {
      config.value = val as T
    }
    loading.value = false
  })

  async function saveConfig(newConfig: T) {
    config.value = newConfig
    await window.electron.config.save({ key, value: newConfig as never })
  }

  return { config: readonly(config), saveConfig, loading: readonly(loading) }
}
