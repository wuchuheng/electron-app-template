<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppTheme } from '../composables/useAppTheme'
import { useUpdateStore } from '../stores/update'
import TitleBar from './TitleBar.vue'
import Bootloading from './Bootloading.vue'

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
  <el-config-provider>
    <div class="flex h-screen flex-col bg-background-primary transition-colors duration-300">
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
