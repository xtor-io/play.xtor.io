<template>
  <div>
    <!-- Loading spinner -->
    <div v-if="feedStore.loading && feedStore.videos.length === 0" class="flex justify-center items-center py-12">
      <div class="w-10 h-10 border-4 border-zinc-800 border-t-[#f1415d] rounded-full animate-spin"></div>
    </div>

    <!-- Video grid -->
    <div v-else-if="feedStore.videos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <VideoCard
        v-for="video in feedStore.videos"
        :key="video.id"
        :video="video"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-12 text-zinc-400">
      <p>No videos found</p>
    </div>

    <!-- Infinite scroll trigger & loading indicator -->
    <div
      v-if="feedStore.hasNextPage"
      ref="loadMoreTrigger"
      class="flex justify-center pt-8 pb-4"
    >
      <div v-if="feedStore.loading" class="flex items-center gap-2 text-zinc-400">
        <div class="w-6 h-6 border-3 border-zinc-700 border-t-[#f1415d] rounded-full animate-spin"></div>
        <span>Loading more...</span>
      </div>
      <div v-else class="text-zinc-500 text-sm">
        Scroll for more
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useFeedStore } from '../stores/feedStore'
import VideoCard from './VideoCard.vue'

const feedStore = useFeedStore()
const loadMoreTrigger = ref(null)
let observer = null

async function handleLoadMore() {
  if (feedStore.loading || !feedStore.hasNextPage) return

  try {
    feedStore.nextPage()
    await feedStore.loadVideos(true)
  } catch (error) {
    console.error('Failed to load more videos:', error)
  }
}

function setupObserver() {
  // Clean up existing observer
  if (observer) {
    observer.disconnect()
  }

  // Set up Intersection Observer for infinite scrolling
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && !feedStore.loading && feedStore.hasNextPage) {
        handleLoadMore()
      }
    },
    {
      root: null, // viewport
      rootMargin: '200px', // trigger 200px before reaching the element
      threshold: 0.1
    }
  )

  // Start observing when the trigger element is available
  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
}

onMounted(() => {
  // Wait for the DOM to be ready
  nextTick(() => {
    setupObserver()
  })
})

// Re-setup observer when hasNextPage changes (in case trigger appears/disappears)
watch(() => feedStore.hasNextPage, () => {
  nextTick(() => {
    setupObserver()
  })
})

onUnmounted(() => {
  // Clean up observer
  if (observer) {
    observer.disconnect()
  }
})
</script>
