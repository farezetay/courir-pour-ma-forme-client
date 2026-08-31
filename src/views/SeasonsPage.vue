<script setup>
import { useSeasonsStore } from '@/stores/seasons'
import { onMounted } from 'vue'

const seasonStore = useSeasonsStore()

onMounted(() => {
  seasonStore.getApiSeasons()
})
</script>
<template>
  <h1>Seasons</h1>
  <p v-if="seasonStore.loading === true">Chargement...</p>
  <p v-else-if="seasonStore.error">{{ seasonStore.error }}</p>
  <p v-else-if="seasonStore.seasons.length === 0">Aucune saison disponible</p>
  <div v-else>
    <ul>
      <li v-for="season in seasonStore.seasons" :key="season.id">
        <span>Saisons : {{ season.label }}</span> |
        <span>Semaines : {{ season.weeksCount }}</span> |
        <span>Séances : {{ season.sessionsCount }}</span>
      </li>
    </ul>
  </div>
</template>
<style scoped></style>
