<template>
  <div class="result-page">
    <div class="result-container">
      <!-- Ícono de éxito -->
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

      <!-- Resumen de productos -->
      <section class="result-section">
        <h2 class="section-title">Productos</h2>
        <div v-for="item in order.items" :key="item.productId" class="order-item">
          <span class="item-qty">{{ item.quantity }}×</span>
          <span class="item-name">{{ item.name }}</span>
          <span class="item-price">{{ formatPrice(item.unitPrice * item.quantity) }}</span>
        </div>
      </section>

      <!-- Envío -->
      <section class="result-section">
        <h2 class="section-title">Envío</h2>
        <p class="detail">{{ order.shippingAddress?.street }}, {{ order.shippingAddress?.city }}, {{ order.shippingAddress?.province }}</p>
        <p class="detail">
          {{ order.shippingOption?.name }}
          <span v-if="order.shippingOption?.price === 0" class="free-badge">· Gratis</span>
          <span v-else-if="order.shippingOption?.price"> · {{ formatPrice(order.shippingOption.price) }}</span>
        </p>
        <p v-if="order.shippingOption?.estimatedDays" class="detail muted">
          Tiempo estimado: {{ order.shippingOption.estimatedDays }} días hábiles
        </p>
      </section>

      <!-- Totales -->
      <div class="totals">
        <div class="total-row grand">
          <span>Total pagado</span>
          <span>{{ formatPrice(order.total) }}</span>
        </div>
      </div>

      <!-- Nota demo -->
      <p v-if="isDemoMode" class="demo-note">
        Modo demo — no se procesó ningún pago real.
      </p>

      <!-- Acciones -->
      <div class="result-actions">
        <RouterLink to="/mi-cuenta/pedidos" class="btn-secondary">Ver mis pedidos</RouterLink>
        <RouterLink to="/" class="btn-primary">Seguir comprando</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDemoOrdersStore } from '@/stores/demoOrdersStore'
import { useCheckoutStore } from '@/stores/checkoutStore'
import { isDemoMode } from '@/config'

const router        = useRouter()
const checkoutStore = useCheckoutStore()
const demoStore     = useDemoOrdersStore()

const order = demoStore.lastOrder

onMounted(() => {
  if (!order) {
    router.replace('/')
    return
  }
  checkoutStore.reset()
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

.success-icon {
  width: 56px;
  height: 56px;
  background: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto .25rem;
}
.success-icon svg { width: 28px; height: 28px; color: #16a34a; }

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
.detail.muted { color: #9ca3af; }
.free-badge { color: #16a34a; font-weight: 600; }

.totals {
  background: #f9fafb;
  border-radius: .6rem;
  padding: .875rem 1rem;
}
.total-row { display: flex; justify-content: space-between; font-size: .875rem; color: #374151; }
.total-row.grand { font-size: 1.05rem; font-weight: 700; color: #111827; }

.demo-note {
  font-size: .78rem;
  color: #9ca3af;
  text-align: center;
  border: 1px dashed #e5e7eb;
  border-radius: .5rem;
  padding: .5rem .75rem;
  margin: 0;
}

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
