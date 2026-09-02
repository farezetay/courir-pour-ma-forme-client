<script setup>
const props = defineProps(['item'])
</script>
<template>
  <section class="season">
    <h2>Saison : {{ item.label }}</h2>
    <span>Semaines : {{ item.weeks.length }}</span>
  </section>
</template>
<style scoped></style>
