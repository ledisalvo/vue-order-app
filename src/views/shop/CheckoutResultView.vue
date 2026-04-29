<template>
  <div class="result-page">
    <div class="result-container">

      <!-- Loading -->
      <div v-if="loading" class="state-loading">
        <span class="spinner"></span>
        <p>Cargando tu pedido...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state-error">
        <p>{{ error }}</p>
        <RouterLink :to="homeLink" class="btn-primary">Volver al inicio</RouterLink>
      </div>

      <!-- Pago rechazado / pendiente -->
      <template v-else-if="paymentStatus && paymentStatus !== 'approved'">
        <div class="failed-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h1 class="result-title">{{ paymentStatus === 'pending' ? 'Pago pendiente' : 'Pago rechazado' }}</h1>
        <p class="result-subtitle">
          {{ paymentStatus === 'pending'
            ? 'Tu pago está siendo procesado. Te avisaremos cuando se confirme.'
            : 'Hubo un problema con el pago. Podés intentarlo de nuevo.' }}
        </p>
        <div class="result-actions">
          <RouterLink :to="homeLink" class="btn-primary">Volver a la tienda</RouterLink>
        </div>
      </template>

      <!-- Éxito -->
      <template v-else-if="order">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>

        <h1 class="result-title">¡Pedido confirmado!</h1>
        <p class="result-subtitle">
          Tu pedido <strong>#{{ order.number }}</strong> fue registrado correctamente.
          Te avisaremos cuando esté listo para enviar.
        </p>

        <section class="result-section">
          <h2 class="section-title">Productos</h2>
          <div v-for="item in order.items" :key="item.productId" class="order-item">
            <span class="item-qty">{{ item.quantity }}×</span>
            <span class="item-name">{{ item.name }}</span>
            <span class="item-price">{{ formatPrice(item.unitPrice * item.quantity) }}</span>
          </div>
        </section>

        <section class="result-section">
          <h2 class="section-title">Envío</h2>
          <p class="detail">{{ order.shippingAddress?.street }}, {{ order.shippingAddress?.city }}, {{ order.shippingAddress?.province }}</p>
          <p class="detail">
            {{ order.shippingOption?.name }}
            <span v-if="order.shippingOption?.price === 0" class="free-badge">· Gratis</span>
            <span v-else-if="order.shippingOption?.price"> · {{ formatPrice(order.shippingOption.price) }}</span>
          </p>
        </section>

        <div class="totals">
          <div class="total-row grand">
            <span>Total pagado</span>
            <span>{{ formatPrice(order.total) }}</span>
          </div>
        </div>

        <div class="result-actions">
          <RouterLink :to="myOrdersLink" class="btn-secondary">Ver mis pedidos</RouterLink>
          <RouterLink :to="homeLink" class="btn-primary">Seguir comprando</RouterLink>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderService } from '@/services/api'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { useTenantStore } from '@/stores/tenantStore'

const route         = useRoute()
const router        = useRouter()
const checkoutStore = useCheckoutStore()
const tenantStore   = useTenantStore()

const loading       = ref(true)
const error         = ref(null)
const order         = ref(null)
const paymentStatus = ref(null)

// MercadoPago redirige con: ?collection_status=approved&external_reference={orderId}
const orderId  = route.query.external_reference
const mpStatus = route.query.collection_status

const homeLink     = computed(() => tenantStore.slug ? `/${tenantStore.slug}` : '/')
const myOrdersLink = computed(() => tenantStore.slug ? `/${tenantStore.slug}/mis-pedidos` : '/mi-cuenta/pedidos')

onMounted(async () => {
  paymentStatus.value = mpStatus ?? null

  if (!orderId) {
    router.replace(homeLink.value)
    return
  }

  try {
    order.value = await orderService.getById(orderId)
    checkoutStore.reset()
  } catch {
    error.value = 'No pudimos encontrar tu pedido. Si el pago fue procesado, revisá tu email de confirmación.'
  } finally {
    loading.value = false
  }
})

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.result-page {
  min-height: calc(100vh - 64px);
  background: #f9fafb;
  padding: 2rem 1rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.result-container {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: .875rem;
  padding: 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.state-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  color: #6b7280;
  font-size: .9rem;
}
.state-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  text-align: center;
  color: #6b7280;
  font-size: .9rem;
}

.success-icon, .failed-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto .25rem;
}
.success-icon { background: #dcfce7; }
.success-icon svg { width: 28px; height: 28px; color: #16a34a; }
.failed-icon { background: #fee2e2; }
.failed-icon svg { width: 28px; height: 28px; color: #dc2626; }

.spinner {
  width: 32px; height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #374151;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.result-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #111827;
  text-align: center;
  margin: 0;
}

.result-subtitle {
  font-size: .9rem;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.result-section {
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
}
.section-title {
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #9ca3af;
  margin-bottom: .6rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .875rem;
  color: #374151;
  margin-bottom: .3rem;
}
.item-qty {
  background: #f3f4f6;
  color: #6b7280;
  padding: .1rem .4rem;
  border-radius: .25rem;
  font-size: .75rem;
  font-weight: 600;
  flex-shrink: 0;
}
.item-name { flex: 1; }
.item-price { font-weight: 600; color: #111827; }

.detail { font-size: .875rem; color: #374151; margin-bottom: .25rem; }
.free-badge { color: #16a34a; font-weight: 600; }

.totals {
  background: #f9fafb;
  border-radius: .6rem;
  padding: .875rem 1rem;
}
.total-row { display: flex; justify-content: space-between; font-size: .875rem; color: #374151; }
.total-row.grand { font-size: 1.05rem; font-weight: 700; color: #111827; }

.result-actions {
  display: flex;
  gap: .75rem;
  margin-top: .25rem;
}
.btn-primary, .btn-secondary {
  flex: 1;
  text-align: center;
  padding: .7rem 1rem;
  border-radius: .6rem;
  font-weight: 700;
  font-size: .9rem;
  text-decoration: none;
  transition: background .15s, border-color .15s;
}
.btn-primary {
  background: #111827;
  color: #fff;
  border: 1px solid #111827;
}
.btn-primary:hover { background: #2563eb; border-color: #2563eb; }
.btn-secondary {
  background: #fff;
  color: #374151;
  border: 1px solid #e5e7eb;
}
.btn-secondary:hover { border-color: #374151; }

@media (max-width: 600px) {
  .result-page { padding: 1rem .75rem; align-items: flex-start; }
  .result-container { padding: 1.5rem 1.25rem; }
  .result-actions { flex-direction: column; }
}
</style>
