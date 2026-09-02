<script setup>
import { useSeasonsStore } from '@/stores/seasons'
import { onMounted } from 'vue'

const seasonStore = useSeasonsStore()

onMounted(() => {
  seasonStore.getApiSeasons()
})
</script>
<template>
  <h1>Saisons</h1>
  <p v-if="seasonStore.loading === true">Chargement...</p>
  <p v-else-if="seasonStore.error">{{ seasonStore.error }}</p>
  <p v-else-if="seasonStore.seasons.length === 0">Aucune saison disponible</p>
  <div v-else>
    <ul>
      <li v-for="season in seasonStore.seasons" :key="season.id">
        <h2>Saisons : {{ season.label }}</h2>
        <span>Semaines : {{ season.weeksCount }}</span> |
        <span>Séances : {{ season.sessionsCount }}</span> |
        <RouterLink :to="`/seasons/${season.id}`">Plus d'info</RouterLink>
      </li>
    </ul>
  </div>
</template>
<style scoped></style>
