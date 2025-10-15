<template>
  <div class="vidstack-player-wrapper">
    <media-player
      ref="playerRef"
      :title="title"
      :src="currentSource"
      :poster="poster"
      :autoplay="autoplay"
      playsinline
      @can-play="handleCanPlay"
      @play="emit('play')"
      @pause="emit('pause')"
      @ended="emit('ended')"
      @error="handleError"
      @hls-error="handleHlsError"
      @time-update="handleTimeUpdate"
      @provider-change="handleProviderChange"
    >
      <media-provider></media-provider>
      <media-plyr-layout></media-plyr-layout>
    </media-player>

    <!-- Custom quality selector for MP4 sources -->
    <div v-if="showQualitySelector" class="quality-selector">
      <button
        v-for="source in mp4Sources"
        :key="source.url"
        :class="['quality-button', { active: currentSource === source.url }]"
        @click="changeQuality(source)"
      >
        {{ source.quality }}p
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Import the bundle - this auto-imports styles and elements
import 'vidstack/bundle'

const props = defineProps({
  sources: {
    type: Array,
    required: true,
    validator: (sources) => {
      return sources.every(s => s.url && s.type)
    }
  },
  poster: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  autoplay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['ready', 'play', 'pause', 'ended', 'error', 'timeupdate'])

const playerRef = ref(null)
const hlsFailed = ref(false)
const currentSource = ref('')
const currentTime = ref(0)
const isPaused = ref(true)

// Get all MP4 sources sorted by quality (highest first)
const mp4Sources = computed(() => {
  if (!props.sources) return []

  return props.sources
    .filter(s => s.type === 'video/mp4')
    .sort((a, b) => {
      // Sort by quality if available (highest first)
      const qualityA = a.quality || 0
      const qualityB = b.quality || 0
      return qualityB - qualityA
    })
})

// Get HLS source
const hlsSource = computed(() => {
  if (!props.sources) return null

  return props.sources.find(s =>
    s.type === 'application/x-mpegURL' ||
    s.type === 'application/vnd.apple.mpegurl' ||
    s.url.includes('.m3u8')
  )
})

// Get DASH source
const dashSource = computed(() => {
  if (!props.sources) return null

  return props.sources.find(s =>
    s.type === 'application/dash+xml' ||
    s.url.includes('.mpd')
  )
})

// Show quality selector only for multiple MP4 sources (not HLS/DASH)
const showQualitySelector = computed(() => {
  return !hlsSource.value && !dashSource.value && mp4Sources.value.length > 1
})

// Initialize source
function initializeSource() {
  hlsFailed.value = false

  // Priority: HLS -> DASH -> MP4 (highest quality)
  if (hlsSource.value && !hlsFailed.value) {
    currentSource.value = hlsSource.value.url
  } else if (dashSource.value) {
    currentSource.value = dashSource.value.url
  } else if (mp4Sources.value.length > 0) {
    currentSource.value = mp4Sources.value[0].url
  } else if (props.sources.length > 0) {
    currentSource.value = props.sources[0].url
  }
}

// Change quality and preserve playback position
async function changeQuality(source) {
  if (currentSource.value === source.url) return

  const player = playerRef.value
  if (!player) return

  // Store current state
  const wasPlaying = !isPaused.value
  const savedTime = currentTime.value

  // Change source
  currentSource.value = source.url

  // Wait for the new source to be ready
  await new Promise(resolve => {
    const checkReady = () => {
      if (player.canPlay) {
        resolve()
      } else {
        setTimeout(checkReady, 50)
      }
    }
    checkReady()
  })

  // Restore playback position
  if (savedTime > 0) {
    player.currentTime = savedTime
  }

  // Resume playback if it was playing
  if (wasPlaying) {
    player.play()
  }
}

function handleCanPlay() {
  emit('ready', playerRef.value)
}

function handleHlsError(event) {
  console.warn('HLS error detected, falling back to MP4:', event)

  // Only fallback if we haven't already
  if (!hlsFailed.value && mp4Sources.value.length > 0) {
    hlsFailed.value = true
    console.log('Falling back to MP4 sources')
  }
}

function handleError(event) {
  const error = event.detail?.error
  const message = error?.message || ''

  console.error('Player error:', event)

  // Check if this is a network error for HLS/manifest
  const isHlsNetworkError =
    message.includes('network error') ||
    message.includes('manifest') ||
    message.includes('HLS error')

  if (isHlsNetworkError && !hlsFailed.value && mp4Sources.value.length > 0) {
    console.warn('HLS network error detected, falling back to MP4')
    hlsFailed.value = true
  } else {
    // Only emit error if we can't recover
    emit('error', event)
  }
}

function handleProviderChange(event) {
  console.log('Provider changed:', event)
}

function handleTimeUpdate(event) {
  currentTime.value = event.detail?.currentTime || 0
  emit('timeupdate', currentTime.value)
}

// Watch for player state changes
watch(() => playerRef.value, (player) => {
  if (player) {
    // Track play/pause state
    const unsubPlay = player.subscribe(({ paused }) => {
      isPaused.value = paused
    })
  }
})

// Watch for source changes
watch(() => props.sources, () => {
  initializeSource()
}, { deep: true })

// Watch for HLS failure to trigger fallback
watch(() => hlsFailed.value, (failed) => {
  if (failed) {
    console.log('HLS failed, switching to MP4 sources')
    initializeSource()
  }
})

// Initialize on mount
onMounted(() => {
  initializeSource()
})

// Expose player instance
defineExpose({
  player: () => playerRef.value
})
</script>

<style>
.vidstack-player-wrapper {
  width: 100%;
  max-width: 100%;
  background: #000;
  border-radius: 0;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  position: relative;
}

media-player {
  width: 100%;
  height: 100%;
  --plyr-color-main: rgb(241, 65, 93);
}

/* Quality selector */
.quality-selector {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 6px;
}

.quality-button {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.quality-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.quality-button.active {
  background: rgb(241, 65, 93);
  border-color: rgb(241, 65, 93);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .vidstack-player-wrapper {
    border-radius: 0;
  }

  .quality-selector {
    top: 8px;
    right: 8px;
    padding: 4px;
    gap: 4px;
  }

  .quality-button {
    padding: 4px 8px;
    font-size: 12px;
  }
}
</style>
