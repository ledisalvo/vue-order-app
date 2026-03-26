import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const cartOpen = ref(false)
  const mobileMenuOpen = ref(false)
  const globalLoading = ref(false)

  function toggleCart() {
    cartOpen.value = !cartOpen.value
  }

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  function setGlobalLoading(val) {
    globalLoading.value = val
  }

  return { cartOpen, mobileMenuOpen, globalLoading, toggleCart, toggleMobileMenu, setGlobalLoading }
})
