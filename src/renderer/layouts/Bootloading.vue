<script setup lang="ts">
import { ref, onMounted } from 'vue'
import packageJson from '../../../package.json'
import logo from '../assets/genLogo/icon.png'
import type { BootloadingProgressing } from '../../types/electron'

const processing = ref<BootloadingProgressing>({ progress: 0, title: '' })
const loading = ref(true)

onMounted(() => {
  console.log('Bootloading')

  window.electron.system.getBootloadProgressing().then((result: unknown) => {
    console.log('Bootload progress result:', JSON.stringify(result))
    processing.value = result as BootloadingProgressing
  })

  window.electron.system.bootloading((value: unknown) => {
    console.log('Bootload event received:', JSON.stringify(value))
    processing.value = value as BootloadingProgressing
    if ((value as BootloadingProgressing).progress >= 100) {
      loading.value = false
    }
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
