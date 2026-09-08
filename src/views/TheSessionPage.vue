<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useSeasonsStore } from '@/stores/seasons'
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'
import { onMounted, computed } from 'vue'

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

  // La séance d’essai est toujours la première séance
  // de la première semaine de la saison.
  const trialSession = seasonStore.selectedSeason.weeks[0]?.sessions[0]

  const isTrialSession = trialSession?.id === thisSession.value.id

  // Une séance autre que la séance d’essai nécessite un compte.
  if (!isTrialSession && !authStore.isAuthenticated) {
    router.replace({
      name: 'login',
      query: {
        redirect: route.fullPath,
      },
    })

    return
  }

  sessionStore.prepareSession(thisSession.value, route.params.seasonId)

  sessionStore.restoreProgress()
})

const reset = () => {
  const confirmed = window.confirm('Voulez-vous réinitialiser votre avancée dans la séance ?')
  if (confirmed) {
    sessionStore.resetSession()
  }
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
    <p v-if="seasonStore.loading">Chargement...</p>
    <p v-else-if="seasonStore.error">
      {{ seasonStore.error }}
    </p>
    <p v-else-if="!thisSession">Séance indisponible</p>
    <section v-else>
      <h1>Séance numéro {{ thisSession.number }}</h1>
      <RouterLink
        class="button-link"
        :to="{
          name: 'season',
          params: { id: route.params.seasonId },
        }"
      >
        Retour à la saison
      </RouterLink>
      <section class="session-overview">
        <p>
          <strong>{{ thisSession.steps.length }} étapes</strong>
          — Durée totale :
          <strong>{{ formatDuration(totalDuration) }}</strong>
        </p>

        <div class="session-timeline" aria-label="Déroulement de la séance">
          <span
            v-for="step in thisSession.steps"
            :key="step.position"
            class="step-segment"
            :class="`step-${step.type}`"
            :style="{ flexGrow: step.durationSeconds }"
            :title="`${getStepLabel(step.type)} : ${formatDuration(step.durationSeconds)}`"
          ></span>
        </div>

        <details>
          <summary>Voir le détail des étapes</summary>

          <ol class="step-list">
            <li v-for="step in thisSession.steps" :key="step.position">
              {{ getStepLabel(step.type) }}
              — {{ formatDuration(step.durationSeconds) }}
            </li>
          </ol>
        </details>
      </section>
      <div v-if="!sessionStore.isCompleted">
        <p>
          Étape {{ sessionStore.currentStepIndex + 1 }} /
          {{ sessionStore.activeSession.steps.length }}
        </p>
        <p>
          <strong>{{ sessionStore.currentStep.type }}</strong>
          — {{ sessionStore.remainingSeconds }} secondes
        </p>
        <div class="session-controls">
          <button v-if="!sessionStore.isRunning" type="button" @click="sessionStore.startTimer">
            Démarrer
          </button>
          <button v-else type="button" @click="sessionStore.pauseTimer">Pause</button>
          <button type="button" @click="reset">Réinitialiser la séance</button>
        </div>
      </div>
      <div v-else>
        <p>Séance terminée ! Bravo !</p>

        <button type="button" @click="reset">Recommencer la séance</button>
      </div>
      <button type="button" @click="resetCurrentWeek">Réinitialiser la semaine</button>
    </section>
  </main>
</template>
<style scoped>
.session-overview {
  margin: 20px 0;
  padding: 16px;
  background: white;
  border-radius: 16px;
}

.session-timeline {
  display: flex;
  height: 24px;
  margin: 16px 0;
  overflow: hidden;
  border-radius: 12px;
}

.step-segment {
  flex-basis: 0;
  min-width: 4px;
}

.step-echauffement {
  background: #f59e0b;
}

.step-trottes,
.step-cours {
  background: #22c55e;
}

.step-marches {
  background: #3b82f6;
}

.step-etirements {
  background: #8b5cf6;
}

.step-sprints,
.step-deboules {
  background: #ef4444;
}

details summary {
  min-height: 44px;
  cursor: pointer;
}

.step-list li {
  margin-bottom: 8px;
}
</style>
