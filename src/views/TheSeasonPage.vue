<script setup>
import TheSeason from '@/components/TheSeason.vue'
import { useSessionStore } from '@/stores/session'
import { useSeasonsStore } from '@/stores/seasons'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const seasonStore = useSeasonsStore()
const sessionStore = useSessionStore()
const route = useRoute()

onMounted(async () => {
  await seasonStore.getApiSeason(route.params.id)

  if (!seasonStore.error) {
    sessionStore.restoreCompletedSessions(route.params.id)
  }
})
</script>
<template>
  <h1>Votre saison</h1>
  <p v-if="seasonStore.loading === true">Chargement...</p>
  <p v-else-if="seasonStore.error">{{ seasonStore.error }}</p>
  <p v-else-if="!seasonStore.selectedSeason">Saison indisponible</p>
  <div v-else>
    <TheSeason :item="seasonStore.selectedSeason"></TheSeason>
  </div>
</template>
<style scoped></style>
