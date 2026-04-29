<template>
  <div class="onboarding-page">
    <div class="onboarding-card">

      <div class="success-icon">🎉</div>
      <h1 class="success-title">¡Tu puestito está listo!</h1>

      <div v-if="storeSlug" class="store-link-box">
        <p class="store-link-label">Tu tienda está en:</p>
        <a
          :href="`/${storeSlug}`"
          class="store-link"
          target="_blank"
          rel="noopener"
        >
          puestito.app/{{ storeSlug }}
        </a>
      </div>

      <RouterLink :to="{ name: 'admin' }" class="btn-primary btn-full">
        Ir a mi panel →
      </RouterLink>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTenantStore } from '@/stores/tenantStore'
import { useOnboardingStore } from '@/stores/onboardingStore'

const tenantStore = useOnboardingStore()
const storeSlug = computed(
  () => useTenantStore().slug ?? tenantStore.step2Data.storeSlug,
)
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
  text-align: center;
}

.success-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.store-link-box {
  background: #f5f3ff;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 2rem;
}

.store-link-label {
  font-size: 0.875rem;
  color: var(--color-muted, #6b7280);
  margin-bottom: 0.5rem;
}

.store-link {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-primary, #4f46e5);
  text-decoration: underline;
  word-break: break-all;
}

.btn-primary {
  display: inline-block;
  background: var(--color-primary, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.15s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-full {
  width: 100%;
  text-align: center;
}
</style>
