<template>
  <div class="detail-page">
    <div class="detail-container">

      <!-- Skeleton -->
      <template v-if="loading">
        <div class="sk-block sk-title"></div>
        <div class="detail-card">
          <div v-for="i in 3" :key="i" class="sk-item">
            <div class="sk-block sk-thumb"></div>
            <div class="sk-lines">
              <div class="sk-block sk-line wide"></div>
              <div class="sk-block sk-line narrow"></div>
            </div>
          </div>
        </div>
      </template>

      <!-- Error -->
      <div v-else-if="error" class="state-error">
        <p>{{ error }}</p>
        <button class="btn-secondary" @click="load">Reintentar</button>
      </div>

      <template v-else-if="order">
        <!-- Header -->
        <div class="page-header">
          <RouterLink to="/mi-cuenta/pedidos" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Mis pedidos
          </RouterLink>
          <div class="header-meta">
            <h1 class="page-title">Pedido #{{ order.number }}</h1>
            <span class="status-badge" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
          </div>
          <p class="order-date">{{ formatDate(order.date) }}</p>
        </div>

        <!-- Timeline -->
        <section class="detail-card">
          <h2 class="section-title">Estado del pedido</h2>
          <div class="timeline">
            <div
              v-for="(step, idx) in TIMELINE_STEPS"
              :key="step.key"
              class="timeline-step"
              :class="{ done: isStepDone(step.key), current: isStepCurrent(step.key) }"
            >
              <div class="step-connector" v-if="idx > 0" :class="{ filled: isStepDone(TIMELINE_STEPS[idx - 1].key) }"></div>
              <div class="step-dot">
                <svg v-if="isStepDone(step.key)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="step-label">{{ step.label }}</p>
            </div>
          </div>
        </section>

        <!-- Items -->
        <section class="detail-card">
          <h2 class="section-title">Productos</h2>
          <div v-for="item in order.items" :key="item.productId" class="item-row">
            <div class="item-thumb">
              <img v-if="item.image" :src="item.image" :alt="item.name" />
              <div v-else class="thumb-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L5 21"/>
                </svg>
              </div>
            </div>
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

        <!-- Totales -->
        <section class="detail-card">
          <h2 class="section-title">Totales</h2>
          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>{{ formatPrice(order.subtotal ?? order.total - (order.shippingOption?.price ?? 0)) }}</span>
            </div>
            <div class="total-row">
              <span>Envío ({{ order.shippingOption?.name ?? '—' }})</span>
              <span>{{ order.shippingOption?.price === 0 ? 'Gratis' : formatPrice(order.shippingOption?.price ?? 0) }}</span>
            </div>
            <div class="total-row grand">
              <span>Total pagado</span>
              <span>{{ formatPrice(order.total) }}</span>
            </div>
          </div>
        </section>

        <!-- Envío -->
        <section class="detail-card">
          <h2 class="section-title">Dirección de envío</h2>
          <p class="meta-detail">{{ order.shippingAddress?.name }}</p>
          <p class="meta-detail">{{ order.shippingAddress?.street }}, {{ order.shippingAddress?.city }}</p>
          <p class="meta-detail">{{ order.shippingAddress?.province }}, CP {{ order.shippingAddress?.zip }}</p>
          <p class="meta-detail">Tel: {{ order.shippingAddress?.phone }}</p>
        </section>

        <!-- Facturación -->
        <section class="detail-card">
          <h2 class="section-title">Facturación</h2>
          <p v-if="order.needsInvoice" class="meta-detail">
            Factura — CUIT: {{ order.invoiceData?.cuit }} / {{ order.invoiceData?.razonSocial }}
          </p>
          <p v-else class="meta-detail">Ticket consumidor final</p>
        </section>

        <!-- Notas -->
        <section v-if="order.notes" class="detail-card">
          <h2 class="section-title">Notas</h2>
          <p class="meta-detail">{{ order.notes }}</p>
        </section>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { myOrdersService } from '@/services/api'

const USE_MOCK = true

const route   = useRoute()
const loading = ref(true)
const error   = ref(null)
const order   = ref(null)

