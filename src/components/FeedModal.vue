<template>
  <div
    v-if="uiStore.feedModalOpen"
    class="fixed inset-0 bg-black/85 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 overflow-y-auto animate-[fadeIn_0.2s_ease]"
    @click.self="handleClose"
  >
    <div class="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
      <div class="flex justify-between items-center p-6 border-b border-[#3a3a3a] sticky top-0 bg-[#1e1e1e] z-10">
        <h2 class="text-2xl text-white font-semibold">Manage Feeds</h2>
        <button
          class="bg-[#2a2a2a] border border-[#3a3a3a] text-white cursor-pointer p-2 rounded-lg transition-colors hover:bg-[#3a3a3a] hover:border-[#f1415d] flex items-center justify-center min-h-[44px] min-w-[44px]"
          @click="handleClose"
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="p-6">
        <!-- Add feed form -->
        <form class="flex gap-2 mb-8" @submit.prevent="handleAddFeed">
          <input
            v-model="newFeedUrl"
            type="url"
            class="flex-1 px-4 py-2 bg-[#2a2a2a] text-white border border-[#3a3a3a] rounded-lg text-base focus:border-[#f1415d] focus:outline-none placeholder:text-zinc-400 transition-colors min-h-[44px]"
            placeholder="Enter feed URL (e.g., https://example.com/xtor)"
            required
          />
          <button
            type="submit"
            class="px-4 py-2 bg-[#f1415d] text-white rounded-lg hover:bg-[#d12e4a] transition-colors min-h-[44px] whitespace-nowrap font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="loading"
          >
            {{ loading ? 'Adding...' : 'Add Feed' }}
          </button>
        </form>

        <!-- Error message -->
        <div v-if="errorMessage" class="bg-red-500/10 border border-red-600 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Feed list -->
        <div v-if="feedStore.feeds.length > 0" class="flex flex-col gap-4">
          <div
            v-for="feed in feedStore.feeds"
            :key="feed.url"
            class="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-4 flex justify-between items-center gap-4"
          >
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-white mb-1">{{ feed.name }}</div>
              <div class="text-sm text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap">{{ feed.url }}</div>
            </div>
            <div>
              <button
                class="px-4 py-2 bg-transparent border border-[#3a3a3a] text-zinc-400 rounded-lg text-sm cursor-pointer transition-colors hover:border-red-600 hover:text-red-600 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[80px]"
                @click="handleRemoveFeed(feed.url)"
                :disabled="loading"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="text-center py-12 text-zinc-400">
          <p>No feeds added yet. Add your first feed above!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFeedStore } from '../stores/feedStore'
import { useUIStore } from '../stores/uiStore'

const feedStore = useFeedStore()
const uiStore = useUIStore()

const newFeedUrl = ref('')
const loading = ref(false)
const errorMessage = ref('')

function handleClose() {
  uiStore.closeFeedModal()
  newFeedUrl.value = ''
  errorMessage.value = ''
}

async function handleAddFeed() {
  if (!newFeedUrl.value.trim()) return

  loading.value = true
  errorMessage.value = ''

  try {
    await feedStore.addFeed(newFeedUrl.value.trim())
    uiStore.showToast('Feed added successfully!', 'success')
    newFeedUrl.value = ''
  } catch (error) {
    errorMessage.value = error.message || 'Failed to add feed'
    uiStore.showToast(errorMessage.value, 'error')
  } finally {
    loading.value = false
  }
}

async function handleRemoveFeed(feedUrl) {
  if (!confirm('Are you sure you want to remove this feed?')) return

  loading.value = true
  errorMessage.value = ''

  try {
    feedStore.removeFeed(feedUrl)
    uiStore.showToast('Feed removed successfully', 'success')
  } catch (error) {
    errorMessage.value = error.message || 'Failed to remove feed'
    uiStore.showToast(errorMessage.value, 'error')
  } finally {
    loading.value = false
  }
}
</script>
