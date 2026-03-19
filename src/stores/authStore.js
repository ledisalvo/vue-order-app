import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref(null)
    const user  = ref(null)

    const isAuthenticated = computed(() => !!token.value)

    async function login(email, password) {
      const data = await authService.login(email, password)
      token.value = data.token
      user.value  = data.user
    }

    async function register(name, email, password) {
      const data = await authService.register(name, email, password)
      token.value = data.token
      user.value  = data.user
    }

    function logout() {
      token.value = null
      user.value  = null
    }

    // Mantener por compatibilidad con código existente
    function setAuth(newToken, newUser) {
      token.value = newToken
      user.value  = newUser
    }

    return { token, user, isAuthenticated, login, register, logout, setAuth }
  },
  { persist: true },
)
