<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useSeasonsStore } from '@/stores/seasons'
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useProgressStore } from '@/stores/progress'

const progressStore = useProgressStore()
const sessionReady = ref(false)
const seasonStore = useSeasonsStore()
const sessionStore = useSessionStore()
const authStore = useAuthStore()
const router = useRouter()
const { selectedSession: thisSession } = storeToRefs(seasonStore)
const route = useRoute()

onMounted(async () => {
  await seasonStore.getApiSeason(route.params.seasonId)
  await authStore.getCurrentUser()

  if (seasonStore.error) {
    return
  }

  seasonStore.selectSession(route.params.sessionId)

  if (!thisSession.value) {
    return
  }

  const trialSession = seasonStore.selectedSeason.weeks[0]?.sessions[0]

  const isTrialSession = trialSession?.id === thisSession.value.id

  if (!isTrialSession && !authStore.isAuthenticated) {
    router.replace({
      name: 'login',
      query: {
        redirect: route.fullPath,
      },
    })

    return
  }

  let usesServerProgress = false

  if (authStore.isAuthenticated) {
    const progress = await progressStore.getProgress()

    if (!progress) {
      return
    }

    usesServerProgress = progress.activeSeason?.seasonId === route.params.seasonId

    // Un utilisateur connecté ne peut pas accéder aux séances
    // protégées d’une saison qui n’est pas active.
    if (!isTrialSession && !usesServerProgress) {
      router.replace({
        name: 'season',
        params: {
          id: route.params.seasonId,
        },
      })

      return
    }
  }

  sessionStore.prepareSession(thisSession.value, route.params.seasonId, !usesServerProgress)

  if (usesServerProgress) {
    const savedSession = progressStore.sessions.find((session) => {
      return session.sessionId === thisSession.value.id
    })

    sessionStore.restoreServerProgress(savedSession, progressStore.completedSessionIds)
  } else {
    sessionStore.completedSessionIds = []
    sessionStore.restoreProgress()
  }

  sessionReady.value = true
})

const syncProgress = async () => {
  if (!sessionReady.value || !authStore.isAuthenticated || !sessionStore.activeSession) {
    return
  }

  // On n’enregistre dans MySQL que si cette saison
  // est bien la saison active du compte.
  if (progressStore.activeSeason?.seasonId !== route.params.seasonId) {
    return
  }

  await progressStore.saveSessionProgress({
    sessionId: sessionStore.activeSession.id,
    currentStepIndex: sessionStore.currentStepIndex,
    remainingSeconds: sessionStore.remainingSeconds,
    isCompleted: sessionStore.isCompleted,
  })
}

const startSession = async () => {
  sessionStore.startTimer()
  await syncProgress()
}

const pauseSession = async () => {
  sessionStore.pauseTimer()
  await syncProgress()
}

// Sauvegarde lorsqu’on change d’étape
// ou lorsqu’une séance se termine.
watch([() => sessionStore.currentStepIndex, () => sessionStore.isCompleted], () => {
  void syncProgress()
})

// Pendant la course, sauvegarde toutes les 10 secondes.
// Cela évite d’envoyer une requête MySQL chaque seconde.
watch(
  () => sessionStore.remainingSeconds,
  (remainingSeconds) => {
    if (sessionStore.isRunning && remainingSeconds > 0 && remainingSeconds % 10 === 0) {
      void syncProgress()
    }
  },
)

const reset = async () => {
  const confirmed = window.confirm('Voulez-vous réinitialiser votre avancée dans la séance ?')

  if (!confirmed) {
    return
  }

  sessionStore.resetSession()
  await syncProgress()
}

const currentWeek = computed(() => {
  const weeks = seasonStore.selectedSeason?.weeks

  if (!weeks || !thisSession.value) {
    return null
  }

  return weeks.find((week) => week.sessions.some((session) => session.id === thisSession.value.id))
})

const resetCurrentWeek = () => {
  if (!currentWeek.value) {
    return
  }

  const confirmed = window.confirm('Voulez-vous réinitialiser toute cette semaine ?')

  if (!confirmed) {
    return
  }

  sessionStore.resetWeek(currentWeek.value)
}

const totalDuration = computed(() => {
  if (!thisSession.value) {
    return 0
  }

  return thisSession.value.steps.reduce((total, step) => total + step.durationSeconds, 0)
})

const stepLabels = {
  echauffement: 'Échauffement',
  trottes: 'Trotte',
  marches: 'Marche',
  etirements: 'Étirements',
  cours: 'Course',
  sprints: 'Sprint',
  deboules: 'Déboulés',
}

