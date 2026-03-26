<template>
  <div class="detail-page container">

    <!-- Skeleton loading -->
    <div v-if="loading" class="detail-layout">
      <div class="skeleton-gallery"></div>
      <div class="skeleton-info">
        <div class="skeleton-line xl"></div>
        <div class="skeleton-line md"></div>
        <div class="skeleton-line sm"></div>
        <div class="skeleton-line lg"></div>
        <div class="skeleton-line lg"></div>
        <div class="skeleton-btn"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="fetchError" class="not-found">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2>{{ fetchError }}</h2>
      <RouterLink to="/" class="btn-back">Volver al catálogo</RouterLink>
    </div>

    <template v-else-if="product">
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
              <button
                class="qty-btn"
                :disabled="!resolvedVariant || qty >= resolvedVariant.stock"
                @click="qty++"
              >+</button>
            </div>
          </div>

          <!-- CTA -->
          <button
            class="btn-add-cart"
            :disabled="!canAddToCart || addingToCart"
            @click="addToCart"
          >
            <span v-if="addingToCart" class="spinner"></span>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {{ addToCartLabel }}
          </button>

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
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useToast } from '@/composables/useToast'
import ProductGallery from '@/components/shop/ProductGallery.vue'
import VariantSelector from '@/components/shop/VariantSelector.vue'
import { productDetailService } from '@/services/api'
import { mockProductDetails } from '@/data/mockProducts.js'
import { isDemoMode } from '@/config'

const USE_MOCK = isDemoMode

const route     = useRoute()
const cartStore = useCartStore()
const { show }  = useToast()

const product      = ref(null)
const loading      = ref(true)
const fetchError   = ref(null)
const addingToCart = ref(false)

const selectedAttributes = ref({})
const qty = ref(1)

// --- Carga del producto ---
async function loadProduct(slug) {
  loading.value    = true
  fetchError.value = null
  product.value    = null

  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300)) // simula latencia
      const found = mockProductDetails[slug]
      if (!found) throw new Error('Producto no encontrado')
      product.value = found
    } else {
      product.value = await productDetailService.getBySlug(slug)
    }
  } catch (err) {
    fetchError.value = err.message || 'Error al cargar el producto'
  } finally {
    loading.value = false
  }
}

onMounted(() => loadProduct(route.params.slug))
watch(() => route.params.slug, (slug) => {
  selectedAttributes.value = {}
  qty.value = 1
  loadProduct(slug)
})

// --- Lógica de variantes ---
const resolvedVariant = computed(() => {
  if (!product.value || product.value.attributes.length === 0) return null
  const keys = product.value.attributes.map(a => a.name)
  if (!keys.every(k => selectedAttributes.value[k])) return null
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
  if (product.value.attributes.length === 0) return 99 // sin variantes → siempre disponible
  return resolvedVariant.value?.stock ?? null
})

const availabilityLabel = computed(() => {
  const s = resolvedStock.value
  if (s === null) return 'Seleccioná una opción'
  if (s === 0)   return 'Agotado'
  if (s <= 3)    return `¡Solo quedan ${s}!`
  if (s <= 10)   return 'Stock limitado'
  return 'Disponible'
})

const availabilityClass = computed(() => {
  const s = resolvedStock.value
  if (s === null) return 'avail-unknown'
  if (s === 0)   return 'avail-out'
  if (s <= 3)    return 'avail-low'
  return 'avail-ok'
})

const canAddToCart = computed(() => {
  if (!product.value) return false
  if (product.value.attributes.length > 0 && !resolvedVariant.value) return false
  return (resolvedStock.value ?? 0) > 0
})

const addToCartLabel = computed(() => {
  if (addingToCart.value) return 'Agregando...'
  if (product.value?.attributes.length > 0 && !resolvedVariant.value) return 'Seleccioná las opciones'
  if ((resolvedStock.value ?? 0) === 0) return 'Sin stock'
  return 'Agregar al carrito'
})

// --- Agregar al carrito ---
async function addToCart() {
  if (!canAddToCart.value) return
  addingToCart.value = true

  try {
    if (!USE_MOCK) {
      // Cuando el backend esté listo: llamar cartApiService.addItem()
      // const { cartItem } = await cartApiService.addItem(resolvedVariant.value?.id ?? product.value.id, qty.value)
    }

    cartStore.addItem({
      id:    resolvedVariant.value?.id ?? product.value.id,
      name:  product.value.name,
      price: resolvedPrice.value,
    }, qty.value)

    show({ message: `"${product.value.name}" agregado al carrito`, type: 'success' })
    qty.value = 1
  } catch (err) {
    // Manejo del race condition: producto se agotó entre carga y click
    const msg = err.response?.status === 409
      ? 'El producto se agotó. Actualizá la página.'
      : 'Error al agregar al carrito. Intentá de nuevo.'
    show({ message: msg, type: 'error' })
  } finally {
    addingToCart.value = false
  }
}

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}
</script>

<style scoped>
.detail-page { padding: 1.5rem 0 3rem; }

/* Skeleton */
.skeleton-gallery {
  aspect-ratio: 1 / 1;
  background: #f3f4f6;
  border-radius: .75rem;
  animation: pulse 1.5s ease-in-out infinite;
}
.skeleton-info { display: flex; flex-direction: column; gap: .85rem; padding-top: .5rem; }
.skeleton-line {
  height: 14px;
  background: #f3f4f6;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}
.skeleton-line.xl  { width: 75%; height: 28px; }
.skeleton-line.lg  { width: 60%; }
.skeleton-line.md  { width: 40%; height: 22px; }
.skeleton-line.sm  { width: 25%; }
.skeleton-btn {
  height: 48px;
  background: #f3f4f6;
  border-radius: .6rem;
  margin-top: .5rem;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

/* Not found / error */
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

.product-name { font-size: 1.6rem; font-weight: 700; color: #111827; line-height: 1.2; margin-bottom: .75rem; }

.pricing { display: flex; align-items: baseline; gap: .75rem; margin-bottom: 1rem; }
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

.availability { display: flex; align-items: center; gap: .4rem; font-size: .85rem; font-weight: 500; margin-bottom: 1.5rem; }
.availability-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.avail-ok      { color: #166534; } .avail-ok .availability-dot      { background: #22c55e; }
.avail-low     { color: #92400e; } .avail-low .availability-dot     { background: #f59e0b; }
.avail-out     { color: #991b1b; } .avail-out .availability-dot     { background: #ef4444; }
.avail-unknown { color: #6b7280; } .avail-unknown .availability-dot { background: #d1d5db; }

.qty-row { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
.qty-label { font-size: .875rem; font-weight: 600; color: #374151; }
.qty-control { display: flex; align-items: center; border: 1px solid #e5e7eb; border-radius: .5rem; overflow: hidden; }
.qty-btn { width: 36px; height: 36px; border: none; background: #f9fafb; font-size: 1.1rem; color: #374151; cursor: pointer; transition: background .1s; }
.qty-btn:hover:not(:disabled) { background: #e5e7eb; }
.qty-btn:disabled { opacity: .4; cursor: not-allowed; }
.qty-value { padding: 0 1rem; font-size: .9rem; font-weight: 600; color: #111827; min-width: 40px; text-align: center; }

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

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.hint { font-size: .8rem; color: #9ca3af; text-align: center; margin-top: .5rem; }

.description { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb; }
.description-title { font-size: .875rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin-bottom: .75rem; }
.description p { font-size: .9rem; color: #374151; line-height: 1.7; }

@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr; gap: 1.5rem; }
  .detail-gallery { position: static; }
  .product-name { font-size: 1.3rem; }
}
</style>
