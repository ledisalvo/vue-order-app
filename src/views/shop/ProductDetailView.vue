<template>
  <div class="detail-page container">

    <!-- Producto no encontrado -->
    <div v-if="!product" class="not-found">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2>Producto no encontrado</h2>
      <RouterLink to="/" class="btn-back">Volver al catálogo</RouterLink>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="breadcrumb">
        <RouterLink to="/" class="breadcrumb-link">Inicio</RouterLink>
        <span class="breadcrumb-sep">/</span>
        <RouterLink :to="`/categoria/${product.category.slug}`" class="breadcrumb-link">
          {{ product.category.name }}
        </RouterLink>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ product.name }}</span>
      </nav>

      <div class="detail-layout">

        <!-- Galería -->
        <div class="detail-gallery">
          <ProductGallery :images="product.images" :alt="product.name" />
        </div>

        <!-- Info -->
        <div class="detail-info">
          <h1 class="product-name">{{ product.name }}</h1>

          <!-- Precio -->
          <div class="pricing">
            <span class="price">{{ formatPrice(resolvedPrice) }}</span>
            <span v-if="product.originalPrice" class="original-price">
              {{ formatPrice(product.originalPrice) }}
            </span>
            <span v-if="product.originalPrice" class="discount-badge">
              -{{ discountPct }}%
            </span>
          </div>

          <!-- Disponibilidad -->
          <div class="availability" :class="availabilityClass">
            <span class="availability-dot"></span>
            {{ availabilityLabel }}
          </div>

          <!-- Variantes -->
          <VariantSelector
            v-if="product.attributes.length > 0"
            v-model="selectedAttributes"
            :attributes="product.attributes"
            :variants="product.variants"
          />

          <!-- Cantidad -->
          <div class="qty-row">
            <label class="qty-label">Cantidad</label>
            <div class="qty-control">
              <button class="qty-btn" :disabled="qty <= 1" @click="qty--">−</button>
              <span class="qty-value">{{ qty }}</span>
              <button class="qty-btn" :disabled="!resolvedVariant || qty >= resolvedVariant.stock" @click="qty++">+</button>
            </div>
          </div>

          <!-- CTA -->
          <button
            class="btn-add-cart"
            :disabled="!canAddToCart"
            @click="addToCart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {{ addToCartLabel }}
          </button>

          <!-- Hint cuando falta seleccionar variante -->
          <p v-if="product.attributes.length > 0 && !resolvedVariant" class="hint">
            Seleccioná todas las opciones para agregar al carrito
          </p>

          <!-- Descripción -->
          <div class="description">
            <h3 class="description-title">Descripción</h3>
            <p>{{ product.description }}</p>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import ProductGallery from '@/components/shop/ProductGallery.vue'
import VariantSelector from '@/components/shop/VariantSelector.vue'
import { mockProductDetails } from '@/data/mockProducts.js'

const route = useRoute()
const cartStore = useCartStore()

const product = computed(() => mockProductDetails[route.params.slug] ?? null)

const selectedAttributes = ref({})
const qty = ref(1)

// Variante que coincide exactamente con todos los atributos seleccionados
const resolvedVariant = computed(() => {
  if (!product.value || product.value.attributes.length === 0) return null
  const keys = product.value.attributes.map(a => a.name)
  const allSelected = keys.every(k => selectedAttributes.value[k])
  if (!allSelected) return null
  return product.value.variants.find(v =>
    keys.every(k => v.attributes[k] === selectedAttributes.value[k])
  ) ?? null
})

const resolvedPrice = computed(() => {
  if (resolvedVariant.value?.priceOverride) return resolvedVariant.value.priceOverride
  return product.value?.price ?? 0
})

const discountPct = computed(() => {
  if (!product.value?.originalPrice) return 0
  return Math.round((1 - product.value.price / product.value.originalPrice) * 100)
})

const resolvedStock = computed(() => {
  if (!product.value) return 0
  if (product.value.attributes.length === 0) {
    return product.value.variants.reduce((s, v) => s + v.stock, 0) || 99
  }
  return resolvedVariant.value?.stock ?? null // null = aún no seleccionó
})

const availabilityLabel = computed(() => {
  const stock = resolvedStock.value
  if (stock === null) return 'Seleccioná una opción'
  if (stock === 0)    return 'Agotado'
  if (stock <= 3)     return `¡Solo quedan ${stock}!`
  if (stock <= 10)    return 'Stock limitado'
  return 'Disponible'
})

