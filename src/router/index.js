import SeasonsPage from '@/views/SeasonsPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'seasons',
      path: '/',
      component: SeasonsPage,
    },
  ],
})

export default router
