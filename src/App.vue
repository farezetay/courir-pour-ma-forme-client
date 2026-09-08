<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
    router.push('/login')
  }
}
</script>

<template>
  <header>
    <h1>Courir pour ma forme</h1>

    <nav>
      <RouterLink to="/seasons">Saisons</RouterLink>

      <template v-if="authStore.isAuthenticated">
        <span>Bonjour {{ authStore.user.username }}</span>

        <button type="button" @click="logout">
          Se déconnecter
        </button>
      </template>

      <template v-else>
        <RouterLink to="/login">Connexion</RouterLink>
        <RouterLink to="/register">Inscription</RouterLink>
      </template>
    </nav>
  </header>

  <main>
    <p v-if="authStore.loading && !authStore.user">
  Chargement du compte...
</p>

<RouterView />
  </main>
</template>

<style scoped>
nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}
</style>