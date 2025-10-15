import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFeedStore = defineStore('feed', () => {
  // State
  const feeds = ref([])
  const currentFeed = ref(null)
  const currentVideo = ref(null)  // Store current video to avoid refetching
  const currentPage = ref(1)
  const currentFilters = ref({})
  const currentSort = ref(null)
  const currentSearch = ref('')
  const hasNextPage = ref(false)
  const videos = ref([])
  const loading = ref(false)

  // Computed
  const activeFeed = computed(() => currentFeed.value)
  const feedManifest = computed(() => currentFeed.value?.manifest || null)
  const hasFeeds = computed(() => feeds.value.length > 0)

  // Actions
  async function loadFeeds() {
    const storedFeeds = localStorage.getItem('xtor_feeds')
    if (storedFeeds) {
      try {
        feeds.value = JSON.parse(storedFeeds)
      } catch (error) {
        console.error('Failed to load feeds:', error)
        feeds.value = []
      }
    }

    // Add default feed if no feeds exist
    const defaultFeedUrl = 'https://sample.xtor.io/'
    if (feeds.value.length === 0) {
      try {
        await addFeed(defaultFeedUrl)
      } catch (error) {
        console.error('Failed to add default feed:', error)
      }
    }
  }

  function saveFeeds() {
    localStorage.setItem('xtor_feeds', JSON.stringify(feeds.value))
  }

  async function addFeed(url) {
    if (!url || feeds.value.some(f => f.url === url)) {
      throw new Error('Invalid or duplicate feed URL')
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      throw new Error('Invalid URL format')
    }

    // Fetch manifest
    const manifestUrl = url.endsWith('/') ? `${url}manifest` : `${url}/manifest`
    const response = await fetch(manifestUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status}`)
    }

    const manifest = await response.json()

    if (!manifest.name || !manifest.xtor_version) {
      throw new Error('Invalid XTOR feed manifest')
    }

    const feed = {
      url,
      name: manifest.name,
      description: manifest.description || '',
      logo: manifest.logo || null,
      active: manifest.active !== false,
      manifest
    }

    feeds.value.push(feed)
    saveFeeds()

    // Set as current if first feed
    if (feeds.value.length === 1) {
      currentFeed.value = feed
    }

    return feed
  }

  function removeFeed(feedUrl) {
    feeds.value = feeds.value.filter(f => f.url !== feedUrl)
    saveFeeds()

    // Update current feed if needed
    if (currentFeed.value?.url === feedUrl) {
      currentFeed.value = feeds.value.length > 0 ? feeds.value[0] : null
    }
  }

  async function switchFeed(feed) {
    currentFeed.value = feed
    currentPage.value = 1
    currentFilters.value = {}
    currentSort.value = null
    currentSearch.value = ''
    videos.value = []

    await loadFeedManifest(feed)
  }

  async function loadFeedManifest(feed) {
    const manifestUrl = feed.url.endsWith('/') ? `${feed.url}manifest` : `${feed.url}/manifest`
    const response = await fetch(manifestUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status}`)
    }

    const manifest = await response.json()
    feed.manifest = manifest

    // Update in storage
    const feedIndex = feeds.value.findIndex(f => f.url === feed.url)
    if (feedIndex !== -1) {
      feeds.value[feedIndex] = feed
      saveFeeds()
    }

    // Set default sort
    if (manifest.sort?.default && !currentSort.value) {
      currentSort.value = manifest.sort.default
    }
  }

  async function loadVideos(append = false) {
    if (!currentFeed.value) return

    if (!append) {
      videos.value = []
    }

    loading.value = true

    try {
      const baseUrl = currentFeed.value.url.endsWith('/')
        ? currentFeed.value.url
        : `${currentFeed.value.url}/`

      const params = new URLSearchParams()
      params.append('page', currentPage.value)

      if (currentSearch.value) {
        params.append('search', currentSearch.value)
      }

      Object.entries(currentFilters.value).forEach(([key, value]) => {
        params.append('filter', `${key}:${value}`)
      })

      if (currentSort.value) {
        params.append('sort', currentSort.value)
      }

      const url = `${baseUrl}videos?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch videos: ${response.status}`)
      }

      const data = await response.json()

      hasNextPage.value = data.pagination?.has_next || false

      if (append) {
        videos.value.push(...(data.videos || []))
      } else {
        videos.value = data.videos || []
      }
    } finally {
      loading.value = false
    }
  }

  async function loadVideoDetails(videoId) {
    if (!currentFeed.value) return null

    const baseUrl = currentFeed.value.url.endsWith('/')
      ? currentFeed.value.url
      : `${currentFeed.value.url}/`

    const url = `${baseUrl}videos/${videoId}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch video details: ${response.status}`)
    }

    return await response.json()
  }

  function setFilter(filterId, value) {
    if (value) {
      currentFilters.value[filterId] = value
    } else {
      delete currentFilters.value[filterId]
    }

    currentPage.value = 1
  }

  function setSort(sortId) {
    currentSort.value = sortId
    currentPage.value = 1
  }

  function setSearch(query) {
    currentSearch.value = query
    currentPage.value = 1
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  function resetPagination() {
    currentPage.value = 1
    hasNextPage.value = false
  }

  function getFeedIndex(feed) {
    if (!feed) return -1
    return feeds.value.findIndex(f => f.url === feed.url)
  }

  return {
    // State
    feeds,
    currentFeed,
    currentPage,
    currentFilters,
    currentSort,
    currentSearch,
    hasNextPage,
    videos,
    loading,

    // Computed
    activeFeed,
    feedManifest,
    hasFeeds,

    // Actions
    loadFeeds,
    saveFeeds,
    addFeed,
    removeFeed,
    switchFeed,
    loadFeedManifest,
    loadVideos,
    loadVideoDetails,
    setFilter,
    setSort,
    setSearch,
    nextPage,
    resetPagination,
    getFeedIndex,
    currentVideo
  }
})
