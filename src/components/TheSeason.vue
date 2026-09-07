<script setup>
import { computed } from 'vue'
import { useSessionStore } from '@/stores/session'

const props = defineProps(['item'])
const sessionStore = useSessionStore()

const completedWeeks = computed(() => {
  return props.item.weeks.filter((week) =>
    week.sessions.every((session) => sessionStore.completedSessionIds.includes(session.id)),
  )
})

const currentWeek = computed(() => {
  return props.item.weeks.find((week) =>
    week.sessions.some((session) => !sessionStore.completedSessionIds.includes(session.id)),
  )
})
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

      <ul>
        <li v-for="session in currentWeek.sessions" :key="session.id">
          <span>Séance {{ session.number }}</span>

          <span v-if="sessionStore.completedSessionIds.includes(session.id)"> Terminée ✓ </span>

          <RouterLink class="button-link" :to="`/seasons/${item.id}/sessions/${session.id}`">
            {{ sessionStore.completedSessionIds.includes(session.id) ? 'Revoir' : 'Ouvrir' }}
          </RouterLink>
        </li>
      </ul>
    </article>

    <p v-else>Toute la saison est terminée ! Bravo !</p>
  </section>
</template>
<style scoped>
.completed-weeks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.completed-weeks li {
  padding: 8px 12px;
  border-radius: 20px;
  color: #135c38;
  background: #e2eee7;
}

.current-week {
  border: 2px solid #1f7a4c;
}
</style>
