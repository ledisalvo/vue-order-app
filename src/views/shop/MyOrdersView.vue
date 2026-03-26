<template>
  <div class="orders-page">
    <div class="orders-container">
      <h1 class="page-title">Mis pedidos</h1>

      <!-- Skeleton -->
      <template v-if="loading">
        <div v-for="i in 3" :key="i" class="order-card skeleton">
          <div class="sk-block sk-thumb"></div>
          <div class="sk-lines">
            <div class="sk-block sk-line wide"></div>
            <div class="sk-block sk-line narrow"></div>
          </div>
          <div class="sk-block sk-badge"></div>
        </div>
      </template>

      <!-- Error -->
      <div v-else-if="error" class="state-error">
        <p>{{ error }}</p>
        <button class="btn-retry" @click="load">Reintentar</button>
      </div>

      <!-- Empty -->
      <div v-else-if="!orders.length" class="state-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
        </svg>
        <p>Todavía no tenés pedidos.</p>
        <RouterLink to="/catalogo" class="btn-primary">Ver productos</RouterLink>
      </div>

      <!-- List -->
      <template v-else>
        <RouterLink
          v-for="order in orders"
          :key="order.id"
          :to="`/mi-cuenta/pedidos/${order.id}`"
          class="order-card"
        >
          <!-- Thumbnail del primer producto -->
          <div class="order-thumb">
            <img v-if="order.items[0]?.image" :src="order.items[0].image" :alt="order.items[0].name" />
            <div v-else class="thumb-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
            </div>
          </div>

          <div class="order-info">
            <p class="order-number">Pedido #{{ order.number }}</p>
            <p class="order-date">{{ formatDate(order.date) }}</p>
            <p class="order-items-count">{{ order.items.length }} {{ order.items.length === 1 ? 'producto' : 'productos' }}</p>
          </div>

          <div class="order-right">
            <span class="status-badge" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
            <p class="order-total">{{ formatPrice(order.total) }}</p>
          </div>

          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { myOrdersService } from '@/services/api'
import { useDemoOrdersStore } from '@/stores/demoOrdersStore'
import { isDemoMode } from '@/config'

const USE_MOCK = isDemoMode
const demoOrdersStore = isDemoMode ? useDemoOrdersStore() : null

const loading = ref(true)
const error   = ref(null)
const orders  = ref([])

const MOCK_ORDERS = [
  {
    id: 'ord-001',
    number: '2024-001',
    date: '2024-11-10T14:30:00Z',
    status: 'delivered',
    total: 35400,
    items: [
      { productId: 'p1', name: 'Remera Oversize', image: null, quantity: 2, unitPrice: 12500, variant: { Talle: 'M', Color: 'Negro' } },
      { productId: 'p2', name: 'Jogger Deportivo', image: null, quantity: 1, unitPrice: 10400, variant: { Talle: 'L' } },
    ],
  },
  {
    id: 'ord-002',
    number: '2024-002',
    date: '2024-12-05T09:15:00Z',
    status: 'shipped',
    total: 18900,
    items: [
      { productId: 'p3', name: 'Buzo Canguro', image: null, quantity: 1, unitPrice: 18900, variant: { Talle: 'XL', Color: 'Gris' } },
    ],
  },
  {
    id: 'ord-003',
    number: '2025-001',
    date: '2025-01-20T17:45:00Z',
    status: 'confirmed',
    total: 8750,
    items: [
      { productId: 'p4', name: 'Calza Deportiva', image: null, quantity: 1, unitPrice: 8750, variant: { Talle: 'S' } },
    ],
  },
]

