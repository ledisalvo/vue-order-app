<template>
  <div class="onboarding-page">
    <div class="onboarding-card">

      <div class="onboarding-header">
        <p class="onboarding-step">Paso 1 de 3</p>
        <h1 class="onboarding-title">Tus datos personales</h1>
      </div>

      <form class="onboarding-form" @submit.prevent="handleNext">

        <div class="field">
          <label class="field-label" for="name">Nombre completo</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="field-input"
            :class="{ error: errors.name }"
            placeholder="Juan Pérez"
            autocomplete="name"
          />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="field">
          <label class="field-label" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="field-input"
            :class="{ error: errors.email }"
            placeholder="tu@email.com"
            autocomplete="email"
          />
          <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
        </div>

        <div class="field">
          <label class="field-label" for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="field-input"
            :class="{ error: errors.password }"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
          />
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <button type="submit" class="btn-primary btn-full">Siguiente →</button>

      </form>

      <p class="onboarding-footer">
        ¿Ya tenés cuenta?
        <RouterLink to="/auth/login" class="auth-link">Ingresá</RouterLink>
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '@/stores/onboardingStore'

const router = useRouter()
const onboardingStore = useOnboardingStore()

const form = reactive({
  name:     onboardingStore.step1Data.name,
  email:    onboardingStore.step1Data.email,
  password: onboardingStore.step1Data.password,
})

const errors = reactive({ name: '', email: '', password: '' })

function validate(): boolean {
  errors.name     = form.name.trim()     ? '' : 'El nombre es obligatorio'
  errors.email    = form.email.trim()    ? '' : 'El email es obligatorio'
  errors.password = form.password.length >= 8 ? '' : 'La contraseña debe tener al menos 8 caracteres'
  return !errors.name && !errors.email && !errors.password
}

function handleNext() {
  if (!validate()) return
  onboardingStore.setStep1({ name: form.name, email: form.email, password: form.password })
  router.push({ name: 'onboarding-step2' })
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

.btn-primary {
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

.btn-full {
  width: 100%;
  margin-top: 0.5rem;
}

.onboarding-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-muted, #6b7280);
}

.auth-link {
  color: var(--color-primary, #4f46e5);
  text-decoration: underline;
}
</style>
