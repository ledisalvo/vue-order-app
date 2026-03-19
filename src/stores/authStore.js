import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref(null)
    const user = ref(null)

    const isAuthenticated = computed(() => !!token.value)

    function setAuth(newToken, newUser) {
      token.value = newToken
      user.value = newUser
    }

    function clearAuth() {
      token.value = null
      user.value = null
    }

    return { token, user, isAuthenticated, setAuth, clearAuth }
  },
  { persist: true },
)
