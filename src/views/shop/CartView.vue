<template>
  <div class="cart-page container">
    <h1 class="page-title">Tu carrito</h1>

    <!-- Empty state -->
    <div v-if="!cartStore.items.length" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      <h2>Tu carrito está vacío</h2>
      <p>Explorá nuestro catálogo y encontrá lo que buscás.</p>
      <RouterLink to="/" class="btn-primary">Ver productos</RouterLink>
    </div>

    <!-- Carrito con items -->
    <div v-else class="cart-layout">

      <!-- Lista de items -->
      <div class="cart-items">
        <TransitionGroup name="item">
          <div v-for="item in cartStore.items" :key="item.productId" class="cart-item">

            <!-- Imagen -->
            <div class="item-image">
              <img v-if="item.image" :src="item.image" :alt="item.name" />
              <div v-else class="item-image-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="m21 15-5-5L5 21"/>
                </svg>
              </div>
            </div>

            <!-- Detalle -->
            <div class="item-detail">
              <p class="item-name">{{ item.name }}</p>
              <p class="item-price-unit">{{ formatPrice(item.unitPrice) }} c/u</p>
            </div>

            <!-- Cantidad -->
            <div class="item-qty">
              <button
                class="qty-btn"
                :disabled="item.quantity <= 1 || cartStore.syncing"
                @click="handleQtyChange(item, item.quantity - 1)"
              >−</button>
              <span class="qty-value">{{ item.quantity }}</span>
              <button
                class="qty-btn"
                :disabled="cartStore.syncing"
                @click="handleQtyChange(item, item.quantity + 1)"
              >+</button>
            </div>

            <!-- Subtotal -->
            <p class="item-subtotal">{{ formatPrice(item.unitPrice * item.quantity) }}</p>

            <!-- Eliminar -->
            <button
              class="btn-remove"
              :disabled="cartStore.syncing"
              aria-label="Eliminar"
              @click="handleRemove(item)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>

          </div>
        </TransitionGroup>
      </div>

      <!-- Resumen -->
      <aside class="cart-summary">
        <h2 class="summary-title">Resumen del pedido</h2>

        <div class="summary-rows">
          <div class="summary-row">
            <span>Subtotal ({{ cartStore.totalItems }} producto{{ cartStore.totalItems !== 1 ? 's' : '' }})</span>
            <span>{{ formatPrice(cartStore.subtotal) }}</span>
          </div>

          <!-- Promociones -->
          <div
            v-for="promo in cartStore.promotions"
            :key="promo.name"
            class="summary-row promo-row"
          >
            <span class="promo-name">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              {{ promo.name }}
            </span>
            <span class="promo-amount">-{{ formatPrice(promo.discount) }}</span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row total-row">
            <span>Total</span>
            <span>{{ formatPrice(cartStore.total) }}</span>
          </div>
        </div>

        <RouterLink to="/checkout" class="btn-checkout">
          Iniciar compra
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </RouterLink>

        <RouterLink to="/" class="btn-keep-shopping">
          Continuar comprando
        </RouterLink>
      </aside>

    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cartStore'
import { useToast } from '@/composables/useToast'

const cartStore = useCartStore()
const { show }  = useToast()

async function handleQtyChange(item, newQty) {
  try {
    await cartStore.updateQuantity(item.productId, newQty)
  } catch (err) {
    show({ message: err.message, type: 'error' })
  }
}

async function handleRemove(item) {
  try {
    await cartStore.removeItem(item.productId)
    show({ message: `"${item.name}" eliminado del carrito`, type: 'info' })
  } catch (err) {
    show({ message: err.message, type: 'error' })
  }
}

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}
</script>

