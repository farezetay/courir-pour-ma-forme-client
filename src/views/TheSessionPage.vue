<script setup>
import { useSeasonsStore } from '@/stores/seasons'
import { useSessionStore } from '@/stores/session'
import { storeToRefs } from 'pinia'
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const seasonStore = useSeasonsStore()
const sessionStore = useSessionStore()
const { selectedSession: thisSession } = storeToRefs(seasonStore)
const route = useRoute()

onMounted(async () => {
  await seasonStore.getApiSeason(route.params.seasonId)
  if (!seasonStore.error) {
    seasonStore.selectSession(route.params.sessionId)
    if (thisSession.value) {
      sessionStore.prepareSession(thisSession.value, route.params.seasonId)
      sessionStore.restoreProgress()
    }
  }
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
<style scoped></style>
