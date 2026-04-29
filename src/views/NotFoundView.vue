<template>
  <div class="not-found">
    <div class="not-found-card">
      <p class="not-found-emoji">🏪</p>
      <h1 class="not-found-title">Esta tienda no existe o fue dada de baja</h1>
      <RouterLink to="/" class="not-found-link">Volver al inicio</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-found-card {
  text-align: center;
  padding: 2rem;
}

.not-found-emoji {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.not-found-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text, #1a1a1a);
}

.not-found-link {
  color: var(--color-primary, #4f46e5);
  text-decoration: underline;
  font-size: 1rem;
}
</style>
