<template>
  <div v-if="uiStore.playerModalOpen && uiStore.currentVideo" class="modal" @click.self="handleClose">
    <div class="modal-content player-modal-content">
      <button class="close-btn" @click="handleClose" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Video player -->
      <div class="player-container">
        <video
          ref="videoPlayer"
          class="video-player"
          controls
          autoplay
          :poster="uiStore.currentVideo.thumbnail"
        >
          <source :src="currentVideoUrl" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <!-- LIVE indicator -->
        <div v-if="isLive" class="live-indicator">
          <span class="live-dot"></span>
          LIVE
        </div>
      </div>

      <!-- Video info -->
      <div class="video-info">
        <h2 class="video-title">{{ uiStore.currentVideo.title }}</h2>

        <p v-if="uiStore.currentVideo.description" class="video-description">
          {{ uiStore.currentVideo.description }}
        </p>

        <!-- Quality selector -->
        <div v-if="hasMultipleFormats" class="quality-selector">
          <label for="quality-select">Quality:</label>
          <select
            id="quality-select"
            v-model="selectedQuality"
            class="quality-select"
            @change="handleQualityChange"
          >
            <option
              v-for="format in uiStore.currentVideo.formats"
              :key="format.url"
              :value="format.url"
            >
              {{ formatQuality(format.quality) }}
            </option>
          </select>
        </div>

        <!-- Source link -->
        <div v-if="uiStore.currentVideo.source_url" class="source-link">
          <a
            :href="uiStore.currentVideo.source_url"
            target="_blank"
            rel="noopener noreferrer"
            class="secondary-btn"
          >
            View Source
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUIStore } from '../stores/uiStore'
import { useFormatters } from '../composables/useFormatters'

const uiStore = useUIStore()
const { formatQuality } = useFormatters()

const videoPlayer = ref(null)
const selectedQuality = ref('')

const isLive = computed(() => {
  return uiStore.currentVideo?.duration === null ||
         uiStore.currentVideo?.duration === undefined
})

const hasMultipleFormats = computed(() => {
  return uiStore.currentVideo?.formats?.length > 1
})

const currentVideoUrl = computed(() => {
  if (selectedQuality.value) {
    return selectedQuality.value
  }

  // Default to first format or video_url
  if (uiStore.currentVideo?.formats?.length > 0) {
    return uiStore.currentVideo.formats[0].url
  }

  return uiStore.currentVideo?.video_url || ''
})

// Initialize selected quality when video changes
watch(() => uiStore.currentVideo, (newVideo) => {
  if (newVideo?.formats?.length > 0) {
    selectedQuality.value = newVideo.formats[0].url
  } else {
    selectedQuality.value = ''
  }
}, { immediate: true })

function handleQualityChange() {
  // The video player will automatically reload with the new source
  // due to the reactive currentVideoUrl computed property
  if (videoPlayer.value) {
    const currentTime = videoPlayer.value.currentTime
    videoPlayer.value.load()
    videoPlayer.value.currentTime = currentTime
    videoPlayer.value.play().catch(err => {
      console.error('Failed to play video:', err)
    })
  }
}

function handleClose() {
  // Pause video before closing
  if (videoPlayer.value) {
    videoPlayer.value.pause()
  }
  uiStore.closePlayerModal()
}
</script>
