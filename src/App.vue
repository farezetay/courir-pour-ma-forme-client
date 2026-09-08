<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import { useSessionStore } from '@/stores/session'

const progressStore = useProgressStore()
const sessionStore = useSessionStore()

const authStore = useAuthStore()
const router = useRouter()

// Au rechargement, Pinia est vide.
// Cette requête utilise le cookie pour retrouver l’utilisateur connecté.
onMounted(() => {
  authStore.getCurrentUser()
})

const logout = async () => {
  await authStore.logout()

  // On redirige seulement si la déconnexion a réussi.
  if (!authStore.isAuthenticated) {
    sessionStore.clearSessionState()
    progressStore.$reset()
    router.push('/login')
  }
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink class="brand" to="/seasons" aria-label="Accueil des saisons">
        <img class="brand__mark" src="/logo-192-192.png" alt="" />
        <span class="brand__name">Courir pour ma forme</span>
      </RouterLink>

      <span v-if="authStore.isAuthenticated" class="account-chip">
        Bonjour {{ authStore.user.username }}
      </span>
    </header>

    <div class="app-main">
      <p v-if="authStore.loading && !authStore.user" class="loading-state">
        Chargement du compte...
      </p>

      <RouterView />
    </div>

    <nav class="app-nav" aria-label="Navigation principale">
      <RouterLink class="app-nav__link" to="/seasons">Saisons</RouterLink>

      <template v-if="authStore.isAuthenticated">
        <button class="app-nav__button" type="button" @click="logout">Se déconnecter</button>
      </template>

      <template v-else>
        <RouterLink class="app-nav__link" to="/login">Connexion</RouterLink>
        <RouterLink class="app-nav__link" to="/register">Inscription</RouterLink>
      </template>
    </nav>
  </div>
</template>

<style scoped></style>
