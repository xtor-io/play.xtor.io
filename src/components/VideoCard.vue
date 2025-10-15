<template>
  <div
    class="bg-[#1e1e1e] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border border-transparent hover:-translate-y-0.5 hover:shadow-2xl hover:border-[#3a3a3a] group active:scale-[0.98] min-h-[44px]"
    @click="handleClick"
  >
    <div class="relative w-full pb-[56.25%] bg-zinc-800 overflow-hidden">
      <img
        v-if="video.thumbnail"
        :src="video.thumbnail"
        :alt="video.title"
        class="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <!-- LIVE badge -->
      <div v-if="isLive" class="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
        <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
        LIVE
      </div>

      <!-- Duration badge -->
      <div v-else-if="video.duration !== null && video.duration !== undefined" class="absolute bottom-2 right-2 bg-black/85 text-white px-1.5 py-0.5 rounded text-xs font-semibold">
        {{ formatDuration(video.duration) }}
      </div>
    </div>

    <div class="p-4">
      <h3 class="text-[0.95rem] font-medium text-white line-clamp-2 leading-snug transition-colors group-hover:text-[#f1415d]">
        {{ video.title }}
      </h3>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFeedStore } from '../stores/feedStore'
import { useUIStore } from '../stores/uiStore'
import { useFormatters } from '../composables/useFormatters'

const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const route = useRoute()
const feedStore = useFeedStore()
const uiStore = useUIStore()
const { formatDuration } = useFormatters()

const isLive = computed(() => {
  return props.video.duration === null || props.video.duration === undefined
})

async function handleClick() {
  try {
    // Show loading overlay
    uiStore.showLoading('Loading video...')

    const feedIndex = feedStore.getFeedIndex(feedStore.currentFeed)

    // Check if video already has formats - if so, use it directly
    if (props.video.formats && props.video.formats.length > 0) {
      // Video has formats, no need to fetch details
      feedStore.currentVideo = props.video
      router.push(`/f/${feedIndex}/v/${props.video.id}`)
    } else {
      // Formats missing, fetch full video details
      const videoData = await feedStore.loadVideoDetails(props.video.id)

      if (videoData) {
        feedStore.currentVideo = videoData
        router.push(`/f/${feedIndex}/v/${props.video.id}`)
      } else {
        uiStore.showToast('Video not found', 'error')
      }
    }
  } catch (error) {
    console.error('Failed to load video:', error)
    uiStore.showToast('Failed to load video', 'error')
  } finally {
    // Hide loading overlay
    uiStore.hideLoading()
  }
}
</script>