const TIMELINE_STEPS = [
  { key: 'pending_payment', label: 'Pendiente de pago' },
  { key: 'confirmed',       label: 'Confirmado'         },
  { key: 'shipped',         label: 'Enviado'             },
  { key: 'delivered',       label: 'Entregado'           },
]
const STATUS_ORDER = TIMELINE_STEPS.map(s => s.key)

function isStepDone(key) {
  const current = order.value?.status
  return STATUS_ORDER.indexOf(key) < STATUS_ORDER.indexOf(current)
}
function isStepCurrent(key) { return order.value?.status === key }

const MOCK_ORDERS = {
  'ord-001': {
    id: 'ord-001', number: '2024-001', date: '2024-11-10T14:30:00Z', status: 'delivered',
    total: 35400, subtotal: 32900,
    items: [
      { productId: 'p1', name: 'Remera Oversize', image: null, quantity: 2, unitPrice: 12500, variant: { Talle: 'M', Color: 'Negro' } },
      { productId: 'p2', name: 'Jogger Deportivo', image: null, quantity: 1, unitPrice: 10400, variant: { Talle: 'L' } },
    ],
    shippingAddress: { name: 'Juan Pérez', street: 'Av. Corrientes 1234', city: 'Buenos Aires', province: 'CABA', zip: '1414', phone: '11 2345-6789' },
    shippingOption: { name: 'Envío estándar', price: 2500 },
    needsInvoice: false,
    invoiceData: null,
    notes: 'Por favor envolver para regalo.',
  },
  'ord-002': {
    id: 'ord-002', number: '2024-002', date: '2024-12-05T09:15:00Z', status: 'shipped',
    total: 18900, subtotal: 18900,
    items: [
      { productId: 'p3', name: 'Buzo Canguro', image: null, quantity: 1, unitPrice: 18900, variant: { Talle: 'XL', Color: 'Gris' } },
    ],
    shippingAddress: { name: 'María García', street: 'Belgrano 567', city: 'Córdoba', province: 'Córdoba', zip: '5000', phone: '351 678-9012' },
    shippingOption: { name: 'Retiro en local', price: 0 },
    needsInvoice: true,
    invoiceData: { cuit: '20-12345678-9', razonSocial: 'García María S.R.L.' },
    notes: '',
  },
  'ord-003': {
    id: 'ord-003', number: '2025-001', date: '2025-01-20T17:45:00Z', status: 'confirmed',
    total: 8750, subtotal: 3250,
    items: [
      { productId: 'p4', name: 'Calza Deportiva', image: null, quantity: 1, unitPrice: 8750, variant: { Talle: 'S' } },
    ],
    shippingAddress: { name: 'Carlos López', street: 'San Martín 890', city: 'Rosario', province: 'Santa Fe', zip: '2000', phone: '341 234-5678' },
    shippingOption: { name: 'Envío express', price: 5500 },
    needsInvoice: false,
    invoiceData: null,
    notes: '',
  },
}

async function load() {
  loading.value = true
  error.value   = null
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      const found = MOCK_ORDERS[route.params.id]
      if (!found) throw new Error('not found')
      order.value = found
    } else {
      order.value = await myOrdersService.getOrderById(route.params.id)
    }
  } catch {
    error.value = 'No pudimos cargar el pedido. Intentá de nuevo.'
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
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}
function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
function formatVariant(v) {
  return Object.entries(v).map(([k, val]) => `${k}: ${val}`).join(' · ')
}
</script>

