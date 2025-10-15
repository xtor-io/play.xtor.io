<template>
  <div
    v-if="uiStore.toastVisible"
    class="fixed bottom-6 right-6 bg-[#1e1e1e] text-white px-6 py-4 rounded-lg shadow-2xl z-[2000] animate-[slideUp_0.3s_ease] border max-w-md md:max-w-sm max-md:left-6"
    :class="{
      'border-green-500 bg-green-500/10': uiStore.toastType === 'success',
      'border-red-600 bg-red-500/10': uiStore.toastType === 'error',
      'border-orange-500 bg-orange-500/10': uiStore.toastType === 'warning',
      'border-[#3a3a3a]': !uiStore.toastType || uiStore.toastType === 'info'
    }"
  >
    {{ uiStore.toastMessage }}
  </div>
</template>

<script setup>
import { useUIStore } from '../stores/uiStore'

const uiStore = useUIStore()
</script>
