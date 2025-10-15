<template>
  <form @submit.prevent="handleSearch" class="flex gap-2 items-stretch">
    <input
      ref="searchInput"
      type="text"
      v-model="searchQuery"
      class="flex-1 px-4 py-2 bg-[#2a2a2a] text-white rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#f1415d] transition-colors placeholder:text-zinc-400 min-h-[44px]"
      placeholder="Search videos..."
      @keydown.enter="handleSearch"
    />
    <button
      type="submit"
      class="px-3 sm:px-4 py-2 bg-[#f1415d] hover:bg-[#d63850] text-white rounded-lg transition-colors min-h-[44px] flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex-shrink-0"
      :disabled="isSearching"
    >
      <svg
        v-if="!isSearching"
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span class="hidden md:inline">Search</span>
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useFeedStore } from '../stores/feedStore'

const feedStore = useFeedStore()
const searchQuery = ref(feedStore.currentSearch || '')
const searchInput = ref(null)
const isSearching = ref(false)

async function handleSearch() {
  if (isSearching.value) return

  try {
    isSearching.value = true
    feedStore.setSearch(searchQuery.value)
    await feedStore.loadVideos()
  } catch (error) {
    console.error('Search failed:', error)
  } finally {
    isSearching.value = false
  }
}
</script>
