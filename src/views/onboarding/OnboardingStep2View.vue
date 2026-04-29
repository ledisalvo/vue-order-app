<template>
  <div class="onboarding-page">
    <div class="onboarding-card">

      <div class="onboarding-header">
        <p class="onboarding-step">Paso 2 de 3</p>
        <h1 class="onboarding-title">Tu tienda</h1>
      </div>

      <form class="onboarding-form" @submit.prevent="handleNext">

        <div class="field">
          <label class="field-label" for="storeName">Nombre de tu tienda</label>
          <input
            id="storeName"
            v-model="form.storeName"
            type="text"
            class="field-input"
            :class="{ error: errors.storeName }"
            placeholder="Ej: RK54 Chicks"
            @input="updateSlug"
          />
          <span v-if="errors.storeName" class="field-error">{{ errors.storeName }}</span>
          <span v-if="slugPreview" class="slug-preview">
            Tu tienda estará en <strong>puestito.app/{{ slugPreview }}</strong>
          </span>
        </div>

        <div class="field">
          <label class="field-label" for="category">Categoría</label>
          <select
            id="category"
            v-model="form.category"
            class="field-input"
            :class="{ error: errors.category }"
          >
            <option value="" disabled>Seleccioná una categoría</option>
            <option value="ropa">Ropa</option>
            <option value="comida">Comida</option>
            <option value="electronica">Electrónica</option>
            <option value="servicios">Servicios</option>
            <option value="otro">Otro</option>
          </select>
          <span v-if="errors.category" class="field-error">{{ errors.category }}</span>
        </div>

        <p v-if="errors.submit" class="field-error">{{ errors.submit }}</p>

        <div class="btn-row">
          <button type="button" class="btn-secondary" @click="router.back()">← Atrás</button>
          <button type="submit" class="btn-primary" :disabled="onboardingStore.loading">
            {{ onboardingStore.loading ? 'Creando...' : 'Siguiente →' }}
          </button>
        </div>

      </form>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '@/stores/onboardingStore'

const router = useRouter()
const onboardingStore = useOnboardingStore()

const form = reactive({
  storeName: onboardingStore.step2Data.storeName,
  category:  onboardingStore.step2Data.category,
})

const errors = reactive({ storeName: '', category: '', submit: '' })

const slugPreview = computed(() => generateSlug(form.storeName))

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // quita tildes
    .replace(/[^a-z0-9\s-]/g, '')     // solo alfanumérico
    .trim()
    .replace(/\s+/g, '-')             // espacios a guiones
    .replace(/-+/g, '-')              // guiones consecutivos
    .slice(0, 60)
}

function updateSlug() {
  onboardingStore.setStep2({ storeSlug: generateSlug(form.storeName) })
}

function validate(): boolean {
  errors.storeName = form.storeName.trim() ? '' : 'El nombre de la tienda es obligatorio'
  errors.category  = form.category         ? '' : 'Seleccioná una categoría'
  return !errors.storeName && !errors.category
}

async function handleNext() {
  if (!validate()) return

  onboardingStore.setStep2({
    storeName: form.storeName,
    storeSlug: generateSlug(form.storeName),
    category:  form.category,
  })

  try {
    await onboardingStore.submitOnboarding()
    router.push({ name: 'onboarding-step3' })
  } catch {
    errors.submit = onboardingStore.error ?? 'Error inesperado'
  }
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

.onboarding-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.field-input {
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s;
  background: white;
}

.field-input:focus {
  border-color: var(--color-primary, #4f46e5);
}

.field-input.error {
  border-color: #ef4444;
}

.field-error {
  font-size: 0.8rem;
  color: #ef4444;
}

.slug-preview {
  font-size: 0.8rem;
  color: var(--color-muted, #6b7280);
}

.btn-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-primary {
  flex: 1;
  background: var(--color-primary, #4f46e5);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  flex: 1;
  background: transparent;
  color: var(--color-muted, #6b7280);
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.15s;
}

.btn-secondary:hover {
  border-color: #9ca3af;
}
</style>
