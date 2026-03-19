import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCheckoutStore = defineStore('checkout', () => {
  const step = ref(1) // 1: datos, 2: envío, 3: pago
  const shippingAddress = ref(null)
  const paymentResult = ref(null)

  function setStep(n) {
    step.value = n
  }

  function setShippingAddress(address) {
    shippingAddress.value = address
  }

  function setPaymentResult(result) {
    paymentResult.value = result
  }

  function reset() {
    step.value = 1
    shippingAddress.value = null
    paymentResult.value = null
  }

  return { step, shippingAddress, paymentResult, setStep, setShippingAddress, setPaymentResult, reset }
})
