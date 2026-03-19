<template>
  <div class="admin-page">
    <div class="admin-container">

      <template v-if="loading">
        <div class="sk-block sk-title"></div>
        <div class="detail-card">
          <div v-for="i in 4" :key="i" class="sk-field">
            <div class="sk-block sk-label"></div>
            <div class="sk-block sk-input"></div>
          </div>
        </div>
      </template>

      <div v-else-if="error" class="state-error">
        <p>{{ error }}</p>
      </div>

      <template v-else-if="order">
        <div class="page-header">
          <RouterLink to="/admin/pedidos" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Pedidos
          </RouterLink>
          <div class="header-meta">
            <h1 class="page-title">Pedido #{{ order.number }}</h1>
            <span class="status-pill" :class="orderStatusClass(order.status)">{{ orderStatusLabel(order.status) }}</span>
          </div>
          <p class="order-date">{{ formatDate(order.date) }} — {{ order.customer.name }} ({{ order.customer.email }})</p>
        </div>

        <div class="detail-layout">

          <!-- Cambio de estado -->
          <section class="detail-card">
            <h2 class="section-title">Cambio de estado</h2>
            <div class="status-form">
              <div class="field">
                <label class="field-label">Nuevo estado</label>
                <select v-model="newStatus" class="field-input">
                  <option v-for="s in ALLOWED_TRANSITIONS[order.status] ?? []" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </option>
                </select>
              </div>
              <Transition name="slide">
                <div v-if="newStatus === 'shipped'" class="field">
                  <label class="field-label">Número de seguimiento / empresa</label>
                  <input v-model="trackingNumber" class="field-input" placeholder="Ej: OCA-123456, Andreani #789012…" />
                </div>
              </Transition>
              <div v-if="statusError" class="save-error">{{ statusError }}</div>
              <div class="status-actions">
                <span class="current-status-note">
                  Estado actual: <strong>{{ orderStatusLabel(order.status) }}</strong>
                </span>
                <button
                  class="btn-primary"
                  :disabled="!newStatus || changingStatus"
                  @click="changeStatus"
                >
                  <span v-if="changingStatus" class="spinner"></span>
                  {{ changingStatus ? 'Guardando…' : 'Cambiar estado' }}
                </button>
              </div>
            </div>

            <!-- Tracking actual -->
            <div v-if="order.trackingNumber" class="tracking-info">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>
              </svg>
              Seguimiento actual: <strong>{{ order.trackingNumber }}</strong>
            </div>
          </section>

          <!-- Items -->
          <section class="detail-card">
            <h2 class="section-title">Productos</h2>
            <div v-if="!order.items.length" class="empty-items">
              <p class="meta-detail">Sin items registrados en este pedido (mock sin datos).</p>
            </div>
            <div v-for="item in order.items" :key="item.productId" class="item-row">
              <div class="item-info">
                <p class="item-name">{{ item.name }}</p>
                <p v-if="item.variant && Object.keys(item.variant).length" class="item-variant">
                  {{ formatVariant(item.variant) }}
                </p>
                <p class="item-qty">{{ item.quantity }} × {{ formatPrice(item.unitPrice) }}</p>
              </div>
              <p class="item-total">{{ formatPrice(item.unitPrice * item.quantity) }}</p>
            </div>
          </section>

          <!-- Totales y pago -->
          <section class="detail-card two-col">
            <div>
              <h2 class="section-title">Totales</h2>
              <div class="total-row"><span>Envío ({{ order.shippingOption?.name }})</span><span>{{ order.shippingOption?.price === 0 ? 'Gratis' : formatPrice(order.shippingOption?.price ?? 0) }}</span></div>
              <div class="total-row grand"><span>Total</span><span>{{ formatPrice(order.total) }}</span></div>
            </div>
            <div>
              <h2 class="section-title">Pago</h2>
              <div class="meta-detail">
                Estado:
                <span class="status-pill" :class="paymentStatusClass(order.paymentStatus)">{{ paymentStatusLabel(order.paymentStatus) }}</span>
              </div>
              <div v-if="order.paymentReference" class="meta-detail">Referencia MP: <strong>{{ order.paymentReference }}</strong></div>
            </div>
          </section>

          <!-- Envío -->
          <section class="detail-card two-col">
            <div>
              <h2 class="section-title">Dirección de envío</h2>
              <p class="meta-detail">{{ order.shippingAddress?.name }}</p>
              <p class="meta-detail">{{ order.shippingAddress?.street }}, {{ order.shippingAddress?.city }}</p>
              <p class="meta-detail">{{ order.shippingAddress?.province }}, CP {{ order.shippingAddress?.zip }}</p>
              <p class="meta-detail">Tel: {{ order.shippingAddress?.phone }}</p>
            </div>
            <div>
              <h2 class="section-title">Facturación</h2>
              <p v-if="order.needsInvoice" class="meta-detail">
                Factura<br>CUIT: {{ order.invoiceData?.cuit }}<br>{{ order.invoiceData?.razonSocial }}
              </p>
              <p v-else class="meta-detail">Ticket consumidor final</p>
            </div>
          </section>

          <!-- Notas -->
          <section v-if="order.notes" class="detail-card">
            <h2 class="section-title">Notas del cliente</h2>
            <p class="meta-detail">{{ order.notes }}</p>
          </section>

        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { adminOrderService } from '@/services/api'