async function load() {
  loading.value = true
  error.value   = null
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      // Pedidos reales del demo (más recientes primero) + mock estáticos de ejemplo
      const demoOrders = [...demoOrdersStore.orders].reverse()
      orders.value = [...demoOrders, ...MOCK_ORDERS]
    } else {
      orders.value = await myOrdersService.getOrders()
    }
  } catch (err) {
    error.value = 'No pudimos cargar tus pedidos. Intentá de nuevo.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

const STATUS_MAP = {
  pending_payment: { label: 'Pendiente de pago', cls: 'status-pending'  },
  confirmed:       { label: 'Confirmado',         cls: 'status-confirmed' },
  shipped:         { label: 'Enviado',             cls: 'status-shipped'  },
  delivered:       { label: 'Entregado',           cls: 'status-delivered' },
  cancelled:       { label: 'Cancelado',           cls: 'status-cancelled' },
}
function statusLabel(s) { return STATUS_MAP[s]?.label ?? s }
function statusClass(s)  { return STATUS_MAP[s]?.cls  ?? '' }

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.orders-page { min-height: calc(100vh - 64px); background: #f9fafb; padding: 2rem 1rem; }
.orders-container { max-width: 680px; margin: 0 auto; }
.page-title { font-size: 1.35rem; font-weight: 700; color: #111827; margin-bottom: 1.5rem; }

/* Order card */
.order-card {
  display: flex; align-items: center; gap: 1rem;
  background: #fff; border: 1px solid #e5e7eb; border-radius: .75rem;
  padding: 1rem 1.25rem; margin-bottom: .75rem;
  text-decoration: none; color: inherit;
  transition: border-color .15s, box-shadow .15s;
}
.order-card:hover { border-color: #9ca3af; box-shadow: 0 2px 8px rgba(0,0,0,.06); }

.order-thumb {
  width: 56px; height: 56px; border-radius: .5rem;
  overflow: hidden; background: #f3f4f6; flex-shrink: 0;
}
.order-thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #d1d5db; }
.thumb-placeholder svg { width: 22px; height: 22px; }

.order-info { flex: 1; min-width: 0; }
.order-number { font-size: .875rem; font-weight: 700; color: #111827; }
.order-date { font-size: .78rem; color: #6b7280; margin-top: .1rem; }
.order-items-count { font-size: .75rem; color: #9ca3af; margin-top: .1rem; }

.order-right { display: flex; flex-direction: column; align-items: flex-end; gap: .35rem; flex-shrink: 0; }
.order-total { font-size: .9rem; font-weight: 700; color: #111827; }

.chevron { width: 16px; height: 16px; color: #9ca3af; flex-shrink: 0; }

/* Status badges */
.status-badge { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: .2rem .55rem; border-radius: .375rem; white-space: nowrap; }
.status-pending   { background: #fef3c7; color: #92400e; }
.status-confirmed { background: #dbeafe; color: #1e40af; }
.status-shipped   { background: #e0f2fe; color: #0369a1; }
.status-delivered { background: #dcfce7; color: #166534; }
.status-cancelled { background: #fee2e2; color: #991b1b; }

/* Skeleton */
.skeleton { pointer-events: none; }
.sk-block { background: #f3f4f6; border-radius: .375rem; animation: pulse 1.5s ease-in-out infinite; }
.sk-thumb { width: 56px; height: 56px; border-radius: .5rem; flex-shrink: 0; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: .5rem; }
.sk-line { height: 12px; }
.sk-line.wide { width: 60%; }
.sk-line.narrow { width: 35%; }
.sk-badge { width: 80px; height: 22px; border-radius: .375rem; flex-shrink: 0; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }

/* Empty / Error */
.state-empty, .state-error {
  text-align: center; padding: 3rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.state-empty svg { width: 48px; height: 48px; color: #d1d5db; }
.state-empty p, .state-error p { font-size: .95rem; color: #6b7280; }
.btn-primary { padding: .65rem 1.75rem; background: #111827; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .9rem; text-decoration: none; cursor: pointer; }
.btn-primary:hover { background: #2563eb; }
.btn-retry { padding: .6rem 1.5rem; background: #fff; border: 1px solid #e5e7eb; border-radius: .6rem; font-size: .875rem; font-weight: 600; cursor: pointer; color: #374151; }
.btn-retry:hover { border-color: #374151; }

@media (max-width: 600px) {
  .orders-page { padding: 1.25rem .75rem; }
  .order-card { padding: .875rem 1rem; gap: .75rem; }
}
</style>
