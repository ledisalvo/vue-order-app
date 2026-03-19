import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const STEPS = [
  { n: 1, label: 'Carrito' },
  { n: 2, label: 'Envío' },
  { n: 3, label: 'Facturación' },
  { n: 4, label: 'Notas' },
  { n: 5, label: 'Revisión' },
]

export const useCheckoutStore = defineStore('checkout', () => {
  const step = ref(1)

  // Paso 2 — Envío
  const shippingAddress  = ref(null)  // { id?, name, street, city, province, zip, phone }
  const shippingOption   = ref(null)  // { id, name, price, estimatedDays }

  // Paso 3 — Facturación
  const needsInvoice = ref(false)
  const invoiceData  = ref({ cuit: '', razonSocial: '' })

  // Paso 4 — Notas
  const notes = ref('')

  // Paso 5 — Resultado
  const createdOrderId   = ref(null)
  const paymentInitPoint = ref(null) // URL de MercadoPago

  const isLastStep = computed(() => step.value === STEPS.length)

  function goTo(n) {
    if (n >= 1 && n <= STEPS.length) step.value = n
  }
  function next() { goTo(step.value + 1) }
  function back() { goTo(step.value - 1) }

  function setShipping(address, option) {
    shippingAddress.value = address
    shippingOption.value  = option
  }

  function setBilling(needs, data = {}) {
    needsInvoice.value = needs
    invoiceData.value  = { cuit: data.cuit ?? '', razonSocial: data.razonSocial ?? '' }
  }

  function setNotes(text) {
    notes.value = text
  }

  function setOrderResult(orderId, initPoint) {
    createdOrderId.value   = orderId
    paymentInitPoint.value = initPoint
  }

  function reset() {
    step.value           = 1
    shippingAddress.value  = null
    shippingOption.value   = null
    needsInvoice.value   = false
    invoiceData.value    = { cuit: '', razonSocial: '' }
    notes.value          = ''
    createdOrderId.value   = null
    paymentInitPoint.value = null
  }

  // Persistir en sessionStorage para restaurar si la sesión expira
  function saveToSession() {
    sessionStorage.setItem('checkout_state', JSON.stringify({
      step: step.value,
      shippingAddress: shippingAddress.value,
      shippingOption: shippingOption.value,
      needsInvoice: needsInvoice.value,
      invoiceData: invoiceData.value,
      notes: notes.value,
    }))
  }

  function restoreFromSession() {
    const raw = sessionStorage.getItem('checkout_state')
    if (!raw) return false
    try {
      const s = JSON.parse(raw)
      step.value            = s.step ?? 1
      shippingAddress.value = s.shippingAddress ?? null
      shippingOption.value  = s.shippingOption ?? null
      needsInvoice.value    = s.needsInvoice ?? false
      invoiceData.value     = s.invoiceData ?? { cuit: '', razonSocial: '' }
      notes.value           = s.notes ?? ''
      sessionStorage.removeItem('checkout_state')
      return true
    } catch {
      return false
    }
  }

  return {
    step, shippingAddress, shippingOption,
    needsInvoice, invoiceData, notes,
    createdOrderId, paymentInitPoint,
    isLastStep, STEPS,
    goTo, next, back,
    setShipping, setBilling, setNotes, setOrderResult,
    reset, saveToSession, restoreFromSession,
  }
})
