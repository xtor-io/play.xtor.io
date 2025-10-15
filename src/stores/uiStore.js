import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // State
  const feedModalOpen = ref(false)
  const playerModalOpen = ref(false)
  const installPromptVisible = ref(false)
  const currentVideo = ref(null)
  const toastMessage = ref('')
  const toastType = ref('info')
  const toastVisible = ref(false)
  const deferredPrompt = ref(null)

  // Page navigation state (in-memory, no URL changes)
  const currentPage = ref('overview') // 'overview' | 'feed' | 'video'
  const selectedFeedUrl = ref(null)
  const selectedVideoId = ref(null)

  // Loading state
  const isLoading = ref(false)
  const loadingMessage = ref('')

  // Toast timeout
  let toastTimeout = null

  // Actions
  function showToast(message, type = 'info') {
    toastMessage.value = message
    toastType.value = type
    toastVisible.value = true

    // Clear existing timeout
    if (toastTimeout) {
      clearTimeout(toastTimeout)
    }

    // Auto-hide after 3 seconds
    toastTimeout = setTimeout(() => {
      toastVisible.value = false
    }, 3000)
  }

  function hideToast() {
    toastVisible.value = false
    if (toastTimeout) {
      clearTimeout(toastTimeout)
    }
  }

  function openFeedModal() {
    feedModalOpen.value = true
  }

  function closeFeedModal() {
    feedModalOpen.value = false
  }

  function openPlayerModal(video) {
    currentVideo.value = video
    playerModalOpen.value = true
  }

  function closePlayerModal() {
    playerModalOpen.value = false
    currentVideo.value = null
  }

  function showInstallPrompt() {
    installPromptVisible.value = true
  }

  function hideInstallPrompt() {
    installPromptVisible.value = false
  }

  function setDeferredPrompt(prompt) {
    deferredPrompt.value = prompt
  }

  async function promptInstall() {
    if (!deferredPrompt.value) return

    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    console.log(`User ${outcome} the install prompt`)

    deferredPrompt.value = null
    hideInstallPrompt()
  }

  // Loading actions
  function showLoading(message = 'Loading...') {
    isLoading.value = true
    loadingMessage.value = message
  }

  function hideLoading() {
    isLoading.value = false
    loadingMessage.value = ''
  }

  // Page navigation actions
  function navigateToOverview() {
    currentPage.value = 'overview'
    selectedFeedUrl.value = null
    selectedVideoId.value = null
  }

  function navigateToFeed(feedUrl) {
    currentPage.value = 'feed'
    selectedFeedUrl.value = feedUrl
    selectedVideoId.value = null
  }

  function navigateToVideo(feedUrl, videoId) {
    currentPage.value = 'video'
    selectedFeedUrl.value = feedUrl
    selectedVideoId.value = videoId
  }

  function goBack() {
    if (currentPage.value === 'video') {
      currentPage.value = 'feed'
      selectedVideoId.value = null
    } else if (currentPage.value === 'feed') {
      currentPage.value = 'overview'
      selectedFeedUrl.value = null
    }
  }

  return {
    // State
    feedModalOpen,
    playerModalOpen,
    installPromptVisible,
    currentVideo,
    toastMessage,
    toastType,
    toastVisible,
    deferredPrompt,
    currentPage,
    selectedFeedUrl,
    selectedVideoId,
    isLoading,
    loadingMessage,

    // Actions
    showToast,
    hideToast,
    openFeedModal,
    closeFeedModal,
    openPlayerModal,
    closePlayerModal,
    showInstallPrompt,
    hideInstallPrompt,
    setDeferredPrompt,
    promptInstall,
    showLoading,
    hideLoading,
    navigateToOverview,
    navigateToFeed,
    navigateToVideo,
    goBack
  }
})
