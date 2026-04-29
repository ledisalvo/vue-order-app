<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Pedidos</h1>
          <p class="page-sub">{{ filtered.length }} pedido{{ filtered.length !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <input v-model="search" class="search-input" placeholder="Buscar por # o cliente…" />
        <select v-model="filterStatus" class="filter-select">
          <option value="">Todos los estados</option>
          <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
        <input v-model="filterDateFrom" type="date" class="filter-select" title="Desde" />
        <input v-model="filterDateTo"   type="date" class="filter-select" title="Hasta" />
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="table-wrap">
        <table class="orders-table">
          <thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Pago</th><th></th></tr></thead>
          <tbody>
            <tr v-for="i in 5" :key="i" class="sk-row">
              <td v-for="j in 7" :key="j"><div class="sk-block sk-cell"></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div v-else-if="!filtered.length" class="state-empty">
        <p>No hay pedidos que coincidan.</p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Pago</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in filtered" :key="o.id">
              <td class="td-number">#{{ o.number }}</td>
              <td class="td-date">{{ formatDate(o.date) }}</td>
              <td class="td-customer">{{ o.customer.name }}</td>
              <td class="td-total">{{ formatPrice(o.total) }}</td>
              <td>
                <span class="status-pill" :class="orderStatusClass(o.status)">{{ orderStatusLabel(o.status) }}</span>
              </td>
              <td>
                <span class="status-pill" :class="paymentStatusClass(o.paymentStatus)">{{ paymentStatusLabel(o.paymentStatus) }}</span>
              </td>
              <td>
                <RouterLink :to="`/admin/pedidos/${o.id}`" class="action-btn">Ver detalle</RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminOrderService } from '@/services/api'

const loading        = ref(true)
const orders         = ref([])
const search         = ref('')
const filterStatus   = ref('')
const filterDateFrom = ref('')
const filterDateTo   = ref('')

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Pendiente de pago' },
  { value: 'confirmed',       label: 'Confirmado' },
  { value: 'shipped',         label: 'Enviado' },
  { value: 'delivered',       label: 'Entregado' },
  { value: 'cancelled',       label: 'Cancelado' },
]

const filtered = computed(() => {
  let list = orders.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(o => o.number.includes(q) || o.customer.name.toLowerCase().includes(q))
  }
  if (filterStatus.value) list = list.filter(o => o.status === filterStatus.value)
  if (filterDateFrom.value) list = list.filter(o => o.date >= filterDateFrom.value)
  if (filterDateTo.value)   list = list.filter(o => o.date <= filterDateTo.value + 'T23:59:59Z')
  return list
})

async function load() {
  loading.value = true
  try {
    orders.value = await adminOrderService.getAll()
  } finally {
    loading.value = false
  }
}
onMounted(load)

const ORDER_STATUS = {
  pending_payment: { label: 'Pendiente pago', cls: 'st-pending'   },
  confirmed:       { label: 'Confirmado',      cls: 'st-confirmed' },
  shipped:         { label: 'Enviado',          cls: 'st-shipped'  },
  delivered:       { label: 'Entregado',        cls: 'st-delivered'},
  cancelled:       { label: 'Cancelado',        cls: 'st-cancelled'},
}
const PAYMENT_STATUS = {
  pending:  { label: 'Pendiente', cls: 'pay-pending'  },
  approved: { label: 'Aprobado',  cls: 'pay-approved' },
  rejected: { label: 'Rechazado', cls: 'pay-rejected' },
  refunded: { label: 'Reembolso', cls: 'pay-refunded' },
}
function orderStatusLabel(s)   { return ORDER_STATUS[s]?.label   ?? s }
function orderStatusClass(s)   { return ORDER_STATUS[s]?.cls     ?? '' }
function paymentStatusLabel(s) { return PAYMENT_STATUS[s]?.label ?? s }
function paymentStatusClass(s) { return PAYMENT_STATUS[s]?.cls   ?? '' }

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}
function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.admin-page { min-height: calc(100vh - 64px); background: #f9fafb; padding: 2rem 1rem; }
.admin-container { max-width: 1100px; margin: 0 auto; }
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.page-title { font-size: 1.35rem; font-weight: 700; color: #111827; }
.page-sub { font-size: .82rem; color: #6b7280; margin-top: .15rem; }

.toolbar { display: flex; gap: .75rem; margin-bottom: 1rem; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 180px; padding: .6rem .875rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; font-size: .875rem; color: #111827; }
.search-input:focus { outline: none; border-color: #2563eb; }
.filter-select { padding: .6rem .75rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; font-size: .875rem; color: #374151; background: #fff; }

.table-wrap { background: #fff; border: 1px solid #e5e7eb; border-radius: .75rem; overflow: auto; }
.orders-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
.orders-table thead tr { border-bottom: 1px solid #e5e7eb; }
.orders-table th { padding: .875rem 1rem; text-align: left; font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; white-space: nowrap; }
.orders-table tbody tr { border-bottom: 1px solid #f3f4f6; transition: background .1s; }
.orders-table tbody tr:last-child { border-bottom: none; }
.orders-table tbody tr:hover { background: #f9fafb; }
.orders-table td { padding: .875rem 1rem; vertical-align: middle; }

.td-number   { font-weight: 700; color: #111827; white-space: nowrap; }
.td-date     { color: #6b7280; white-space: nowrap; font-size: .82rem; }
.td-customer { color: #374151; }
.td-total    { font-weight: 600; color: #111827; white-space: nowrap; }

.status-pill { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: .2rem .55rem; border-radius: .375rem; white-space: nowrap; }
.st-pending   { background: #fef3c7; color: #92400e; }
.st-confirmed { background: #dbeafe; color: #1e40af; }
.st-shipped   { background: #e0f2fe; color: #0369a1; }
.st-delivered { background: #dcfce7; color: #166534; }
.st-cancelled { background: #fee2e2; color: #991b1b; }
.pay-pending  { background: #fef3c7; color: #92400e; }
.pay-approved { background: #dcfce7; color: #166534; }
.pay-rejected { background: #fee2e2; color: #991b1b; }
.pay-refunded { background: #f3f4f6; color: #374151; }

.action-btn { background: none; border: none; font-size: .8rem; font-weight: 500; cursor: pointer; color: #2563eb; text-decoration: none; }
.action-btn:hover { text-decoration: underline; }

.state-empty { text-align: center; padding: 3rem 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: .75rem; }
.state-empty p { font-size: .95rem; color: #6b7280; }

.sk-block { background: #f3f4f6; border-radius: .375rem; animation: pulse 1.5s ease-in-out infinite; }
.sk-cell { height: 14px; width: 80%; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }

@media (max-width: 700px) {
  .orders-table th, .orders-table td { padding: .625rem .75rem; font-size: .8rem; }
}
</style>
