<template>
  <header class="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#0f0f0f] backdrop-blur supports-[backdrop-filter]:bg-[#0f0f0f]/95">
    <div class="flex h-16 items-center px-4">
      <!-- Back button (left side, fixed) -->
      <div class="flex-shrink-0">
        <button
          v-if="showBackButton"
          @click="goBack"
          class="flex items-center justify-center w-10 h-10 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Center content (feed branding or XTOR logo) -->
      <div class="flex-1 flex items-center justify-center px-4">
        <!-- Show feed branding when in feed -->
        <button
          v-if="currentFeed && !isHome"
          @click="goToFeed"
          class="flex items-center gap-3 max-w-md hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div v-if="currentFeed.logo" class="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
            <img :src="currentFeed.logo" :alt="currentFeed.name" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f1415d] to-[#d63850] flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
            {{ currentFeed.name.charAt(0).toUpperCase() }}
          </div>
          <span class="text-lg font-semibold text-white truncate">{{ currentFeed.name }}</span>
        </button>

        <!-- Show XTOR TV logo on home -->
        <router-link
          v-else
          to="/"
          class="text-2xl font-bold text-[#f1415d] hover:opacity-80 transition-opacity"
        >
          XTOR TV
        </router-link>
      </div>

      <!-- Menu button (right side, fixed) -->
      <div class="flex-shrink-0">
        <button
          @click="uiStore.openFeedModal()"
          class="flex items-center justify-center w-10 h-10 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          aria-label="Manage Feeds"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeedStore } from '../stores/feedStore'
import { useUIStore } from '../stores/uiStore'

const route = useRoute()
const router = useRouter()
const feedStore = useFeedStore()
const uiStore = useUIStore()

const isHome = computed(() => route.name === 'home')
const showBackButton = computed(() => !isHome.value)

const currentFeed = computed(() => {
  if (route.params.feedIndex !== undefined) {
    const feedIndex = parseInt(route.params.feedIndex)
    return feedStore.feeds[feedIndex]
  }
  return null
})

const feedIndexPath = computed(() => {
  if (route.params.feedIndex !== undefined) {
    return `/f/${route.params.feedIndex}`
  }
  return '/'
})

function goBack() {
  // Always use router.back() to respect actual browser history
  // This works correctly with iOS swipe gestures
  router.back()
}

function goToFeed() {
  // Use replace instead of push to avoid adding to history
  // This way, clicking back from the feed will go to feed overview, not the video
  router.replace(feedIndexPath.value)
}
</script>
