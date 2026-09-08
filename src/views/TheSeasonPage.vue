<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TheSeason from '@/components/TheSeason.vue'
import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import { useSeasonsStore } from '@/stores/seasons'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const progressStore = useProgressStore()
const seasonStore = useSeasonsStore()
const sessionStore = useSessionStore()

const showProgressChoices = ref(false)

const isActiveSeason = computed(() => {
  return progressStore.activeSeason?.seasonId === route.params.id
})

const hasAnotherActiveSeason = computed(() => {
  return progressStore.activeSeason !== null && !isActiveSeason.value
})

onMounted(async () => {
  await seasonStore.getApiSeason(route.params.id)
  await authStore.getCurrentUser()
  sessionStore.completedSessionIds = []

  if (seasonStore.error) {
    return
  }

  // Un visiteur non connecté utilise uniquement
  // la progression enregistrée dans le localStorage.
  if (!authStore.isAuthenticated) {
    sessionStore.restoreCompletedSessions(route.params.id)
    return
  }

  // Un utilisateur connecté récupère sa progression MySQL.
  const progress = await progressStore.getProgress()

  if (progress && progress.activeSeason?.seasonId === route.params.id) {
    sessionStore.completedSessionIds = [...progress.completedSessionIds]
  }
})

const openCurrentSession = () => {
  const season = seasonStore.selectedSeason

  if (!season) {
    return
  }

  // Regroupe toutes les séances de toutes les semaines
  // dans un seul tableau.
  const allSessions = season.weeks.flatMap((week) => {
    return week.sessions
  })

  // S’il existe une séance commencée, on la reprend.
  // Sinon, on cherche la première séance non terminée.
  const sessionToOpen =
    allSessions.find((session) => {
      return session.id === progressStore.currentSession?.sessionId
    }) ||
    allSessions.find((session) => {
      return !progressStore.completedSessionIds.includes(session.id)
    })

  if (!sessionToOpen) {
    return
  }

  router.push({
    name: 'session',
    params: {
      seasonId: season.id,
      sessionId: sessionToOpen.id,
    },
  })
}

const startSeason = async (mode = null) => {
  showProgressChoices.value = false

  const result = await progressStore.startSeason(route.params.id, mode)

  if (!result) {
    // Si aucune saison n’est active mais que l’API renvoie 409,
    // une ancienne progression doit être reprise ou recommencée.
    if (progressStore.errorStatus === 409 && !progressStore.activeSeason) {
      showProgressChoices.value = true
    }

    return
  }

  sessionStore.completedSessionIds = [...progressStore.completedSessionIds]
  openCurrentSession()
}

const abandonSeason = async () => {
  const confirmed = window.confirm(
    'Voulez-vous vraiment abandonner cette saison ? Votre progression sera conservée.',
  )

  if (!confirmed) {
    return
  }

  await progressStore.abandonSeason(route.params.id)
}
</script>
<template>
  <main class="season-page">
    <h1>Votre saison</h1>

    <p v-if="seasonStore.loading">Chargement...</p>

    <p v-else-if="seasonStore.error">
      {{ seasonStore.error }}
    </p>

    <p v-else-if="!seasonStore.selectedSeason">Saison indisponible</p>

    <div v-else>
      <section class="season-actions">
        <template v-if="!authStore.isAuthenticated">
          <p>
            La première séance est gratuite. Connectez-vous pour enregistrer votre progression et
            accéder aux suivantes.
          </p>

          <RouterLink class="button-link button-link--green" to="/login"> Se connecter </RouterLink>
        </template>

        <template v-else-if="isActiveSeason">
          <p>Cette saison est actuellement en cours.</p>
          <button class="primary-action" type="button" @click="openCurrentSession">
            Continuer la saison
          </button>
          <button
            class="danger-action"
            type="button"
            :disabled="progressStore.loading"
            @click="abandonSeason"
          >
            Abandonner la saison
          </button>
        </template>

        <template v-else-if="hasAnotherActiveSeason">
          <p>
            Vous suivez déjà une autre saison. Vous devez l’abandonner avant d’en commencer une
            nouvelle.
          </p>

          <RouterLink
            class="button-link"
            :to="{
              name: 'season',
              params: {
                id: progressStore.activeSeason.seasonId,
              },
            }"
          >
            Voir ma saison active
          </RouterLink>
        </template>

        <template v-else>
          <button
            class="primary-action"
            type="button"
            :disabled="progressStore.loading"
            @click="startSeason()"
          >
            {{ progressStore.loading ? 'Chargement...' : 'Commencer cette saison' }}
          </button>

          <div v-if="showProgressChoices" class="progress-choices">
            <p>Une ancienne progression existe pour cette saison.</p>

            <button
              class="primary-action"
              type="button"
              :disabled="progressStore.loading"
              @click="startSeason('resume')"
            >
              Reprendre ma progression
            </button>

            <button
              class="secondary-action"
              type="button"
              :disabled="progressStore.loading"
              @click="startSeason('restart')"
            >
              Recommencer depuis le début
            </button>
          </div>
        </template>

        <p v-if="progressStore.error" class="error">
          {{ progressStore.error }}
        </p>
      </section>

      <TheSeason :item="seasonStore.selectedSeason" />
    </div>
  </main>
</template>
<style scoped>
.season-actions {
  display: grid;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding: 1.2rem;
  background: var(--navy-950);
  border-radius: 24px 7px 24px 7px;
  box-shadow: var(--shadow);
}

.season-actions p {
  margin-bottom: 0;
  color: rgb(255 255 255 / 82%);
}

.progress-choices {
  display: grid;
  gap: 0.75rem;
}

.season-actions button,
.season-actions .button-link {
  width: 100%;
}

.progress-choices {
  margin-top: 0.25rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(255 255 255 / 18%);
}
</style>