const getStepLabel = (type) => {
  return stepLabels[type] || type
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds} s`
  }

  if (remainingSeconds === 0) {
    return `${minutes} min`
  }

  return `${minutes} min ${remainingSeconds} s`
}
</script>
<template>
  <main class="session-page">
    <p v-if="seasonStore.loading || authStore.loading || (progressStore.loading && !sessionReady)">
      Chargement de la séance...
    </p>

    <p v-else-if="seasonStore.error">
      {{ seasonStore.error }}
    </p>

    <p v-else-if="progressStore.error && !sessionStore.activeSession" class="error">
      {{ progressStore.error }}
    </p>

    <p v-else-if="!thisSession">Séance indisponible</p>

    <p v-else-if="!sessionStore.activeSession">Préparation de la séance...</p>

    <section v-else class="session-content-page">
      <h1>Séance numéro {{ thisSession.number }}</h1>

      <RouterLink
        class="button-link back-link"
        :to="{
          name: 'season',
          params: {
            id: route.params.seasonId,
          },
        }"
      >
        Retour à la saison
      </RouterLink>

      <section class="session-overview">
        <p class="session-summary">
          <strong> {{ thisSession.steps.length }} étapes </strong>

          — Durée totale :

          <strong>
            {{ formatDuration(totalDuration) }}
          </strong>
        </p>

        <div class="session-timeline" aria-label="Déroulement de la séance">
          <span
            v-for="step in thisSession.steps"
            :key="step.position"
            class="step-segment"
            :class="`step-${step.type}`"
            :style="{
              flexGrow: step.durationSeconds,
            }"
            :title="`${getStepLabel(step.type)} :
              ${formatDuration(step.durationSeconds)}`"
          ></span>
        </div>

        <details class="step-details">
          <summary>Voir le détail des étapes</summary>

          <ol class="step-list">
            <li v-for="step in thisSession.steps" :key="step.position">
              {{ getStepLabel(step.type) }}
              —
              {{ formatDuration(step.durationSeconds) }}
            </li>
          </ol>
        </details>
      </section>

      <section v-if="!sessionStore.isCompleted" class="runner-card" aria-live="polite">
        <p class="runner-progress">
          Étape {{ sessionStore.currentStepIndex + 1 }}
          /
          {{ sessionStore.activeSession.steps.length }}
        </p>

        <p class="current-step">
          <strong>
            {{ getStepLabel(sessionStore.currentStep.type) }}
          </strong>

          <span class="current-step__time">
            {{ formatDuration(sessionStore.remainingSeconds) }}
          </span>
        </p>

        <div class="session-controls">
          <button
            v-if="!sessionStore.isRunning"
            class="primary-action"
            type="button"
            @click="startSession"
          >
            Démarrer ou reprendre
          </button>

          <button v-else class="secondary-action" type="button" @click="pauseSession">Pause</button>

          <button class="danger-action" type="button" @click="reset">
            Réinitialiser la séance
          </button>
        </div>
      </section>

      <section v-else class="completion-card">
        <p>Séance terminée ! Bravo !</p>

        <button type="button" @click="reset">Recommencer la séance</button>
      </section>

      <p v-if="progressStore.saving" class="saving-status" role="status">
        Sauvegarde de la progression...
      </p>

      <p v-if="progressStore.error && sessionStore.activeSession" class="error">
        {{ progressStore.error }}
      </p>

      <button class="danger-action reset-week" type="button" @click="resetCurrentWeek">
        Réinitialiser la semaine
      </button>
    </section>
  </main>
</template>
<style scoped>
.session-content-page > h1 {
  margin-bottom: 0.9rem;
}

.back-link {
  min-height: 44px;
  padding: 0.65rem 0.9rem;
  font-size: 0.88rem;
  background: var(--navy-800);
  box-shadow: none;
}

.session-overview {
  margin: 1.2rem 0;
  padding: 1.2rem;
  color: white;
  background:
    radial-gradient(circle at 100% 0%, rgb(134 188 36 / 28%), transparent 42%), var(--navy-950);
  border-radius: 24px 7px 24px 7px;
  box-shadow: var(--shadow);
}

.session-summary {
  margin-bottom: 0.8rem;
  color: rgb(255 255 255 / 82%);
}

.session-summary strong {
  color: white;
}

.session-timeline {
  display: flex;
  height: 28px;
  margin: 1rem 0;
  overflow: hidden;
  background: rgb(255 255 255 / 12%);
  border: 3px solid rgb(255 255 255 / 18%);
  border-radius: 999px;
}

.step-segment {
  flex-basis: 0;
  min-width: 4px;
  border-right: 1px solid rgb(255 255 255 / 32%);
}

.step-echauffement {
  background: #f1b63f;
}

.step-trottes,
.step-cours {
  background: var(--green-500);
}

.step-marches {
  background: #57b9ca;
}

.step-etirements {
  background: #b58bc8;
}

.step-sprints,
.step-deboules {
  background: #ee705e;
}

.step-details {
  border-top: 1px solid rgb(255 255 255 / 18%);
}

.step-details summary {
  display: flex;
  align-items: center;
  min-height: 48px;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.step-list {
  margin: 0;
  padding-left: 1.5rem;
}

.step-list li {
  padding: 0.55rem 0;
  color: rgb(255 255 255 / 82%);
  border-bottom: 1px solid rgb(255 255 255 / 12%);
}

.runner-card {
  margin: 1.2rem 0;
  padding: 1.25rem;
  background: white;
  border: 1px solid var(--line);
  border-top: 6px solid var(--green-500);
  border-radius: 7px 26px 7px 26px;
  box-shadow: var(--shadow);
}

.runner-progress {
  margin-bottom: 0.75rem;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.current-step {
  display: grid;
  gap: 0.35rem;
  margin-bottom: 1.4rem;
  text-align: center;
}

.current-step strong {
  color: var(--green-600);
  font-family: 'Oswald', sans-serif;
  font-size: 1.45rem;
  text-transform: uppercase;
}

.current-step__time {
  color: var(--navy-950);
  font-family: 'Oswald', sans-serif;
  font-size: clamp(3.6rem, 18vw, 6rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
}

.session-controls {
  display: grid;
  gap: 0.75rem;
}

.session-controls button {
  width: 100%;
}

.completion-card {
  margin: 1.2rem 0;
  padding: 1.4rem;
  color: var(--navy-950);
  text-align: center;
  background: var(--green-100);
  border: 2px solid #cfe5a7;
  border-radius: 24px 7px 24px 7px;
}

.completion-card p {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
}

.completion-card button {
  width: 100%;
}

.saving-status {
  color: var(--muted);
  font-size: 0.82rem;
  text-align: center;
}

.reset-week {
  width: 100%;
  margin-top: 1rem;
}
</style>
