import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { authService } from '@/services/api'
import type { User, AuthResponse, JwtPayload } from '@/types'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null)
    const user  = ref<User | null>(null)

    const isAuthenticated = computed(() => !!token.value)

    const role = computed((): User['role'] | null => {
      if (!token.value) return null
      try {
        return jwtDecode<JwtPayload>(token.value).role ?? null
      } catch {
        return null
      }
    })

    function _hydrateUser(accessToken: string, userData?: Partial<User> | null) {
      token.value = accessToken
      if (userData) {
        user.value = userData as User
      } else {
        try {
          const payload = jwtDecode<JwtPayload>(accessToken)
          user.value = { id: payload.sub, email: payload.email, role: payload.role }
        } catch {
          user.value = null
        }
      }
    }

    async function login(email: string, password: string): Promise<void> {
      const data: AuthResponse = await authService.login(email, password)
      _hydrateUser(data.accessToken)
    }

    async function register(name: string, email: string, password: string): Promise<void> {
      const data: AuthResponse = await authService.register(name, email, password)
      _hydrateUser(data.accessToken)
    }

    function setAuth(accessToken: string, userData?: Partial<User> | null) {
      _hydrateUser(accessToken, userData)
    }

    function logout() {
      token.value = null
      user.value  = null
    }

    return { token, user, isAuthenticated, role, login, register, logout, setAuth }
  },
  { persist: true },
)
