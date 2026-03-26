<template>
  <div class="step-cart">
    <h2 class="step-title">Revisá tu carrito</h2>

    <div class="items-list">
      <div v-for="item in cartStore.items" :key="item.productId" class="item-row">
        <div class="item-image">
          <img v-if="item.image" :src="item.image" :alt="item.name" />
          <div v-else class="img-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
          </div>
        </div>
        <div class="item-info">
          <p class="item-name">{{ item.name }}</p>
          <p class="item-meta">{{ item.quantity }} × {{ formatPrice(item.unitPrice) }}</p>
        </div>
        <p class="item-total">{{ formatPrice(item.unitPrice * item.quantity) }}</p>
      </div>
    </div>

    <div class="summary">
      <div class="summary-row" v-for="promo in cartStore.promotions" :key="promo.name">
        <span class="promo-label">{{ promo.name }}</span>
        <span class="promo-value">-{{ formatPrice(promo.discount) }}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>{{ formatPrice(cartStore.total) }}</span>
      </div>
    </div>

    <div class="step-actions">
      <RouterLink to="/cart" class="btn-secondary">Editar carrito</RouterLink>
      <button class="btn-primary" @click="emit('next')">Continuar</button>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cartStore'
const cartStore = useCartStore()
const emit = defineEmits(['next'])
function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.step-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin-bottom: 1.25rem; }

.items-list { display: flex; flex-direction: column; gap: .75rem; margin-bottom: 1.25rem; }
.item-row { display: flex; align-items: center; gap: .875rem; padding: .75rem; background: #f9fafb; border-radius: .5rem; }
.item-image { width: 52px; height: 52px; border-radius: .375rem; overflow: hidden; background: #e5e7eb; flex-shrink: 0; }
.item-image img { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #d1d5db; }
.img-placeholder svg { width: 20px; height: 20px; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: .875rem; font-weight: 600; color: #111827; }
.item-meta { font-size: .78rem; color: #9ca3af; margin-top: .15rem; }
.item-total { font-size: .875rem; font-weight: 700; color: #111827; white-space: nowrap; }

.summary { border-top: 1px solid #e5e7eb; padding-top: .875rem; display: flex; flex-direction: column; gap: .5rem; }
.summary-row { display: flex; justify-content: space-between; font-size: .875rem; color: #374151; }
.promo-label { color: #166534; font-size: .8rem; }
.promo-value { color: #166534; font-weight: 600; }
.summary-row.total { font-weight: 700; font-size: 1rem; color: #111827; padding-top: .5rem; border-top: 1px solid #e5e7eb; }

.step-actions { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.75rem; }
.btn-primary { padding: .7rem 2rem; background: #111827; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .9rem; cursor: pointer; transition: background .15s; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { padding: .7rem 1.25rem; background: #fff; color: #374151; border: 1px solid #e5e7eb; border-radius: .6rem; font-weight: 600; font-size: .9rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: border-color .15s; }
.btn-secondary:hover { border-color: #374151; }
</style>
