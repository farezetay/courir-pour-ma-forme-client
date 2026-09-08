<script setup>
import { useSeasonsStore } from '@/stores/seasons'
import { onMounted } from 'vue'

const seasonStore = useSeasonsStore()

onMounted(() => {
  seasonStore.getApiSeasons()
})
</script>
<template>
  <main class="seasons-page">
    <header class="page-heading">
      <p class="eyebrow">Choisissez votre objectif</p>
      <h1>Saisons</h1>
      <p class="lead">Un programme progressif, pensé pour avancer à votre rythme.</p>
    </header>

    <p v-if="seasonStore.loading === true" class="loading-state">Chargement...</p>
    <p v-else-if="seasonStore.error" class="error">{{ seasonStore.error }}</p>
    <p v-else-if="seasonStore.seasons.length === 0">Aucune saison disponible</p>

    <ul v-else class="season-grid">
      <li v-for="season in seasonStore.seasons" :key="season.id" class="season-card">
        <div class="season-card__topline">
          <span>Programme progressif</span>
          <strong>{{ season.id }}</strong>
        </div>

        <h2>{{ season.label }}</h2>

        <div class="season-card__stats">
          <span><strong>{{ season.weeksCount }}</strong> semaines</span>
          <span><strong>{{ season.sessionsCount }}</strong> séances</span>
        </div>

        <RouterLink class="button-link button-link--green" :to="`/seasons/${season.id}`">
          Voir le programme
        </RouterLink>
      </li>
    </ul>
  </main>
</template>
<style scoped>
.season-grid {
  display: grid;
  gap: 1rem;
  margin: 0;
}

.season-card {
  position: relative;
  isolation: isolate;
  min-height: 250px;
  padding: 1.35rem;
  overflow: hidden;
  color: white;
  background: var(--navy-950);
  border-radius: 28px 8px 28px 8px;
  box-shadow: var(--shadow);
}

.season-card:nth-child(even) {
  background: linear-gradient(145deg, #173e60, #012c4d 72%);
}

.season-card::after {
  position: absolute;
  right: -42px;
  bottom: -58px;
  z-index: -1;
  width: 180px;
  height: 180px;
  content: '';
  background: var(--green-500);
  border-radius: 50%;
  opacity: 0.18;
}

.season-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  color: rgb(255 255 255 / 76%);
  font-size: 0.76rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.season-card__topline strong {
  display: grid;
  width: 54px;
  height: 54px;
  color: var(--navy-950);
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  place-items: center;
  background: var(--green-500);
  border-radius: 50% 50% 50% 12px;
}

.season-card h2 {
  max-width: 13ch;
  margin-bottom: 1rem;
  color: white;
}

.season-card__stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.3rem;
  color: rgb(255 255 255 / 78%);
}

.season-card__stats strong {
  color: white;
  font-size: 1.15rem;
}

.season-card .button-link {
  width: 100%;
}

@media (min-width: 620px) {
  .season-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