<style scoped>
.cart-page { padding: 1.5rem 0 3rem; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 1.75rem; }

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 5rem 2rem;
  text-align: center;
  color: #6b7280;
}
.empty-state svg { width: 64px; height: 64px; color: #d1d5db; }
.empty-state h2 { font-size: 1.2rem; color: #374151; }
.empty-state p  { font-size: .9rem; }
.btn-primary {
  padding: .65rem 1.75rem;
  background: #111827;
  color: #fff;
  border-radius: .6rem;
  text-decoration: none;
  font-weight: 700;
  font-size: .9rem;
  transition: background .15s;
}
.btn-primary:hover { background: #2563eb; }

/* Layout */
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}

/* Items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: .75rem;
  overflow: hidden;
}

.cart-item {
  display: grid;
  grid-template-columns: 72px 1fr auto auto auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background .1s;
}
.cart-item:last-child { border-bottom: none; }
.cart-item:hover { background: #fafafa; }

/* Imagen */
.item-image {
  width: 72px;
  height: 72px;
  border-radius: .5rem;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;
}
.item-image img { width: 100%; height: 100%; object-fit: cover; }
.item-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
}
.item-image-placeholder svg { width: 28px; height: 28px; }

/* Detalle */
.item-detail { min-width: 0; }
.item-name {
  font-size: .9rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-price-unit { font-size: .8rem; color: #9ca3af; margin-top: .2rem; }

/* Cantidad */
.item-qty {
  display: flex;
  align-items: center;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  overflow: hidden;
}
.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f9fafb;
  font-size: 1rem;
  color: #374151;
  cursor: pointer;
  transition: background .1s;
}
.qty-btn:hover:not(:disabled) { background: #e5e7eb; }
.qty-btn:disabled { opacity: .35; cursor: not-allowed; }
.qty-value {
  padding: 0 .75rem;
  font-size: .875rem;
  font-weight: 600;
  color: #111827;
  min-width: 36px;
  text-align: center;
}

/* Subtotal */
.item-subtotal {
  font-size: .9rem;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  min-width: 80px;
  text-align: right;
}

/* Eliminar */
.btn-remove {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: .375rem;
  transition: color .1s, background .1s;
}
.btn-remove:hover:not(:disabled) { color: #ef4444; background: #fef2f2; }
.btn-remove svg { width: 16px; height: 16px; }

/* Transición de lista */
.item-enter-active, .item-leave-active { transition: all .2s ease; }
.item-enter-from { opacity: 0; transform: translateX(-12px); }
.item-leave-to   { opacity: 0; transform: translateX(12px); max-height: 0; padding: 0; }

/* Summary */
.cart-summary {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: .75rem;
  padding: 1.5rem;
  position: sticky;
  top: 80px;
}
.summary-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.25rem;
}
.summary-rows { display: flex; flex-direction: column; gap: .75rem; }
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: .875rem;
  color: #374151;
}
.promo-row { color: #166534; }
.promo-name {
  display: flex;
  align-items: center;
  gap: .35rem;
  font-size: .8rem;
  font-weight: 500;
}
.promo-name svg { width: 14px; height: 14px; }
.promo-amount { font-weight: 700; font-size: .875rem; }
.summary-divider { border: none; border-top: 1px solid #e5e7eb; margin: .25rem 0; }
.total-row {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
}

.btn-checkout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  width: 100%;
  padding: .85rem;
  background: #111827;
  color: #fff;
  border-radius: .6rem;
  text-decoration: none;
  font-size: .95rem;
  font-weight: 700;
  margin-top: 1.25rem;
  transition: background .15s;
}
.btn-checkout svg { width: 18px; height: 18px; }
.btn-checkout:hover { background: #2563eb; }

.btn-keep-shopping {
  display: block;
  text-align: center;
  margin-top: .75rem;
  font-size: .85rem;
  color: #6b7280;
  text-decoration: none;
  transition: color .15s;
}
.btn-keep-shopping:hover { color: #2563eb; }

/* Responsive */
@media (max-width: 768px) {
  .cart-layout { grid-template-columns: 1fr; }
  .cart-summary { position: static; }
  .cart-item { grid-template-columns: 60px 1fr; grid-template-rows: auto auto; row-gap: .75rem; }
  .item-qty    { grid-column: 2; }
  .item-subtotal { display: none; }
  .btn-remove  { grid-column: 2; justify-self: end; margin-top: -.5rem; }
}
</style>
