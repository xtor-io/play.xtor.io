<template>
  <div class="container max-w-screen-2xl mx-auto px-4 py-8">
    <!-- Show welcome screen if no feeds -->
    <WelcomeScreen v-if="!feedStore.hasFeeds" />

    <!-- Show feed grid if feeds exist -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Existing feeds -->
      <div
        v-for="feed in feedStore.feeds"
        :key="feed.url"
        class="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:border-[#f1415d] min-h-[12rem] flex flex-col active:scale-[0.98]"
        @click="navigateToFeed(feed)"
      >
        <div class="flex items-start gap-4 mb-4 flex-shrink-0">
          <div v-if="feed.logo" class="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
            <img :src="feed.logo" :alt="feed.name" class="w-full h-full object-cover" />
          </div>
          <div v-else class="w-16 h-16 rounded-lg bg-gradient-to-br from-[#f1415d] to-[#d63850] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {{ feed.name.charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="flex-1 min-w-0 flex flex-col">
          <h3 class="text-xl font-semibold text-white mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
            {{ feed.name }}
          </h3>
          <p v-if="feed.description" class="text-sm text-zinc-400 leading-relaxed line-clamp-2 mb-2">
            {{ feed.description }}
          </p>
          <div class="mt-auto">
            <span :class="[
              'inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold',
              feed.active ? 'bg-green-500/15 text-green-500' : 'bg-zinc-700/30 text-zinc-500'
            ]">
              {{ feed.active ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Add Feed card -->
      <div
        class="bg-gradient-to-br from-zinc-800 to-[#1e1e1e] border-2 border-dashed border-[#3a3a3a] rounded-xl p-6 cursor-pointer transition-all duration-200 hover:border-[#f1415d] hover:bg-gradient-to-br hover:from-[#3a3a3a] hover:to-zinc-800 min-h-[12rem] flex flex-col items-center justify-center gap-4 active:scale-[0.98]"
        @click="uiStore.openFeedModal()"
      >
        <div class="text-zinc-400">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4"/>
            <line x1="32" y1="16" x2="32" y2="48" stroke="currentColor" stroke-width="2"/>
            <line x1="16" y1="32" x2="48" y2="32" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-white">Add Feed</h3>
        <p class="text-sm text-zinc-400">Add a new XTOR feed</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useFeedStore } from '../stores/feedStore'
import { useUIStore } from '../stores/uiStore'
import WelcomeScreen from '../components/WelcomeScreen.vue'

const router = useRouter()
const feedStore = useFeedStore()
const uiStore = useUIStore()

async function navigateToFeed(feed) {
  try {
    // Show loading overlay
    uiStore.showLoading('Loading feed...')

    // Switch to the feed and load its content
    await feedStore.switchFeed(feed)
    await feedStore.loadVideos()

    // Navigate to feed page using feed index
    const feedIndex = feedStore.getFeedIndex(feed)
    router.push(`/f/${feedIndex}`)
  } catch (error) {
    console.error('Failed to load feed:', error)
    uiStore.showToast('Failed to load feed', 'error')
  } finally {
    // Hide loading overlay
    uiStore.hideLoading()
  }
}
</script>
