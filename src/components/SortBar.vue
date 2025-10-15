<template>
  <select
    v-if="feedStore.feedManifest?.sort?.options?.length"
    class="w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#f1415d] transition-colors appearance-none cursor-pointer min-h-[44px]"
    :value="feedStore.currentSort || ''"
    @change="handleSortChange"
  >
    <option value="" disabled>Sort by</option>
    <option
      v-for="option in feedStore.feedManifest.sort.options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup>
import { useFeedStore } from '../stores/feedStore'

const feedStore = useFeedStore()

async function handleSortChange(event) {
  const sortId = event.target.value

  try {
    feedStore.setSort(sortId)
    await feedStore.loadVideos()
  } catch (error) {
    console.error('Failed to apply sort:', error)
  }
}
</script>
