<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const formError = ref(null)

const submitRegister = async () => {
  formError.value = null

  // La confirmation sert uniquement côté client :
  // elle ne doit pas être envoyée à l’API.
  if (password.value !== passwordConfirmation.value) {
    formError.value = 'Les mots de passe ne correspondent pas.'
    return
  }

  const userData = {
    username: username.value,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value,
  }

  const user = await authStore.register(userData)

  // Si register() renvoie null, le store contient déjà le message d’erreur.
  if (!user) {
    return
  }

  router.push('/login')
}
</script>

<template>
  <main class="auth-page">
    <h1>Créer un compte</h1>

    <form class="auth-form" @submit.prevent="submitRegister">
      <label for="username">Pseudo</label>
      <input
        id="username"
        v-model.trim="username"
        type="text"
        autocomplete="username"
        required
      />

      <label for="firstName">Prénom</label>
      <input
        id="firstName"
        v-model.trim="firstName"
        type="text"
        autocomplete="given-name"
        required
      />

      <label for="lastName">Nom</label>
      <input
        id="lastName"
        v-model.trim="lastName"
        type="text"
        autocomplete="family-name"
        required
      />

      <label for="email">Email</label>
      <input
        id="email"
        v-model.trim="email"
        type="email"
        autocomplete="email"
        required
      />

      <label for="password">Mot de passe</label>
      <input
        id="password"
        v-model="password"
        type="password"
        autocomplete="new-password"
        required
      />

      <label for="passwordConfirmation">Confirmer le mot de passe</label>
      <input
        id="passwordConfirmation"
        v-model="passwordConfirmation"
        type="password"
        autocomplete="new-password"
        required
      />

      <p v-if="formError" class="error" role="alert">
        {{ formError }}
      </p>

      <p v-else-if="authStore.error" class="error" role="alert">
        {{ authStore.error }}
      </p>

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? 'Création...' : 'Créer mon compte' }}
      </button>

      <RouterLink to="/login">J’ai déjà un compte</RouterLink>
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