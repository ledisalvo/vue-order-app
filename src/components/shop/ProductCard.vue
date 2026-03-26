<template>
  <article class="product-card">
    <!-- Imagen -->
    <RouterLink :to="`/producto/${product.slug}`" class="product-image-wrap">
      <img v-if="product.image" :src="product.image" :alt="product.name" class="product-image" />
      <div v-else class="product-image-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>

      <!-- Badges -->
      <div class="product-badges">
        <span v-if="product.originalPrice" class="badge badge-sale">OFERTA</span>
        <span v-if="product.stock === 0" class="badge badge-out">AGOTADO</span>
        <span v-else-if="product.stock <= 5" class="badge badge-low">ÚLTIMOS</span>
      </div>
    </RouterLink>

    <!-- Info -->
    <div class="product-info">
      <RouterLink :to="`/producto/${product.slug}`" class="product-name">
        {{ product.name }}
      </RouterLink>

      <div class="product-pricing">
        <span class="product-price">{{ formatPrice(product.price) }}</span>
        <span v-if="product.originalPrice" class="product-original-price">
          {{ formatPrice(product.originalPrice) }}
        </span>
      </div>

      <!-- CTA -->
      <button
        v-if="product.stock > 0"
        class="btn-add-cart"
        :disabled="product.hasVariants"
        @click.prevent="handleAddToCart"
      >
        {{ product.hasVariants ? 'Seleccionar opciones' : 'Agregar al carrito' }}
      </button>
      <span v-else class="out-of-stock-label">Sin stock</span>
    </div>
  </article>
</template>

<script setup>
import { useCartStore } from '@/stores/cartStore'

const props = defineProps({
  product: { type: Object, required: true },
})

const cartStore = useCartStore()

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function handleAddToCart() {
  cartStore.addItem(props.product)
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: .75rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: box-shadow .2s, transform .2s;
}
.product-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,.1);
  transform: translateY(-2px);
}

/* Imagen */
.product-image-wrap {
  position: relative;
  display: block;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f3f4f6;
  text-decoration: none;
}
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .3s;
}
.product-card:hover .product-image { transform: scale(1.04); }

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;
}
.product-image-placeholder svg { width: 48px; height: 48px; }

/* Badges */
.product-badges {
  position: absolute;
  top: .5rem;
  left: .5rem;
  display: flex;
  flex-direction: column;
  gap: .25rem;
}
.badge {
  display: inline-block;
  padding: .2rem .5rem;
  border-radius: .25rem;
  font-size: .65rem;
  font-weight: 700;
  letter-spacing: .04em;
}
.badge-sale { background: #2563eb; color: #fff; }
.badge-out  { background: #6b7280; color: #fff; }
.badge-low  { background: #f59e0b; color: #fff; }

/* Info */
.product-info {
  padding: .875rem;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  flex: 1;
}

.product-name {
  font-size: .9rem;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-name:hover { color: #2563eb; }

.product-pricing { display: flex; align-items: baseline; gap: .5rem; }
.product-price { font-size: 1rem; font-weight: 700; color: #111827; }
.product-original-price {
  font-size: .8rem;
  color: #9ca3af;
  text-decoration: line-through;
}

/* CTA */
.btn-add-cart {
  margin-top: auto;
  width: 100%;
  padding: .55rem;
  background: #111827;
  color: #fff;
  border: none;
  border-radius: .5rem;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-add-cart:hover:not(:disabled) { background: #2563eb; }
.btn-add-cart:disabled {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}

.out-of-stock-label {
  font-size: .8rem;
  color: #9ca3af;
  text-align: center;
  padding: .4rem 0;
}
</style>
