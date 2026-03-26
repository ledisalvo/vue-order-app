<template>
  <div class="admin-page">
    <div class="admin-container">

      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-sub">{{ today }}</p>
        </div>
        <button class="btn-refresh" @click="load" :disabled="loading" title="Actualizar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
            <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
          </svg>
        </button>
      </div>

      <!-- Métricas principales -->
      <div class="metrics-grid">
        <div v-for="metric in metrics" :key="metric.key" class="metric-card" :class="metric.alert ? 'alert' : ''">
          <div class="metric-icon" :class="metric.iconClass">
            <component :is="metric.icon" />
          </div>
          <div class="metric-body">
            <p class="metric-label">{{ metric.label }}</p>
            <p v-if="loading" class="metric-value"><span class="sk-block sk-value"></span></p>
            <p v-else class="metric-value">{{ metric.value }}</p>
            <p v-if="metric.sub" class="metric-sub">{{ metric.sub }}</p>
          </div>
        </div>
      </div>

      <!-- Alertas -->
      <div v-if="!loading && (stats.lowStockCount > 0 || stats.outOfStockCount > 0)" class="alerts-row">
        <RouterLink v-if="stats.outOfStockCount > 0" to="/admin/productos" class="alert-chip danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ stats.outOfStockCount }} producto{{ stats.outOfStockCount !== 1 ? 's' : '' }} agotado{{ stats.outOfStockCount !== 1 ? 's' : '' }}
        </RouterLink>
        <RouterLink v-if="stats.lowStockCount > 0" to="/admin/productos" class="alert-chip warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          {{ stats.lowStockCount }} con stock bajo
        </RouterLink>
        <RouterLink v-if="stats.pendingOrders > 0" to="/admin/pedidos" class="alert-chip info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
          {{ stats.pendingOrders }} pedido{{ stats.pendingOrders !== 1 ? 's' : '' }} sin atender
        </RouterLink>
      </div>

      <div class="bottom-grid">

        <!-- Últimos pedidos -->
        <section class="card">
          <div class="card-header">
            <h2 class="card-title">Últimos pedidos</h2>
            <RouterLink to="/admin/pedidos" class="card-link">Ver todos →</RouterLink>
          </div>

          <template v-if="loading">
            <div v-for="i in 5" :key="i" class="order-row">
              <div class="sk-lines">
                <div class="sk-block sk-line wide"></div>
                <div class="sk-block sk-line narrow"></div>
              </div>
              <div class="sk-block sk-badge"></div>
            </div>
          </template>

          <div v-else-if="!stats.recentOrders.length" class="empty-state">
            Sin pedidos recientes.
          </div>

          <RouterLink
            v-else
            v-for="order in stats.recentOrders"
            :key="order.id"
            :to="`/admin/pedidos/${order.id}`"
            class="order-row"
          >
            <div class="order-info">
              <p class="order-number">#{{ order.number }} — {{ order.customer }}</p>
              <p class="order-date">{{ formatDate(order.date) }}</p>
            </div>
            <div class="order-right">
              <span class="status-pill" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
              <span class="order-total">{{ formatPrice(order.total) }}</span>
            </div>
          </RouterLink>
        </section>

        <!-- Acceso rápido -->
        <section class="card">
          <h2 class="card-title" style="margin-bottom:1rem">Acceso rápido</h2>
          <div class="quick-links">
            <RouterLink to="/admin/productos/nuevo" class="quick-link">
              <div class="ql-icon blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <div>
                <p class="ql-title">Nuevo producto</p>
                <p class="ql-sub">Agregar al catálogo</p>
              </div>
            </RouterLink>
            <RouterLink to="/admin/productos" class="quick-link">
              <div class="ql-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m8 21 4-4 4 4M12 17v4"/></svg>
              </div>
              <div>
                <p class="ql-title">Gestión de productos</p>
                <p class="ql-sub">CRUD, variantes, stock</p>
              </div>
            </RouterLink>
            <RouterLink to="/admin/pedidos" class="quick-link">
              <div class="ql-icon green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <p class="ql-title">Pedidos</p>
                <p class="ql-sub">Gestionar y cambiar estado</p>
              </div>
            </RouterLink>
            <RouterLink to="/admin/configuracion" class="quick-link">
              <div class="ql-icon orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div>
                <p class="ql-title">Configuración</p>
                <p class="ql-sub">Categorías, envío, promociones</p>
              </div>
            </RouterLink>
            <RouterLink to="/" target="_blank" class="quick-link">
              <div class="ql-icon gray">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </div>
              <div>
                <p class="ql-title">Ver tienda</p>
                <p class="ql-sub">Abrir catálogo público</p>
              </div>
            </RouterLink>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { adminDashboardService } from '@/services/api'

const USE_MOCK = true

