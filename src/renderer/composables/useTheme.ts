import { ref, onMounted, onUnmounted } from 'vue'

export function useTheme() {
  const isDarkMode = ref(false)
  let mq: MediaQueryList | null = null

  onMounted(() => {
    mq = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode.value = mq.matches
    const handler = (e: MediaQueryListEvent) => { isDarkMode.value = e.matches }
    mq.addEventListener('change', handler)
    onUnmounted(() => mq?.removeEventListener('change', handler))
  })

  return isDarkMode
}
