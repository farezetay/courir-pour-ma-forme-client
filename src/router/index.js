import SeasonsPage from '@/views/SeasonsPage.vue'
import TheSeasonPage from '@/views/TheSeasonPage.vue'
import TheSessionPage from '@/views/TheSessionPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'seasons',
      path: '/seasons',
      component: SeasonsPage,
    },
    {
      name: 'season',
      path: '/seasons/:id',
      component: TheSeasonPage,
    },
    {
      name: 'session',
      path: '/seasons/:seasonId/sessions/:sessionId',
      component: TheSessionPage,
    },
  ],
})

export default router
