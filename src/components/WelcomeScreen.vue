<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center max-w-lg px-12 py-8">
      <svg class="text-[#f1415d] mb-6 mx-auto" width="120" height="120" viewBox="0 0 120 120" fill="none">
        <rect x="20" y="20" width="80" height="80" rx="16" stroke="currentColor" stroke-width="4"/>
        <polygon points="50,40 50,80 80,60" fill="currentColor"/>
      </svg>
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Welcome to XTOR TV</h2>
      <p class="text-zinc-400 mb-8 text-lg">Add your first XTOR feed to get started</p>
      <button
        @click="uiStore.openFeedModal()"
        class="px-4 py-2 bg-[#f1415d] text-white rounded-lg hover:bg-[#d12e4a] transition-colors min-h-[44px] font-semibold"
      >
        Add Feed
      </button>
    </div>
  </div>
</template>

<script setup>
import { useUIStore } from '../stores/uiStore'

const uiStore = useUIStore()
</script>