const loading = ref(true)
const stats   = ref({
  ordersToday: 0, revenueToday: 0,
  pendingOrders: 0, lowStockCount: 0, outOfStockCount: 0,
  recentOrders: [],
})

const MOCK_STATS = {
  ordersToday:    4,
  revenueToday:   76500,
  pendingOrders:  2,
  lowStockCount:  3,
  outOfStockCount: 1,
  recentOrders: [
    { id: 'o4', number: '2025-004', customer: 'Ana Martínez',  date: '2025-03-19T16:45:00Z', status: 'pending_payment', total: 12500 },
    { id: 'o3', number: '2025-003', customer: 'Carlos López',  date: '2025-03-10T09:15:00Z', status: 'confirmed',       total: 8750  },
    { id: 'o2', number: '2025-002', customer: 'María García',  date: '2025-02-03T14:30:00Z', status: 'shipped',         total: 18900 },
    { id: 'o1', number: '2025-001', customer: 'Juan Pérez',    date: '2025-01-15T10:00:00Z', status: 'delivered',       total: 35400 },
    { id: 'o5', number: '2025-005', customer: 'Pedro Sánchez', date: '2025-03-18T11:00:00Z', status: 'cancelled',       total: 6800  },
  ],
}

async function load() {
  loading.value = true
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      stats.value = MOCK_STATS
    } else {
      stats.value = await adminDashboardService.getSummary()
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)

// Tarjetas de métricas
const metrics = computed(() => [
  {
    key: 'orders',
    label: 'Pedidos hoy',
    value: stats.value.ordersToday,
    iconClass: 'icon-blue',
    icon: IconOrders,
  },
  {
    key: 'revenue',
    label: 'Facturado hoy',
    value: formatPrice(stats.value.revenueToday),
    iconClass: 'icon-green',
    icon: IconRevenue,
  },
  {
    key: 'pending',
    label: 'Pedidos sin atender',
    value: stats.value.pendingOrders,
    sub: stats.value.pendingOrders > 0 ? 'Requieren acción' : 'Todo al día',
    alert: stats.value.pendingOrders > 0,
    iconClass: stats.value.pendingOrders > 0 ? 'icon-orange' : 'icon-gray',
    icon: IconPending,
  },
  {
    key: 'stock',
    label: 'Productos sin stock',
    value: stats.value.outOfStockCount,
    sub: stats.value.lowStockCount > 0 ? `+ ${stats.value.lowStockCount} con stock bajo` : null,
    alert: stats.value.outOfStockCount > 0,
    iconClass: stats.value.outOfStockCount > 0 ? 'icon-red' : 'icon-gray',
    icon: IconStock,
  },
])

