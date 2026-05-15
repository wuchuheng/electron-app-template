import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from './useTheme'
import { CONFIG_KEYS, DEFAULT_THEME_CONFIG } from '@/shared/constants'
import type { ThemeConfig } from '@/shared/constants'

export function useAppTheme() {
  const isSystemDark = useTheme()
  const theme = ref<ThemeConfig>(DEFAULT_THEME_CONFIG)
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
    })
  }

  return { theme, isDarkMode, toggleTheme }
}
