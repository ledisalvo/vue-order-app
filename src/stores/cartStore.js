import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore(
  'cart',
  () => {
    const items = ref([])

    const totalItems = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))
    const totalAmount = computed(() =>
      items.value.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    )

    function addItem(product, quantity = 1) {
      const existing = items.value.find((i) => i.productId === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        items.value.push({
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity,
        })
      }
    }

    function removeItem(productId) {
      items.value = items.value.filter((i) => i.productId !== productId)
    }

    function updateQuantity(productId, quantity) {
      const item = items.value.find((i) => i.productId === productId)
      if (item) item.quantity = quantity
    }

    function clearCart() {
      items.value = []
    }

    return { items, totalItems, totalAmount, addItem, removeItem, updateQuantity, clearCart }
  },
  { persist: true },
)
