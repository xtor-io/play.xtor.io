import { createRouter, createWebHashHistory } from 'vue-router'
import FeedOverview from './views/FeedOverview.vue'
import FeedView from './views/FeedView.vue'
import VideoPlayer from './views/VideoPlayer.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: FeedOverview,
    meta: { title: 'XTOR TV' }
  },
  {
    path: '/f/:feedIndex',
    name: 'feed',
    component: FeedView,
    meta: { title: 'Feed' }
  },
  {
    path: '/f/:feedIndex/v/:videoId',
    name: 'video',
    component: VideoPlayer,
    meta: { title: 'Video' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Track navigation to ensure proper history stack for iOS swipe-back
let isInsertingFeedPage = false

// Update document title and manage history
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'XTOR TV'

  // When navigating to a video page from home (bypassing feed),
  // we need to insert the feed page into history
  if (to.name === 'video' && from.name === 'home' && !isInsertingFeedPage) {
    // Prevent infinite loop
    isInsertingFeedPage = true

    const feedPath = `/f/${to.params.feedIndex}`

    // First navigate to feed, then to video
    // This ensures history is: Home → Feed → Video
    next(feedPath)

    // After feed page is loaded, navigate to video
    router.push(to.fullPath).then(() => {
      isInsertingFeedPage = false
    })

    return
  }

  next()
})

export default router
