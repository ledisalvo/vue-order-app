<template>
  <div class="onboarding-page">
    <div class="onboarding-card">

      <div class="onboarding-header">
        <p class="onboarding-step">Paso 3 de 3</p>
        <h1 class="onboarding-title">Conectar MercadoPago</h1>
      </div>

      <div class="mp-info">
        <div class="mp-icon">💳</div>
        <p class="mp-description">
          Para recibir pagos en tu tienda necesitás conectar tu cuenta de MercadoPago.
          Sin esto, tus clientes no podrán pagar online.
        </p>
      </div>

      <div class="btn-stack">
        <button class="btn-primary btn-mp" @click="handleConnect">
          Conectar MercadoPago
        </button>
        <button class="btn-link" @click="handleSkip">
          Lo hago después
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function handleConnect() {
  // TODO(fase-3): OAuth real de MercadoPago por tenant
  router.push({ name: 'onboarding-completed' })
}

function handleSkip() {
  router.push({ name: 'onboarding-completed' })
}
</script>

<style scoped>
.onboarding-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f9fafb);
  padding: 1rem;
}

.onboarding-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.onboarding-header {
  margin-bottom: 2rem;
}

.onboarding-step {
  font-size: 0.8rem;
  color: var(--color-muted, #6b7280);
  margin-bottom: 0.5rem;
}

.onboarding-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.mp-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f0fdf4;
  border-radius: 10px;
  margin-bottom: 2rem;
  text-align: center;
}

.mp-icon {
  font-size: 2.5rem;
}

.mp-description {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.5;
}

.btn-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-primary {
  background: var(--color-primary, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  width: 100%;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-mp {
  background: #009ee3;
}

.btn-link {
  background: transparent;
  border: none;
  color: var(--color-muted, #6b7280);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.5rem;
}

.btn-link:hover {
  color: #374151;
}
</style>