<style scoped>
.detail-page { min-height: calc(100vh - 64px); background: #f9fafb; padding: 2rem 1rem; }
.detail-container { max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }

/* Header */
.back-link { display: inline-flex; align-items: center; gap: .35rem; font-size: .85rem; color: #6b7280; text-decoration: none; margin-bottom: .5rem; }
.back-link svg { width: 16px; height: 16px; }
.back-link:hover { color: #111827; }
.header-meta { display: flex; align-items: center; gap: .875rem; margin-bottom: .25rem; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #111827; }
.order-date { font-size: .82rem; color: #6b7280; }

/* Card */
.detail-card { background: #fff; border: 1px solid #e5e7eb; border-radius: .75rem; padding: 1.25rem 1.5rem; }
.section-title { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin-bottom: 1rem; }

/* Status badges */
.status-badge { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: .2rem .55rem; border-radius: .375rem; white-space: nowrap; }
.status-pending   { background: #fef3c7; color: #92400e; }
.status-confirmed { background: #dbeafe; color: #1e40af; }
.status-shipped   { background: #e0f2fe; color: #0369a1; }
.status-delivered { background: #dcfce7; color: #166534; }
.status-cancelled { background: #fee2e2; color: #991b1b; }

/* Timeline */
.timeline { display: flex; align-items: flex-start; gap: 0; }
.timeline-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
.step-connector {
  position: absolute; top: 11px; right: 50%; left: -50%;
  height: 2px; background: #e5e7eb; z-index: 0;
}
.step-connector.filled { background: #111827; }
.step-dot {
  width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid #e5e7eb; background: #fff;
  display: flex; align-items: center; justify-content: center;
  z-index: 1; position: relative; flex-shrink: 0;
  transition: border-color .2s, background .2s;
}
.step-dot svg { width: 13px; height: 13px; }
.timeline-step.done .step-dot { border-color: #111827; background: #111827; color: #fff; }
.timeline-step.current .step-dot { border-color: #2563eb; border-width: 3px; }
.step-label { font-size: .7rem; color: #9ca3af; margin-top: .4rem; text-align: center; line-height: 1.3; }
.timeline-step.done .step-label, .timeline-step.current .step-label { color: #111827; font-weight: 600; }

/* Items */
.item-row { display: flex; align-items: center; gap: .875rem; padding: .75rem 0; border-bottom: 1px solid #f3f4f6; }
.item-row:last-child { border-bottom: none; padding-bottom: 0; }
.item-thumb { width: 52px; height: 52px; border-radius: .375rem; overflow: hidden; background: #f3f4f6; flex-shrink: 0; }
.item-thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #d1d5db; }
.thumb-placeholder svg { width: 20px; height: 20px; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: .875rem; font-weight: 600; color: #111827; }
.item-variant { font-size: .75rem; color: #6b7280; margin-top: .1rem; }
.item-qty { font-size: .75rem; color: #9ca3af; margin-top: .15rem; }
.item-total { font-size: .9rem; font-weight: 700; color: #111827; white-space: nowrap; }

/* Totales */
.totals { display: flex; flex-direction: column; gap: .5rem; }
.total-row { display: flex; justify-content: space-between; font-size: .875rem; color: #374151; }
.total-row.grand { font-size: 1rem; font-weight: 700; color: #111827; padding-top: .6rem; border-top: 1px solid #e5e7eb; margin-top: .25rem; }

/* Meta details */
.meta-detail { font-size: .875rem; color: #374151; margin-bottom: .2rem; line-height: 1.5; }

/* Skeleton */
.sk-block { background: #f3f4f6; border-radius: .375rem; animation: pulse 1.5s ease-in-out infinite; }
.sk-title { height: 28px; width: 220px; margin-bottom: 1.25rem; }
.sk-item { display: flex; align-items: center; gap: .875rem; padding: .75rem 0; border-bottom: 1px solid #f3f4f6; }
.sk-thumb { width: 52px; height: 52px; border-radius: .375rem; flex-shrink: 0; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: .5rem; }
.sk-line { height: 12px; }
.sk-line.wide { width: 65%; }
.sk-line.narrow { width: 40%; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }

/* Error */
.state-error { text-align: center; padding: 2.5rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.state-error p { font-size: .95rem; color: #6b7280; }
.btn-secondary { padding: .6rem 1.5rem; background: #fff; border: 1px solid #e5e7eb; border-radius: .6rem; font-size: .875rem; font-weight: 600; cursor: pointer; color: #374151; }
.btn-secondary:hover { border-color: #374151; }

@media (max-width: 600px) {
  .detail-page { padding: 1.25rem .75rem; }
  .detail-card { padding: 1rem 1.1rem; }
  .step-label { font-size: .65rem; }
}
</style>
