<template>
  <div class="feed-selector">
    <select
      class="feed-select"
      :value="feedStore.currentFeed?.url"
      @change="handleFeedChange"
    >
      <option value="" disabled>Select a feed</option>
      <option
        v-for="feed in feedStore.feeds"
        :key="feed.url"
        :value="feed.url"
      >
        {{ feed.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { useFeedStore } from '../stores/feedStore'

const feedStore = useFeedStore()

async function handleFeedChange(event) {
  const selectedUrl = event.target.value
  const feed = feedStore.feeds.find(f => f.url === selectedUrl)

  if (feed) {
    try {
      await feedStore.switchFeed(feed)
      await feedStore.loadVideos()
    } catch (error) {
      console.error('Failed to switch feed:', error)
    }
  }
}
</script>