// Inline icon components
const IconOrders = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2' }), h('rect', { x: '9', y: '3', width: '6', height: '4', rx: '1' })]) }
const IconRevenue = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('line', { x1: '12', y1: '1', x2: '12', y2: '23' }), h('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })]) }
const IconPending = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('circle', { cx: '12', cy: '12', r: '10' }), h('polyline', { points: '12 6 12 12 16 14' })]) }
const IconStock   = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [h('path', { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' })]) }

const STATUS_MAP = {
  pending_payment: { label: 'Pago pendiente', cls: 'st-pending'   },
  confirmed:       { label: 'Confirmado',      cls: 'st-confirmed' },
  shipped:         { label: 'Enviado',          cls: 'st-shipped'  },
  delivered:       { label: 'Entregado',        cls: 'st-delivered'},
  cancelled:       { label: 'Cancelado',        cls: 'st-cancelled'},
}
function statusLabel(s) { return STATUS_MAP[s]?.label ?? s }
function statusClass(s)  { return STATUS_MAP[s]?.cls  ?? '' }

const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.admin-page { min-height: calc(100vh - 64px); background: #f9fafb; padding: 2rem 1rem; }
.admin-container { max-width: 1100px; margin: 0 auto; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.75rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #111827; }
.page-sub { font-size: .82rem; color: #6b7280; margin-top: .2rem; text-transform: capitalize; }
.btn-refresh { background: none; border: 1.5px solid #e5e7eb; border-radius: .5rem; padding: .5rem; cursor: pointer; color: #6b7280; display: flex; align-items: center; transition: border-color .15s; }
.btn-refresh:hover { border-color: #374151; color: #111827; }
.btn-refresh:disabled { opacity: .5; cursor: not-allowed; }
.btn-refresh svg { width: 18px; height: 18px; }
.btn-refresh svg.spinning { animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Metric cards */
.metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1rem; }
.metric-card { background: #fff; border: 1.5px solid #e5e7eb; border-radius: .875rem; padding: 1.25rem; display: flex; align-items: flex-start; gap: .875rem; transition: border-color .15s; }
.metric-card.alert { border-color: #fca5a5; background: #fff7f7; }
.metric-icon { width: 42px; height: 42px; border-radius: .6rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.metric-icon svg { width: 20px; height: 20px; }
.icon-blue   { background: #dbeafe; color: #1d4ed8; }
.icon-green  { background: #dcfce7; color: #15803d; }
.icon-orange { background: #ffedd5; color: #c2410c; }
.icon-red    { background: #fee2e2; color: #b91c1c; }
.icon-gray   { background: #f3f4f6; color: #6b7280; }
.metric-body { flex: 1; min-width: 0; }
.metric-label { font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; margin-bottom: .35rem; }
.metric-value { font-size: 1.5rem; font-weight: 800; color: #111827; line-height: 1; }
.metric-sub { font-size: .72rem; color: #9ca3af; margin-top: .3rem; }

/* Skeleton value */
.sk-block { background: #f3f4f6; border-radius: .375rem; animation: pulse 1.5s ease-in-out infinite; }
.sk-value { display: inline-block; height: 28px; width: 80px; }
.sk-line  { height: 13px; }
.sk-line.wide   { width: 60%; }
.sk-line.narrow { width: 35%; }
.sk-badge { width: 80px; height: 20px; border-radius: .375rem; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: .4rem; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }

/* Alerts */
.alerts-row { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1.25rem; }
.alert-chip { display: inline-flex; align-items: center; gap: .4rem; padding: .45rem .875rem; border-radius: 2rem; font-size: .78rem; font-weight: 700; text-decoration: none; cursor: pointer; transition: opacity .15s; }
.alert-chip:hover { opacity: .85; }
.alert-chip svg { width: 14px; height: 14px; }
.alert-chip.danger  { background: #fee2e2; color: #991b1b; }
.alert-chip.warning { background: #fef3c7; color: #92400e; }
.alert-chip.info    { background: #dbeafe; color: #1e40af; }

/* Bottom grid */
.bottom-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1rem; }

/* Card */
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: .875rem; padding: 1.25rem 1.5rem; }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: .875rem; }
.card-title { font-size: .9rem; font-weight: 700; color: #111827; }
.card-link { font-size: .78rem; color: #2563eb; text-decoration: none; }
.card-link:hover { text-decoration: underline; }

/* Recent orders */
.order-row { display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .7rem 0; border-bottom: 1px solid #f3f4f6; text-decoration: none; color: inherit; }
.order-row:last-child { border-bottom: none; }
.order-row:hover .order-number { color: #2563eb; }
.order-info { flex: 1; min-width: 0; }
.order-number { font-size: .82rem; font-weight: 600; color: #111827; transition: color .15s; }
.order-date { font-size: .72rem; color: #9ca3af; margin-top: .1rem; }
.order-right { display: flex; align-items: center; gap: .625rem; flex-shrink: 0; }
.order-total { font-size: .82rem; font-weight: 700; color: #111827; white-space: nowrap; }

.empty-state { font-size: .875rem; color: #9ca3af; padding: 1rem 0; text-align: center; }

/* Status pills */
.status-pill { font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: .18rem .5rem; border-radius: .3rem; white-space: nowrap; }
.st-pending   { background: #fef3c7; color: #92400e; }
.st-confirmed { background: #dbeafe; color: #1e40af; }
.st-shipped   { background: #e0f2fe; color: #0369a1; }
.st-delivered { background: #dcfce7; color: #166534; }
.st-cancelled { background: #f3f4f6; color: #6b7280; }

/* Quick links */
.quick-links { display: flex; flex-direction: column; gap: .5rem; }
.quick-link { display: flex; align-items: center; gap: .875rem; padding: .75rem; border: 1px solid #f3f4f6; border-radius: .6rem; text-decoration: none; color: inherit; transition: border-color .15s, background .15s; }
.quick-link:hover { border-color: #d1d5db; background: #f9fafb; }
.ql-icon { width: 36px; height: 36px; border-radius: .5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.ql-icon svg { width: 16px; height: 16px; }
.ql-icon.blue   { background: #dbeafe; color: #1d4ed8; }
.ql-icon.purple { background: #ede9fe; color: #6d28d9; }
.ql-icon.green  { background: #dcfce7; color: #15803d; }
.ql-icon.orange { background: #ffedd5; color: #c2410c; }
.ql-icon.gray   { background: #f3f4f6; color: #6b7280; }
.ql-title { font-size: .82rem; font-weight: 600; color: #111827; }
.ql-sub { font-size: .72rem; color: #9ca3af; margin-top: .1rem; }

@media (max-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .bottom-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .admin-page { padding: 1.25rem .75rem; }
  .metrics-grid { grid-template-columns: 1fr 1fr; gap: .625rem; }
  .metric-card { padding: 1rem; }
  .metric-value { font-size: 1.25rem; }
}
</style>