const USE_MOCK = true

const route  = useRoute()
const loading = ref(true)
const error   = ref(null)
const order   = ref(null)
const newStatus      = ref('')
const trackingNumber = ref('')
const changingStatus = ref(false)
const statusError    = ref(null)

const ALLOWED_TRANSITIONS = {
  pending_payment: [
    { value: 'confirmed',  label: '→ Confirmar pedido' },
    { value: 'cancelled',  label: '→ Cancelar' },
  ],
  confirmed: [
    { value: 'shipped',   label: '→ Marcar como enviado' },
    { value: 'cancelled', label: '→ Cancelar' },
  ],
  shipped: [
    { value: 'delivered', label: '→ Marcar como entregado' },
    { value: 'cancelled', label: '→ Cancelar' },
  ],
  delivered: [],
  cancelled: [],
}

// Shared mock store (same as AdminOrdersView)
const MOCK_ORDERS = {
  o1: { id: 'o1', number: '2025-001', date: '2025-01-15T10:00:00Z', customer: { id: 'c1', name: 'Juan Pérez', email: 'juan@mail.com' }, total: 35400, status: 'delivered', paymentStatus: 'approved', trackingNumber: 'OCA-123456', items: [{ productId: 'p1', name: 'Remera Oversize', quantity: 2, unitPrice: 12500, variant: { Talle: 'M', Color: 'Negro' } }], shippingAddress: { name: 'Juan Pérez', street: 'Av. Corrientes 1234', city: 'Buenos Aires', province: 'CABA', zip: '1414', phone: '11 2345-6789' }, shippingOption: { name: 'Envío estándar', price: 2500 }, needsInvoice: false, invoiceData: null, notes: 'Por favor envolver.', paymentReference: 'MP-987654' },
  o2: { id: 'o2', number: '2025-002', date: '2025-02-03T14:30:00Z', customer: { id: 'c2', name: 'María García', email: 'maria@mail.com' }, total: 18900, status: 'shipped', paymentStatus: 'approved', trackingNumber: 'ANDREANI-789012', items: [{ productId: 'p3', name: 'Buzo Canguro', quantity: 1, unitPrice: 18900, variant: { Talle: 'XL', Color: 'Gris' } }], shippingAddress: { name: 'María García', street: 'Belgrano 567', city: 'Córdoba', province: 'Córdoba', zip: '5000', phone: '351 678-9012' }, shippingOption: { name: 'Envío express', price: 5500 }, needsInvoice: true, invoiceData: { cuit: '20-12345678-9', razonSocial: 'García María S.R.L.' }, notes: '', paymentReference: 'MP-111222' },
  o3: { id: 'o3', number: '2025-003', date: '2025-03-10T09:15:00Z', customer: { id: 'c3', name: 'Carlos López', email: 'carlos@mail.com' }, total: 8750,  status: 'confirmed', paymentStatus: 'approved', trackingNumber: null, items: [{ productId: 'p4', name: 'Calza Deportiva', quantity: 1, unitPrice: 8750, variant: { Talle: 'S' } }], shippingAddress: { name: 'Carlos López', street: 'San Martín 890', city: 'Rosario', province: 'Santa Fe', zip: '2000', phone: '341 234-5678' }, shippingOption: { name: 'Retiro en local', price: 0 }, needsInvoice: false, invoiceData: null, notes: '', paymentReference: 'MP-333444' },
  o4: { id: 'o4', number: '2025-004', date: '2025-03-15T16:45:00Z', customer: { id: 'c4', name: 'Ana Martínez', email: 'ana@mail.com' }, total: 12500, status: 'pending_payment', paymentStatus: 'pending', trackingNumber: null, items: [], shippingAddress: { name: 'Ana Martínez', street: 'Lavalle 234', city: 'Mendoza', province: 'Mendoza', zip: '5500', phone: '261 345-6789' }, shippingOption: { name: 'Envío estándar', price: 2500 }, needsInvoice: false, invoiceData: null, notes: '', paymentReference: null },
  o5: { id: 'o5', number: '2025-005', date: '2025-03-18T11:00:00Z', customer: { id: 'c5', name: 'Pedro Sánchez', email: 'pedro@mail.com' }, total: 6800,  status: 'cancelled', paymentStatus: 'refunded', trackingNumber: null, items: [], shippingAddress: { name: 'Pedro Sánchez', street: 'Mitre 100', city: 'Tucumán', province: 'Tucumán', zip: '4000', phone: '381 456-7890' }, shippingOption: { name: 'Envío estándar', price: 2500 }, needsInvoice: false, invoiceData: null, notes: '', paymentReference: 'MP-555666' },
}

