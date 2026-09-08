import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import SeasonsPage from '@/views/SeasonsPage.vue'
import TheSeasonPage from '@/views/TheSeasonPage.vue'
import TheSessionPage from '@/views/TheSessionPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/seasons',
    },
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
    {
      name: 'login',
      path: '/login',
      component: LoginPage,
    },
    {
      name: 'register',
      path: '/register',
      component: RegisterPage,
    },
  ],
})

export default router
