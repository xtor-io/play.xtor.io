<template>
  <transition name="fade">
    <div v-if="uiStore.isLoading" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div class="bg-[#1e1e1e] rounded-2xl p-8 shadow-2xl border border-[#3a3a3a] flex flex-col items-center gap-4 min-w-[200px]">
        <div class="w-12 h-12 border-4 border-zinc-700 border-t-[#f1415d] rounded-full animate-spin"></div>
        <p class="text-white font-medium">{{ uiStore.loadingMessage || 'Loading...' }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useUIStore } from '../stores/uiStore'

const uiStore = useUIStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
