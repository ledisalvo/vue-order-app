<template>
  <div class="step-review">
    <h2 class="step-title">Revisión final</h2>

    <!-- Items -->
    <section class="review-section">
      <h3 class="section-title">
        Productos
        <button class="btn-edit" @click="emit('go', 1)">Editar</button>
      </h3>
      <div v-for="item in cartStore.items" :key="item.productId" class="review-item">
        <span class="item-qty-badge">{{ item.quantity }}×</span>
        <span class="item-name">{{ item.name }}</span>
        <span class="item-total">{{ formatPrice(item.unitPrice * item.quantity) }}</span>
      </div>
    </section>

    <!-- Envío -->
    <section class="review-section">
      <h3 class="section-title">
        Envío
        <button class="btn-edit" @click="emit('go', 2)">Editar</button>
      </h3>
      <p class="review-detail">{{ checkoutStore.shippingAddress?.street }}, {{ checkoutStore.shippingAddress?.city }}</p>
      <p class="review-detail">
        {{ checkoutStore.shippingOption?.name }}
        <span v-if="checkoutStore.shippingOption?.price > 0"> — {{ formatPrice(checkoutStore.shippingOption.price) }}</span>
        <span v-else class="free-badge">Gratis</span>
      </p>
    </section>

    <!-- Facturación -->
    <section class="review-section">
      <h3 class="section-title">
        Facturación
        <button class="btn-edit" @click="emit('go', 3)">Editar</button>
      </h3>
      <p v-if="checkoutStore.needsInvoice" class="review-detail">
        Factura — CUIT: {{ checkoutStore.invoiceData.cuit }} / {{ checkoutStore.invoiceData.razonSocial }}
      </p>
      <p v-else class="review-detail">Ticket consumidor final</p>
    </section>

    <!-- Notas -->
    <section v-if="checkoutStore.notes" class="review-section">
      <h3 class="section-title">
        Notas
        <button class="btn-edit" @click="emit('go', 4)">Editar</button>
      </h3>
      <p class="review-detail">{{ checkoutStore.notes }}</p>
    </section>

    <!-- Totales -->
    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>{{ formatPrice(cartStore.subtotal) }}</span>
      </div>
      <div v-for="promo in cartStore.promotions" :key="promo.name" class="total-row promo">
        <span>{{ promo.name }}</span>
        <span>-{{ formatPrice(promo.discount) }}</span>
      </div>
      <div class="total-row shipping">
        <span>Envío ({{ checkoutStore.shippingOption?.name }})</span>
        <span>{{ checkoutStore.shippingOption?.price === 0 ? 'Gratis' : formatPrice(checkoutStore.shippingOption?.price ?? 0) }}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total</span>
        <span>{{ formatPrice(grandTotal) }}</span>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="submit-error">{{ error }}</div>

    <div class="step-actions">
      <button class="btn-secondary" :disabled="submitting" @click="emit('back')">Volver</button>
      <button class="btn-pay" :disabled="submitting" @click="handlePay">
        <span v-if="submitting" class="spinner"></span>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        {{ submitting ? 'Procesando...' : 'Ir a pagar' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { useAuthStore } from '@/stores/authStore'
import { checkoutService } from '@/services/api'

const emit = defineEmits(['back', 'go', 'paid'])
const cartStore     = useCartStore()
const checkoutStore = useCheckoutStore()
const authStore     = useAuthStore()

const submitting = ref(false)
const error      = ref(null)

const grandTotal = computed(() =>
  cartStore.total + (checkoutStore.shippingOption?.price ?? 0)
)

async function handlePay() {
  submitting.value = true
  error.value      = null
  try {
    const result = await checkoutService.createOrder({
      buyerEmail:      authStore.user?.email,
      items:           cartStore.items,
      shippingAddress: checkoutStore.shippingAddress,
      shippingOption:  checkoutStore.shippingOption,
      needsInvoice:    checkoutStore.needsInvoice,
      invoiceData:     checkoutStore.invoiceData,
      notes:           checkoutStore.notes,
    })
    checkoutStore.setOrderResult(result.orderId, result.initPoint)
    emit('paid', result.initPoint)
  } catch (err) {
    error.value = err.message || 'Error al crear el pedido. Intentá de nuevo.'
  } finally {
    submitting.value = false
  }
}

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.step-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin-bottom: 1.5rem; }

.review-section { margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid #f3f4f6; }
.section-title { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin-bottom: .6rem; display: flex; align-items: center; gap: .75rem; }
.btn-edit { background: none; border: none; font-size: .75rem; color: #2563eb; cursor: pointer; padding: 0; font-weight: 500; text-transform: none; letter-spacing: 0; }
.btn-edit:hover { text-decoration: underline; }

.review-item { display: flex; align-items: center; gap: .6rem; font-size: .875rem; color: #374151; margin-bottom: .35rem; }
.item-qty-badge { background: #f3f4f6; color: #6b7280; padding: .1rem .4rem; border-radius: .25rem; font-size: .75rem; font-weight: 600; }
.item-name { flex: 1; }
.item-total { font-weight: 600; color: #111827; }

.review-detail { font-size: .875rem; color: #374151; margin-bottom: .3rem; }

.free-badge { color: #166534; font-weight: 600; }

.totals { background: #f9fafb; border-radius: .6rem; padding: 1rem; margin-top: .5rem; display: flex; flex-direction: column; gap: .6rem; }
.total-row { display: flex; justify-content: space-between; font-size: .875rem; color: #374151; }
.total-row.promo { color: #166534; font-size: .82rem; }
.total-row.shipping { color: #374151; }
.total-row.grand-total { font-size: 1.05rem; font-weight: 700; color: #111827; padding-top: .6rem; border-top: 1px solid #e5e7eb; margin-top: .25rem; }

.submit-error { padding: .75rem 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: .5rem; font-size: .85rem; color: #991b1b; margin-top: 1rem; }

.step-actions { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.75rem; }
.btn-pay {
  display: flex; align-items: center; gap: .5rem;
  padding: .75rem 2rem; background: #2563eb; color: #fff;
  border: none; border-radius: .6rem; font-weight: 700; font-size: .95rem;
  cursor: pointer; transition: background .15s;
}
.btn-pay:hover:not(:disabled) { background: #1d4ed8; }
.btn-pay:disabled { background: #93c5fd; cursor: not-allowed; }
.btn-pay svg { width: 18px; height: 18px; }
.spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.btn-secondary { padding: .7rem 1.25rem; background: #fff; color: #374151; border: 1px solid #e5e7eb; border-radius: .6rem; font-weight: 600; font-size: .9rem; cursor: pointer; }
.btn-secondary:hover:not(:disabled) { border-color: #374151; }
.btn-secondary:disabled { opacity: .5; cursor: not-allowed; }
</style>