async function load() {
  loading.value = true
  error.value   = null
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 350))
      const found = MOCK_ORDERS[route.params.id]
      if (!found) throw new Error('not found')
      order.value = { ...found }
    } else {
      order.value = await adminOrderService.getById(route.params.id)
    }
  } catch {
    error.value = 'No pudimos cargar el pedido.'
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function changeStatus() {
  if (!newStatus.value) return
  changingStatus.value = true
  statusError.value    = null
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      order.value.status = newStatus.value
      if (newStatus.value === 'shipped') order.value.trackingNumber = trackingNumber.value || null
    } else {
      await adminOrderService.updateStatus(order.value.id, newStatus.value, trackingNumber.value || null)
      await load()
    }
    newStatus.value      = ''
    trackingNumber.value = ''
  } catch {
    statusError.value = 'No pudimos cambiar el estado. Intentá de nuevo.'
  } finally {
    changingStatus.value = false
  }
}

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
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
function formatVariant(v) {
  return Object.entries(v).map(([k, val]) => `${k}: ${val}`).join(' · ')
}
</script>

<style scoped>
.admin-page { min-height: calc(100vh - 64px); background: #f9fafb; padding: 2rem 1rem; }
.admin-container { max-width: 900px; margin: 0 auto; }

.back-link { display: inline-flex; align-items: center; gap: .35rem; font-size: .85rem; color: #6b7280; text-decoration: none; margin-bottom: .5rem; }
.back-link svg { width: 16px; height: 16px; }
.back-link:hover { color: #111827; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #111827; }
.header-meta { display: flex; align-items: center; gap: .875rem; margin-bottom: .25rem; }
.order-date { font-size: .82rem; color: #6b7280; }
.page-header { margin-bottom: 1.5rem; }

.detail-layout { display: flex; flex-direction: column; gap: 1rem; }
.detail-card { background: #fff; border: 1px solid #e5e7eb; border-radius: .75rem; padding: 1.5rem; }
.detail-card.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.section-title { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin-bottom: .875rem; }

/* Status form */
.status-form { display: flex; flex-direction: column; gap: .875rem; }
.field { display: flex; flex-direction: column; gap: .3rem; }
.field-label { font-size: .78rem; font-weight: 600; color: #374151; }
.field-input { padding: .6rem .75rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; font-size: .875rem; color: #111827; background: #fff; }
.field-input:focus { outline: none; border-color: #2563eb; }
.status-actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.current-status-note { font-size: .82rem; color: #6b7280; }

.tracking-info { display: flex; align-items: center; gap: .5rem; margin-top: .875rem; font-size: .82rem; color: #374151; padding: .6rem .875rem; background: #f0f9ff; border-radius: .5rem; border: 1px solid #bae6fd; }
.tracking-info svg { width: 16px; height: 16px; color: #0369a1; flex-shrink: 0; }

/* Items */
.item-row { display: flex; align-items: center; gap: .875rem; padding: .625rem 0; border-bottom: 1px solid #f3f4f6; }
.item-row:last-child { border-bottom: none; }
.item-info { flex: 1; }
.item-name { font-size: .875rem; font-weight: 600; color: #111827; }
.item-variant { font-size: .75rem; color: #6b7280; margin-top: .1rem; }
.item-qty { font-size: .75rem; color: #9ca3af; margin-top: .15rem; }
.item-total { font-size: .9rem; font-weight: 700; color: #111827; white-space: nowrap; }
.empty-items p { color: #9ca3af; }

/* Totals */
.total-row { display: flex; justify-content: space-between; font-size: .875rem; color: #374151; margin-bottom: .4rem; }
.total-row.grand { font-weight: 700; color: #111827; font-size: 1rem; padding-top: .5rem; border-top: 1px solid #e5e7eb; margin-top: .25rem; }

/* Meta */
.meta-detail { font-size: .875rem; color: #374151; line-height: 1.6; }

/* Status pills */
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

/* Buttons */
.btn-primary { display: inline-flex; align-items: center; gap: .4rem; padding: .65rem 1.5rem; background: #111827; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .875rem; cursor: pointer; transition: background .15s; }
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

.save-error { padding: .65rem .875rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: .5rem; font-size: .82rem; color: #991b1b; }

/* Skeleton */
.sk-block { background: #f3f4f6; border-radius: .375rem; animation: pulse 1.5s ease-in-out infinite; }
.sk-title { height: 28px; width: 200px; margin-bottom: 1.5rem; }
.sk-field { margin-bottom: 1rem; }
.sk-label { height: 12px; width: 80px; margin-bottom: .4rem; }
.sk-input { height: 38px; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }

/* Transitions */
.slide-enter-active, .slide-leave-active { transition: all .25s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; }
.slide-enter-to, .slide-leave-from { opacity: 1; max-height: 200px; }

/* Error */
.state-error { text-align: center; padding: 2.5rem 1rem; }
.state-error p { color: #6b7280; }

/* Spinner */
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .admin-page { padding: 1.25rem .75rem; }
  .detail-card.two-col { grid-template-columns: 1fr; gap: 1rem; }
}
</style>
