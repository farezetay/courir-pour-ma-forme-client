<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <h1>Mon App</h1>
  <nav>
    <RouterLink to="/">Seasons</RouterLink>
  </nav>
  <div>
    <RouterView></RouterView>
  </div>
</template>

<style scoped></style>
