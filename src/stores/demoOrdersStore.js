import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDemoOrdersStore = defineStore(
  'demoOrders',
  () => {
    const orders = ref([])

    const lastOrder = computed(() => orders.value[orders.value.length - 1] ?? null)

    function addOrder(order) {
      orders.value.push(order)
    }

    return { orders, lastOrder, addOrder }
  },
  { persist: true },
)
