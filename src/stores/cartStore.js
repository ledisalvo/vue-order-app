import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApiService } from '@/services/api'

// TODO(fase-4): cambiar a false cuando el backend exponga /cart
const USE_MOCK = true

export const useCartStore = defineStore(
  'cart',
  () => {
    const items      = ref([])
    const promotions = ref([]) // [{ name, discount }]
    const loading    = ref(false)
    const syncing    = ref(false) // operación individual en curso

    // ─── Computed ────────────────────────────────────────────────
    const totalItems = computed(() =>
      items.value.reduce((sum, i) => sum + i.quantity, 0)
    )
    const subtotal = computed(() =>
      items.value.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    )
    const totalDiscount = computed(() =>
      promotions.value.reduce((sum, p) => sum + p.discount, 0)
    )
    const total = computed(() => subtotal.value - totalDiscount.value)

    // ─── Carga inicial (al hacer login) ──────────────────────────
    async function loadCart() {
      if (USE_MOCK) return // mock ya persiste en localStorage
      loading.value = true
      try {
        const data = await cartApiService.getCart()
        items.value      = data.items
        promotions.value = data.promotions ?? []
      } finally {
        loading.value = false
      }
    }

    // ─── Agregar item ─────────────────────────────────────────────
    async function addItem(product, quantity = 1) {
      // Optimistic update
      const existing = items.value.find(i => i.productId === product.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        items.value.push({
          productId: product.id,
          name:      product.name,
          unitPrice: product.price,
          image:     product.image ?? null,
          quantity,
        })
      }

      if (!USE_MOCK) {
        try {
          syncing.value = true
          const data = await cartApiService.addItem(product.id, quantity)
          // Sincronizar con respuesta del backend (precios congelados)
          items.value      = data.items
          promotions.value = data.promotions ?? []
        } catch {
          // Revertir optimistic update si falla
          if (existing) {
            existing.quantity -= quantity
          } else {
            items.value = items.value.filter(i => i.productId !== product.id)
          }
          throw new Error('Error al agregar al carrito')
        } finally {
          syncing.value = false
        }
      }
    }

    // ─── Actualizar cantidad ──────────────────────────────────────
    async function updateQuantity(productId, quantity) {
      const item = items.value.find(i => i.productId === productId)
      if (!item) return
      const prev = item.quantity
      item.quantity = quantity // optimistic

      if (!USE_MOCK) {
        try {
          syncing.value = true
          const data = await cartApiService.updateItem(productId, quantity)
          items.value      = data.items
          promotions.value = data.promotions ?? []
        } catch {
          item.quantity = prev
          throw new Error('Error al actualizar cantidad')
        } finally {
          syncing.value = false
        }
      }
    }

    // ─── Eliminar item ────────────────────────────────────────────
    async function removeItem(productId) {
      const removed = items.value.find(i => i.productId === productId)
      items.value = items.value.filter(i => i.productId !== productId) // optimistic

      if (!USE_MOCK) {
        try {
          syncing.value = true
          const data = await cartApiService.removeItem(productId)
          items.value      = data.items
          promotions.value = data.promotions ?? []
        } catch {
          if (removed) items.value.push(removed)
          throw new Error('Error al eliminar item')
        } finally {
          syncing.value = false
        }
      }
    }

    function clearCart() {
      items.value      = []
      promotions.value = []
    }

    return {
      items, promotions, loading, syncing,
      totalItems, subtotal, totalDiscount, total,
      loadCart, addItem, updateQuantity, removeItem, clearCart,
    }
  },
  { persist: true },
)
