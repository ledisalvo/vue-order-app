<template>
  <div class="auth-page">
    <div class="auth-card">

      <div class="auth-header">
        <h1 class="auth-title">Ingresá a tu cuenta</h1>
        <p class="auth-subtitle">¿No tenés cuenta? <RouterLink to="/registro" class="auth-link">Registrate</RouterLink></p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">

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
            required
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
              placeholder="••••••••"
              autocomplete="current-password"
              required
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

        <!-- Error global -->
        <div v-if="globalError" class="alert-error" role="alert">
          {{ globalError }}
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router   = useRouter()
const route    = useRoute()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const globalError = ref('')
const loading = ref(false)
const showPassword = ref(false)

function validate() {
  errors.email    = ''
  errors.password = ''
  let ok = true
  if (!form.email) { errors.email = 'El email es requerido'; ok = false }
  if (!form.password) { errors.password = 'La contraseña es requerida'; ok = false }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  globalError.value = ''
  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    const redirect = route.query.redirect || sessionStorage.getItem('auth_redirect') || '/'
    sessionStorage.removeItem('auth_redirect')
    router.push(redirect)
  } catch (err) {
    globalError.value = err.response?.status === 401
      ? 'Email o contraseña incorrectos'
      : (err.message || 'Error al iniciar sesión. Intentá de nuevo.')
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
</style>
