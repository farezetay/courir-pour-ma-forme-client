<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const identifier = ref('')
const password = ref('')

const submitLogin = async () => {
  // Le store appelle l’API et renvoie l’utilisateur
  // lorsque la connexion réussit.
  const user = await authStore.login(
    identifier.value,
    password.value,
  )

  // En cas d’erreur, login() renvoie null
  // et le message est disponible dans authStore.error.
  if (!user) {
    return
  }

  // Une fois connecté, le coureur arrive
  // sur la liste des saisons.
  const redirect =
  typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/seasons'

router.push(redirect)
}
</script>

<template>
  <main class="auth-page">
    <h1>Connexion</h1>

    <!-- prevent empêche le rechargement HTML classique. -->
    <form class="auth-form" @submit.prevent="submitLogin">
      <label for="identifier">Email ou pseudo</label>
      <input
        id="identifier"
        v-model.trim="identifier"
        type="text"
        autocomplete="username"
        required
      />

      <label for="password">Mot de passe</label>
      <input
        id="password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        required
      />

      <p
        v-if="authStore.error"
        class="error"
        role="alert"
      >
        {{ authStore.error }}
      </p>

      <button
        type="submit"
        :disabled="authStore.loading"
      >
        {{
          authStore.loading
            ? 'Connexion...'
            : 'Se connecter'
        }}
      </button>

      <RouterLink to="/register">
        Créer un compte
      </RouterLink>
    </form>
  </main>
</template>

<style scoped>
.auth-page {
  width: min(100%, 420px);
  margin: 0 auto;
  padding: 1.5rem;
}

.auth-form {
  display: grid;
  gap: 0.75rem;
}

label {
  font-weight: 600;
}

input {
  min-height: 48px;
  padding: 0.75rem;
  border: 1px solid #999;
  border-radius: 0.5rem;
  font: inherit;
}

button {
  margin-top: 0.75rem;
}

.error {
  color: #b00020;
}
</style>