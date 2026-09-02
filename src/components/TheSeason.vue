<script setup>
import { useSessionStore } from '@/stores/session'

defineProps(['item'])

const sessionStore = useSessionStore()
</script>
<template>
  <section class="season">
    <h2>Saison : {{ item.label }}</h2>
    <article v-for="week in item.weeks" :key="week.id" class="week">
      <h3>Semaine {{ week.number }}</h3>
      <ul>
        <li v-for="session in week.sessions" :key="session.id">
          <span>Séance {{ session.number }}</span>
          <span v-if="sessionStore.completedSessionIds.includes(session.id)"> — Terminée </span>
          <RouterLink class="button-link" :to="`/seasons/${item.id}/sessions/${session.id}`"> Ouvrir </RouterLink>
        </li>
      </ul>
    </article>
  </section>
</template>
<style scoped></style>
