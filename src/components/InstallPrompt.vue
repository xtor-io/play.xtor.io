<template>
  <div
    v-if="uiStore.installPromptVisible"
    class="fixed bottom-0 left-0 right-0 bg-[#1e1e1e] border-t border-[#3a3a3a] p-4 z-[999] animate-[slideUp_0.3s_ease] shadow-[0_-4px_12px_rgba(0,0,0,0.3)]"
  >
    <div class="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
      <p class="flex-1 min-w-[200px] text-white">
        Install XTOR TV for a better experience!
      </p>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 bg-[#f1415d] text-white rounded-lg hover:bg-[#d12e4a] transition-colors min-h-[44px] font-semibold"
          @click="handleInstall"
        >
          Install
        </button>
        <button
          class="px-4 py-2 bg-transparent text-zinc-400 transition-colors hover:text-white min-h-[44px]"
          @click="handleDismiss"
        >
          Not now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUIStore } from '../stores/uiStore'

const uiStore = useUIStore()

async function handleInstall() {
  try {
    await uiStore.promptInstall()
  } catch (error) {
    console.error('Failed to prompt install:', error)
    uiStore.showToast('Installation failed', 'error')
  }
}

function handleDismiss() {
  uiStore.hideInstallPrompt()
}
</script>
