<script setup lang="ts">
const props = withDefaults(defineProps<{ showMinimize?: boolean; showMaximize?: boolean }>(), {
  showMinimize: true,
  showMaximize: true,
})
const emit = defineEmits<{ close: []; minimize: []; maximize: [] }>()
</script>

<template>
  <div class="no-drag flex items-center space-x-1">
    <button
      v-if="props.showMinimize"
      class="titlebar-button rounded-md p-2 transition-all duration-200 hover:bg-hover hover:text-text-primary"
      aria-label="Minimize"
      @click="emit('minimize')"
    >
      <span class="text-text-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
      </span>
    </button>
    <button
      v-if="props.showMaximize"
      class="titlebar-button rounded-md p-2 transition-all duration-200 hover:bg-hover hover:text-text-primary"
      aria-label="Maximize"
      @click="emit('maximize')"
    >
      <span class="text-text-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>
      </span>
    </button>
    <button
      class="titlebar-button close rounded-md p-2 transition-all duration-200 hover:bg-close-hover hover:text-close-hover-text"
      aria-label="Close"
      @click="emit('close')"
    >
      <span class="text-text-secondary hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </span>
    </button>
  </div>
</template>
