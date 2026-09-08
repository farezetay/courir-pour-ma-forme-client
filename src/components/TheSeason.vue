<script setup>
import { computed } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useProgressStore } from '@/stores/progress'
import { useSessionStore } from '@/stores/session'

const props = defineProps(['item'])

const authStore = useAuthStore()
const progressStore = useProgressStore()
const sessionStore = useSessionStore()

const completedWeeks = computed(() => {
  return props.item.weeks.filter((week) => {
    return week.sessions.every((session) => {
      return sessionStore.completedSessionIds.includes(session.id)
    })
  })
})

const currentWeek = computed(() => {
  return props.item.weeks.find((week) => {
    return week.sessions.some((session) => {
      return !sessionStore.completedSessionIds.includes(session.id)
    })
  })
})

// La séance d’essai est la première séance
// de la première semaine de cette saison.
const trialSessionId = computed(() => {
  return props.item.weeks[0]?.sessions[0]?.id
})

const isTrialSession = (session) => {
  return session.id === trialSessionId.value
}

const isCompleted = (session) => {
  return sessionStore.completedSessionIds.includes(session.id)
}

const isSeasonActive = computed(() => {
  return progressStore.activeSeason?.seasonId === props.item.id
})

const canOpenSession = (session) => {
  // La séance d’essai est toujours accessible.
  if (isTrialSession(session)) {
    return true
  }

  // Les autres nécessitent un compte et cette saison active.
  return authStore.isAuthenticated && isSeasonActive.value
}

const getSessionPath = (session) => {
  return `/seasons/${props.item.id}/sessions/${session.id}`
}

const isLockedForVisitor = (session) => {
  return !authStore.isAuthenticated && !isTrialSession(session)
}
</script>
<template>
  <section class="season">
    <h2>Saison : {{ item.label }}</h2>

    <div v-if="completedWeeks.length">
      <h3>Semaines terminées</h3>

      <ul class="completed-weeks">
        <li v-for="week in completedWeeks" :key="week.id">Semaine {{ week.number }} ✓</li>
      </ul>
    </div>

    <article v-if="currentWeek" class="week current-week">
      <p>En cours</p>
      <h3>Semaine {{ currentWeek.number }}</h3>

      <ul class="session-list">
        <li v-for="session in currentWeek.sessions" :key="session.id" class="session-item">
          <div
            class="session-content"
            :class="{
              blurred: isLockedForVisitor(session),
            }"
          >
            <span>Séance {{ session.number }}</span>

            <span v-if="isCompleted(session)"> Terminée ✓ </span>

            <span v-else-if="isTrialSession(session)"> Essai gratuit </span>

            <RouterLink
              v-if="canOpenSession(session)"
              class="button-link"
              :to="getSessionPath(session)"
            >
              {{ isCompleted(session) ? 'Revoir' : 'Ouvrir' }}
            </RouterLink>

            <span v-else-if="authStore.isAuthenticated">
              Démarrez cette saison pour accéder à la séance
            </span>
          </div>

          <RouterLink
            v-if="isLockedForVisitor(session)"
            class="session-login-overlay"
            :to="{
              name: 'login',
              query: {
                redirect: getSessionPath(session),
              },
            }"
          >
            Connectez-vous pour accéder à cette séance
          </RouterLink>
        </li>
      </ul>
    </article>

    <p v-else>Toute la saison est terminée ! Bravo !</p>
  </section>
</template>
<style scoped>
.season > h2 {
  margin: 1.6rem 0 1rem;
}

.season > div h3 {
  margin-bottom: 0.7rem;
}

.completed-weeks {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.completed-weeks li {
  padding: 0.5rem 0.75rem;
  color: var(--navy-950);
  font-size: 0.84rem;
  background: var(--green-100);
  border: 1px solid #d8eab9;
  border-radius: 999px;
}

.current-week {
  padding: 1.2rem;
  background: white;
  border: 1px solid var(--line);
  border-top: 5px solid var(--green-500);
  border-radius: 7px 24px 7px 24px;
  box-shadow: var(--shadow-soft);
}

.current-week > p {
  margin-bottom: 0.25rem;
  color: var(--green-600);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.current-week > h3 {
  margin-bottom: 1rem;
}

.session-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.session-item {
  position: relative;
  min-height: 126px;
  padding: 1rem;
  overflow: hidden;
  background: #f9faf7;
  border: 1px solid var(--line);
  border-radius: 18px 5px 18px 5px;
}

.session-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  width: 100%;
}

.session-content > span:first-child {
  color: var(--navy-950);
  font-family: 'Oswald', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
}

.session-content > span:nth-child(2) {
  padding: 0.3rem 0.55rem;
  color: #486b17;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--green-100);
  border-radius: 999px;
}

.session-content .button-link {
  width: 100%;
}

.session-content.blurred {
  opacity: 0.4;
  filter: blur(4px) grayscale(0.35);
  pointer-events: none;
  user-select: none;
}

.session-login-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: var(--navy-950);
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  background: rgb(255 255 255 / 64%);
  border: 2px solid transparent;
  transition: background-color 150ms ease;
}

.session-login-overlay:hover,
.session-login-overlay:focus-visible {
  background: rgb(238 247 220 / 88%);
}

.season > p:last-child {
  padding: 1rem;
  color: var(--navy-950);
  background: var(--green-100);
  border-radius: 18px 5px 18px 5px;
}
</style>
