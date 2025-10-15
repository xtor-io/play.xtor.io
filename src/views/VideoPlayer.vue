<template>
  <div class="min-h-screen bg-[#0f0f0f]">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <div class="spinner"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
      <p class="text-zinc-400">{{ error }}</p>
      <button @click="goBack" class="px-6 py-2 bg-[#f1415d] text-white rounded-lg hover:bg-[#d12e4a] transition-colors">
        Back to Feed
      </button>
    </div>

    <!-- Video player content -->
    <div v-else-if="video" class="space-y-6">
      <!-- Video player -->
      <div class="relative">
        <VidstackPlayer
          :sources="videoSources"
          :poster="video.thumbnail"
          :title="video.title"
          :autoplay="true"
          @ready="handlePlayerReady"
          @error="handlePlayerError"
        />

        <!-- LIVE indicator -->
        <div v-if="isLive" class="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
          <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>
      </div>

      <!-- Video info -->
      <div class="container max-w-screen-2xl mx-auto px-4 space-y-4">
        <h1 class="text-2xl md:text-3xl font-bold text-white">{{ video.title }}</h1>

        <!-- Metadata -->
        <div class="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <span v-if="!isLive && video.duration" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round"/>
            </svg>
            {{ formatDuration(video.duration) }}
          </span>
          <span v-if="video.published_at" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke-width="2" stroke-linecap="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke-width="2"/>
            </svg>
            {{ formatDate(video.published_at) }}
          </span>
          <span v-if="video.views !== null && video.views !== undefined" class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke-width="2"/>
            </svg>
            {{ formatNumber(video.views) }} views
          </span>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-3">
          <a
            v-if="video.source_url"
            :href="video.source_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="15 3 21 3 21 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="10" y1="14" x2="21" y2="3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            View Original
          </a>
        </div>

        <!-- Description -->
        <div v-if="video.description" class="bg-zinc-900 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-white mb-2">Description</h3>
          <p class="text-zinc-300 whitespace-pre-wrap leading-relaxed">{{ video.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeedStore } from '../stores/feedStore'
import { useFormatters } from '../composables/useFormatters'
import VidstackPlayer from '../components/VidstackPlayer.vue'

const route = useRoute()
const router = useRouter()
const feedStore = useFeedStore()
const { formatDuration } = useFormatters()

const loading = ref(false)
const error = ref(null)
const video = ref(null)

const isLive = computed(() => {
  return video.value?.duration === null || video.value?.duration === undefined
})

const videoSources = computed(() => {
  if (!video.value?.formats || video.value.formats.length === 0) {
    return []
  }

  return video.value.formats.map(format => ({
    url: format.url,
    type: format.type || 'video/mp4',
    quality: format.quality
  }))
})

onMounted(async () => {
  await loadVideo()
})

async function loadVideo() {
  try {
    loading.value = true
    error.value = null

    const videoId = route.params.videoId
    const feedIndex = parseInt(route.params.feedIndex)

    if (!videoId) {
      error.value = 'No video selected'
      return
    }

    // Ensure we're on the right feed
    const feed = feedStore.feeds[feedIndex]
    if (feed && feedStore.currentFeed?.url !== feed.url) {
      await feedStore.switchFeed(feed)
    }

    // Always load full video details from the API to get description, published_at, etc.
    const videoData = await feedStore.loadVideoDetails(videoId)

    if (!videoData) {
      error.value = 'Video not found'
      return
    }

    video.value = videoData
    feedStore.currentVideo = videoData
  } catch (err) {
    console.error('Failed to load video:', err)
    error.value = err.message || 'Failed to load video'
  } finally {
    loading.value = false
  }
}

function handlePlayerReady(player) {
  console.log('Player ready:', player)
}

function handlePlayerError(error) {
  console.error('Player error:', error)
}

function goBack() {
  router.back()
}

function formatDate(dateString) {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

function formatNumber(num) {
  if (num === null || num === undefined) return ''

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}
</script>
