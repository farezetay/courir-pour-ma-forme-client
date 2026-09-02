import SeasonsPage from '@/views/SeasonsPage.vue'
import TheSeasonPage from '@/views/TheSeasonPage.vue'
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
  ],
})

export default router
