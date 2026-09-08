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

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Connexion...' : 'Se connecter' }}
      </button>

      <RouterLink class="auth-switch" to="/register">
        Créer un compte
      </RouterLink>
    </form>
  </main>
</template>

<style scoped>
.auth-page {
  width: min(100%, 440px);
  margin: 0 auto;
}

.auth-form {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 26px 8px 26px 8px;
  box-shadow: var(--shadow);
}

label {
  color: var(--navy-950);
  font-weight: 700;
}

input {
  width: 100%;
  min-height: 52px;
  padding: 0.8rem 0.9rem;
  color: var(--ink);
  background: #fbfcfa;
  border: 1px solid #bfcac2;
  border-radius: 12px 4px 12px 4px;
}

input:focus {
  background: white;
  border-color: var(--green-600);
}

.auth-form button {
  width: 100%;
  margin-top: 0.35rem;
}

.auth-switch {
  display: block;
  margin-top: 0.25rem;
  color: var(--muted);
  font-weight: 700;
  text-align: center;
}
</style>
