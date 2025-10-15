<template>
  <div class="animate-[fadeIn_0.3s_ease]">
    <!-- Feed content -->
    <div v-if="feedStore.currentFeed">
      <!-- Compact filter bar - Always visible -->
      <div v-if="showControls" class="bg-[#1e1e1e] border-b border-zinc-800 mb-6">
        <!-- Top bar with search and toggle -->
        <div class="px-4 py-3 flex gap-3 items-stretch">
          <!-- Search bar (if available) -->
          <div v-if="feedStore.feedManifest?.search" class="flex-1 min-w-0">
            <SearchBar />
          </div>

          <!-- Filter/Sort toggle button (if available) -->
          <button
            v-if="hasFiltersOrSort"
            @click="filtersExpanded = !filtersExpanded"
            class="flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors whitespace-nowrap min-h-[44px] flex-shrink-0"
            :class="{ 'bg-[#f1415d] hover:bg-[#d63850]': hasActiveFilters }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            <span class="hidden sm:inline">Filters</span>
            <svg
              class="w-5 h-5 transition-transform"
              :class="{ 'rotate-180': filtersExpanded }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>

        <!-- Expandable filters section -->
        <div
          v-if="hasFiltersOrSort"
          class="overflow-hidden transition-all duration-300"
          :style="{ maxHeight: filtersExpanded ? '500px' : '0' }"
        >
          <div class="px-4 pb-3 pt-0 space-y-3 md:flex md:gap-3 md:space-y-0">
            <div v-if="feedStore.feedManifest?.filters?.length" class="flex-1 md:min-w-[150px]">
              <FilterBar />
            </div>

            <div v-if="feedStore.feedManifest?.sort?.options?.length" class="flex-1 md:min-w-[150px]">
              <SortBar />
            </div>
          </div>
        </div>
      </div>

      <!-- Video grid using VideoGrid component -->
      <div class="container max-w-screen-2xl mx-auto px-4">
        <VideoGrid />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFeedStore } from '../stores/feedStore'
import SearchBar from '../components/SearchBar.vue'
import FilterBar from '../components/FilterBar.vue'
import SortBar from '../components/SortBar.vue'
import VideoGrid from '../components/VideoGrid.vue'

const route = useRoute()
const feedStore = useFeedStore()
const filtersExpanded = ref(false)

const showControls = computed(() => {
  return feedStore.feedManifest?.search ||
         feedStore.feedManifest?.filters?.length ||
         feedStore.feedManifest?.sort?.options?.length
})

const hasFiltersOrSort = computed(() => {
  return feedStore.feedManifest?.filters?.length ||
         feedStore.feedManifest?.sort?.options?.length
})

const hasActiveFilters = computed(() => {
  return Object.keys(feedStore.activeFilters || {}).length > 0
})

onMounted(async () => {
  // Load feed if not already loaded or if different feed
  const feedIndex = parseInt(route.params.feedIndex)
  const feed = feedStore.feeds[feedIndex]

  if (feed && (!feedStore.currentFeed || feedStore.currentFeed.url !== feed.url)) {
    await feedStore.switchFeed(feed)
    await feedStore.loadVideos()
  }
})
</script>
