<template>
  <div id="app" class="min-h-screen bg-[#0f0f0f]">
    <AppHeader />

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <FeedModal />
    <InstallPrompt />
    <Toast />
    <LoadingOverlay />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useFeedStore } from './stores/feedStore'
import AppHeader from './components/AppHeader.vue'
import FeedModal from './components/FeedModal.vue'
import InstallPrompt from './components/InstallPrompt.vue'
import Toast from './components/Toast.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'

const feedStore = useFeedStore()

onMounted(async () => {
  // Load feeds from localStorage
  await feedStore.loadFeeds()

  // Setup install prompt
  setupInstallPrompt()
})

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    uiStore.setDeferredPrompt(e)

    // Show install prompt after 10 seconds if not installed
    setTimeout(() => {
      if (!isInstalled()) {
        uiStore.showInstallPrompt()
      }
    }, 10000)
  })

  window.addEventListener('appinstalled', () => {
    uiStore.setDeferredPrompt(null)
    uiStore.hideInstallPrompt()
    uiStore.showToast('XTOR TV installed successfully!', 'success')
  })
}

function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true
}
</script>

<style>
@import './assets/styles/tailwind.css';

/* Route transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
