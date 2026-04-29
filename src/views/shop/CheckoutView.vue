<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <CheckoutStepper :steps="STEPS" :current="checkoutStore.step" @go="handleGo" />

      <div class="checkout-body">
        <StepCart
          v-if="checkoutStore.step === 1"
          @next="handleNext"
        />
        <StepShipping
          v-else-if="checkoutStore.step === 2"
          @next="handleShippingNext"
          @back="checkoutStore.back()"
        />
        <StepBilling
          v-else-if="checkoutStore.step === 3"
          @next="handleBillingNext"
          @back="checkoutStore.back()"
        />
        <StepNotes
          v-else-if="checkoutStore.step === 4"
          @next="handleNotesNext"
          @back="checkoutStore.back()"
        />
        <StepReview
          v-else-if="checkoutStore.step === 5"
          @back="checkoutStore.back()"
          @go="handleGo"
          @paid="handlePaid"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useCheckoutStore, STEPS } from '@/stores/checkoutStore'

import CheckoutStepper from '@/components/checkout/CheckoutStepper.vue'
import StepCart        from '@/components/checkout/StepCart.vue'
import StepShipping    from '@/components/checkout/StepShipping.vue'
import StepBilling     from '@/components/checkout/StepBilling.vue'
import StepNotes       from '@/components/checkout/StepNotes.vue'
import StepReview      from '@/components/checkout/StepReview.vue'

const router        = useRouter()
const route         = useRoute()
const cartStore     = useCartStore()
const checkoutStore = useCheckoutStore()

onMounted(() => {
  // Restaurar estado si viene de una sesión interrumpida
  checkoutStore.restoreFromSession()

  // Redirigir si el carrito está vacío
  if (!cartStore.items.length) {
    router.replace('/cart')
  }
})

function handleNext() {
  checkoutStore.next()
}

function handleShippingNext({ address, option }) {
  checkoutStore.setShipping(address, option)
  checkoutStore.next()
}

function handleBillingNext({ needs, data }) {
  checkoutStore.setBilling(needs, data)
  checkoutStore.next()
}

function handleNotesNext(text) {
  checkoutStore.setNotes(text)
  checkoutStore.next()
}

function handleGo(step) {
  checkoutStore.goTo(step)
}

function handlePaid(initPoint) {
  cartStore.clearCart()
  window.location.href = initPoint
}
</script>

<style scoped>
.checkout-page {
  min-height: calc(100vh - 64px);
  background: #f9fafb;
  padding: 2rem 1rem;
}

.checkout-container {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.checkout-body {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: .75rem;
  padding: 1.75rem;
}

@media (max-width: 600px) {
  .checkout-page { padding: 1rem .75rem; }
  .checkout-body { padding: 1.25rem; }
}
</style>
