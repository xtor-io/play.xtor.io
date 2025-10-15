<template>
  <div v-if="feedStore.feedManifest?.filters?.length" class="flex flex-col gap-4">
    <select
      v-for="filter in feedStore.feedManifest.filters"
      :key="filter.id"
      :id="`filter-${filter.id}`"
      :value="feedStore.currentFilters[filter.id] || ''"
      @change="handleFilterChange(filter.id, $event)"
      class="w-full px-4 py-2 bg-[#2a2a2a] text-white rounded-lg border border-[#3a3a3a] focus:outline-none focus:border-[#f1415d] transition-colors appearance-none cursor-pointer min-h-[44px]"
    >
      <option value="">All {{ filter.label }}</option>
      <option
        v-for="option in filter.options"
        :key="option.id"
        :value="option.id"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { useFeedStore } from '../stores/feedStore'

const feedStore = useFeedStore()

async function handleFilterChange(filterId, event) {
  const value = event.target.value

  try {
    feedStore.setFilter(filterId, value)
    await feedStore.loadVideos()
  } catch (error) {
    console.error('Failed to apply filter:', error)
  }
}
</script>
