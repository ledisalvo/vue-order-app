<template>
  <div class="auth-page">
    <div class="auth-card">

      <div class="auth-header">
        <h1 class="auth-title">Creá tu cuenta</h1>
        <p class="auth-subtitle">¿Ya tenés cuenta? <RouterLink to="/login" class="auth-link">Ingresá</RouterLink></p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">

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
          <div class="password-wrap">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              :class="{ error: errors.password }"
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
        </div>

        <div class="field">
          <label class="field-label" for="confirm">Confirmar contraseña</label>
          <input
            id="confirm"
            v-model="form.confirm"
            :type="showPassword ? 'text' : 'password'"
            class="field-input"
            :class="{ error: errors.confirm }"
            placeholder="Repetí la contraseña"
            autocomplete="new-password"
          />
          <span v-if="errors.confirm" class="field-error">{{ errors.confirm }}</span>
        </div>

        <!-- Strength indicator -->
        <div v-if="form.password" class="strength-bar">
          <div class="strength-track">
            <div class="strength-fill" :style="{ width: strengthPct + '%' }" :class="strengthClass"></div>
          </div>
          <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>
        </div>

        <!-- Error global -->
        <div v-if="globalError" class="alert-error" role="alert">
          {{ globalError }}
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>

        <p class="terms">
          Al registrarte aceptás nuestros
          <RouterLink to="/terminos" class="auth-link">Términos y condiciones</RouterLink> y
          <RouterLink to="/privacidad" class="auth-link">Política de privacidad</RouterLink>.
        </p>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const form = reactive({ name: '', email: '', password: '', confirm: '' })
const errors = reactive({ name: '', email: '', password: '', confirm: '' })
const globalError = ref('')
const loading = ref(false)
const showPassword = ref(false)

const strengthPct = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8)  score += 25
  if (p.length >= 12) score += 15
  if (/[A-Z]/.test(p)) score += 20
  if (/[0-9]/.test(p)) score += 20
  if (/[^A-Za-z0-9]/.test(p)) score += 20
  return Math.min(score, 100)
})

const strengthClass = computed(() => {
  if (strengthPct.value < 40) return 'weak'
  if (strengthPct.value < 70) return 'medium'
  return 'strong'
})

const strengthLabel = computed(() => {
  if (strengthPct.value < 40) return 'Débil'
  if (strengthPct.value < 70) return 'Regular'
  return 'Fuerte'
})

function validate() {
  Object.keys(errors).forEach(k => errors[k] = '')
  let ok = true
  if (!form.name.trim())  { errors.name = 'El nombre es requerido'; ok = false }
  if (!form.email)        { errors.email = 'El email es requerido'; ok = false }
  if (form.password.length < 8) { errors.password = 'Mínimo 8 caracteres'; ok = false }
  if (form.password !== form.confirm) { errors.confirm = 'Las contraseñas no coinciden'; ok = false }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  globalError.value = ''
  loading.value = true
  try {
    await authStore.register(form.name, form.email, form.password)
    const redirect = route.query.redirect || sessionStorage.getItem('auth_redirect') || '/'
    sessionStorage.removeItem('auth_redirect')
    router.push(redirect)
  } catch (err) {
    globalError.value = err.message || 'Error al crear la cuenta. Intentá de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: #f9fafb;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,.06);
}

.auth-header { text-align: center; margin-bottom: 1.75rem; }
.auth-title  { font-size: 1.4rem; font-weight: 700; color: #111827; }
.auth-subtitle { margin-top: .4rem; font-size: .875rem; color: #6b7280; }
.auth-link   { color: #2563eb; text-decoration: none; font-weight: 500; }
.auth-link:hover { text-decoration: underline; }

.auth-form { display: flex; flex-direction: column; gap: 1.1rem; }

.field { display: flex; flex-direction: column; gap: .3rem; }
.field-label { font-size: .8rem; font-weight: 600; color: #374151; }
.field-input {
  width: 100%;
  padding: .65rem .85rem;
  border: 1.5px solid #e5e7eb;
  border-radius: .5rem;
  font-size: .9rem;
  color: #111827;
  transition: border-color .15s;
}
.field-input:focus { outline: none; border-color: #2563eb; }
.field-input.error { border-color: #ef4444; }
.field-error { font-size: .75rem; color: #ef4444; }

.password-wrap { position: relative; }
.password-wrap .field-input { padding-right: 2.5rem; }
.toggle-password {
  position: absolute;
  right: .65rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  display: flex;
}
.toggle-password svg { width: 18px; height: 18px; }
.toggle-password:hover { color: #374151; }

/* Strength */
.strength-bar { display: flex; align-items: center; gap: .75rem; }
.strength-track {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}
.strength-fill { height: 100%; border-radius: 2px; transition: width .3s; }
.strength-fill.weak   { background: #ef4444; }
.strength-fill.medium { background: #f59e0b; }
.strength-fill.strong { background: #22c55e; }
.strength-label { font-size: .75rem; font-weight: 600; min-width: 48px; }
.strength-label.weak   { color: #ef4444; }
.strength-label.medium { color: #f59e0b; }
.strength-label.strong { color: #22c55e; }

.alert-error {
  padding: .75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: .5rem;
  font-size: .85rem;
  color: #991b1b;
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  width: 100%;
  padding: .75rem;
  background: #111827;
  color: #fff;
  border: none;
  border-radius: .6rem;
  font-size: .95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
  margin-top: .25rem;
}
.btn-submit:hover:not(:disabled) { background: #2563eb; }
.btn-submit:disabled { background: #d1d5db; cursor: not-allowed; }

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.terms { font-size: .75rem; color: #9ca3af; text-align: center; line-height: 1.5; }
</style>