const availabilityClass = computed(() => {
  const stock = resolvedStock.value
  if (stock === null) return 'avail-unknown'
  if (stock === 0)    return 'avail-out'
  if (stock <= 3)     return 'avail-low'
  return 'avail-ok'
})

const canAddToCart = computed(() => {
  if (!product.value) return false
  if (product.value.attributes.length > 0 && !resolvedVariant.value) return false
  return (resolvedStock.value ?? 0) > 0
})

const addToCartLabel = computed(() => {
  if (!product.value) return ''
  if (product.value.attributes.length > 0 && !resolvedVariant.value) return 'Seleccioná las opciones'
  if ((resolvedStock.value ?? 0) === 0) return 'Sin stock'
  return 'Agregar al carrito'
})

function addToCart() {
  if (!canAddToCart.value) return
  cartStore.addItem({
    id: resolvedVariant.value?.id ?? product.value.id,
    name: product.value.name,
    price: resolvedPrice.value,
  }, qty.value)
  qty.value = 1
}

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.detail-page { padding: 1.5rem 0 3rem; }

/* Not found */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 5rem 0;
  color: #6b7280;
  text-align: center;
}
.not-found svg { width: 56px; height: 56px; }
.not-found h2 { color: #374151; }
.btn-back {
  padding: .6rem 1.5rem;
  background: #2563eb;
  color: #fff;
  border-radius: .5rem;
  text-decoration: none;
  font-weight: 600;
  font-size: .875rem;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .8rem;
  color: #9ca3af;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.breadcrumb-link { color: #6b7280; text-decoration: none; }
.breadcrumb-link:hover { color: #2563eb; }
.breadcrumb-sep { color: #d1d5db; }
.breadcrumb-current { color: #111827; font-weight: 500; }

/* Layout */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}
.detail-gallery { position: sticky; top: 80px; }

/* Info */
.product-name {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
  margin-bottom: .75rem;
}

/* Precio */
.pricing {
  display: flex;
  align-items: baseline;
  gap: .75rem;
  margin-bottom: 1rem;
}
.price { font-size: 1.5rem; font-weight: 700; color: #111827; }
.original-price { font-size: 1rem; color: #9ca3af; text-decoration: line-through; }
.discount-badge {
  padding: .2rem .5rem;
  background: #dcfce7;
  color: #166534;
  font-size: .75rem;
  font-weight: 700;
  border-radius: .25rem;
}

/* Availability */
.availability {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .85rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}
.availability-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.avail-ok      { color: #166534; }
.avail-ok .availability-dot      { background: #22c55e; }
.avail-low     { color: #92400e; }
.avail-low .availability-dot     { background: #f59e0b; }
.avail-out     { color: #991b1b; }
.avail-out .availability-dot     { background: #ef4444; }
.avail-unknown { color: #6b7280; }
.avail-unknown .availability-dot { background: #d1d5db; }

/* Cantidad */
.qty-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
}
.qty-label { font-size: .875rem; font-weight: 600; color: #374151; }
.qty-control {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  overflow: hidden;
}
.qty-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f9fafb;
  font-size: 1.1rem;
  color: #374151;
  cursor: pointer;
  transition: background .1s;
}
.qty-btn:hover:not(:disabled) { background: #e5e7eb; }
.qty-btn:disabled { opacity: .4; cursor: not-allowed; }
.qty-value {
  padding: 0 1rem;
  font-size: .9rem;
  font-weight: 600;
  color: #111827;
  min-width: 40px;
  text-align: center;
}

/* CTA */
.btn-add-cart {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .6rem;
  padding: .85rem;
  background: #111827;
  color: #fff;
  border: none;
  border-radius: .6rem;
  font-size: .95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
}
.btn-add-cart svg { width: 20px; height: 20px; }
.btn-add-cart:hover:not(:disabled) { background: #2563eb; }
.btn-add-cart:disabled { background: #d1d5db; color: #9ca3af; cursor: not-allowed; }

.hint { font-size: .8rem; color: #9ca3af; text-align: center; margin-top: .5rem; }

/* Descripción */
.description { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
.description-title { font-size: .875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin-bottom: .75rem; }
.description p { font-size: .9rem; color: #374151; line-height: 1.7; }

/* Responsive */
@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr; gap: 1.5rem; }
  .detail-gallery { position: static; }
  .product-name { font-size: 1.3rem; }
}
</style>
