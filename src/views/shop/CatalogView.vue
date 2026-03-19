<template>
  <div class="catalog-page container">

    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <RouterLink to="/" class="breadcrumb-link">Inicio</RouterLink>
      <span class="breadcrumb-sep">/</span>
      <span v-if="activeCategoryName">
        <RouterLink to="/" class="breadcrumb-link">Catálogo</RouterLink>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ activeCategoryName }}</span>
      </span>
      <span v-else class="breadcrumb-current">Catálogo</span>
    </nav>

    <div class="catalog-layout">

      <!-- Sidebar (desktop) -->
      <div class="sidebar-wrap">
        <CatalogSidebar
          v-model="localFilters"
          :categories="catalogStore.categories"
          :total-count="catalogStore.totalCount"
        />
      </div>

      <!-- Contenido principal -->
      <div class="catalog-main">

        <!-- Toolbar -->
        <div class="catalog-toolbar">
          <p class="results-count">
            <template v-if="!catalogStore.loading">
              <strong>{{ catalogStore.totalCount }}</strong>
              producto{{ catalogStore.totalCount !== 1 ? 's' : '' }}
            </template>
            <span v-else class="skeleton-text"></span>
          </p>

          <div class="toolbar-right">
            <button class="btn-filters-mobile" @click="sidebarOpen = !sidebarOpen">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="20" y2="12"/>
                <line x1="12" y1="18" x2="20" y2="18"/>
              </svg>
              Filtros
            </button>

            <select v-model="sortBy" class="sort-select" aria-label="Ordenar por">
              <option value="relevance">Relevancia</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="newest">Novedades</option>
            </select>
          </div>
        </div>

        <!-- Sidebar mobile -->
        <div v-if="sidebarOpen" class="sidebar-mobile">
          <CatalogSidebar
            v-model="localFilters"
            :categories="catalogStore.categories"
            :total-count="catalogStore.totalCount"
          />
        </div>

        <!-- Error state -->
        <div v-if="catalogStore.error" class="error-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ catalogStore.error }}</p>
          <button class="btn-empty-cta" @click="loadProducts">Reintentar</button>
        </div>

        <!-- Skeleton loading -->
        <div v-else-if="catalogStore.loading" class="product-grid">
          <div v-for="n in catalogStore.filters.pageSize" :key="n" class="product-skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-body">
              <div class="skeleton-line long"></div>
              <div class="skeleton-line short"></div>
              <div class="skeleton-line medium"></div>
            </div>
          </div>
        </div>

        <!-- Grid -->
        <template v-else-if="catalogStore.products.length > 0">
          <div class="product-grid">
            <ProductCard
              v-for="product in sortedProducts"
              :key="product.id"
              :product="product"
            />
          </div>

          <!-- Paginación -->
          <div v-if="catalogStore.totalPages > 1" class="pagination">
            <button
              class="page-btn"
              :disabled="catalogStore.filters.page <= 1"
              @click="changePage(catalogStore.filters.page - 1)"
            >
              ‹ Anterior
            </button>

            <div class="page-numbers">
              <button
                v-for="p in visiblePages"
                :key="p"
                class="page-btn page-number"
                :class="{ active: p === catalogStore.filters.page, ellipsis: p === '…' }"
                :disabled="p === '…'"
                @click="p !== '…' && changePage(p)"
              >
                {{ p }}
              </button>
            </div>

            <button
              class="page-btn"
              :disabled="catalogStore.filters.page >= catalogStore.totalPages"
              @click="changePage(catalogStore.filters.page + 1)"
            >
              Siguiente ›
            </button>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <h3>No encontramos productos</h3>
          <p>Probá con otros filtros o explorá todas las categorías.</p>
          <button class="btn-empty-cta" @click="resetFilters">Ver todos los productos</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalogStore'
import CatalogSidebar from '@/components/shop/CatalogSidebar.vue'
import ProductCard from '@/components/shop/ProductCard.vue'

const route        = useRoute()
const router       = useRouter()
const catalogStore = useCatalogStore()

const sortBy     = ref('relevance')
const sidebarOpen = ref(false)

// Filtros locales del sidebar — se sincronizan al store con debounce
const localFilters = reactive({
  category: null,
  priceMin: null,
  priceMax: null,
  inStock:  false,
})

const activeCategoryName = computed(() => {
  const slug = route.params.slug || localFilters.category
  return catalogStore.categories.find(c => c.slug === slug)?.name ?? ''
})

// Ordenamiento client-side (solo afecta la página actual)
const sortedProducts = computed(() => {
  const list = [...catalogStore.products]
  if (sortBy.value === 'price-asc')  return list.sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price-desc') return list.sort((a, b) => b.price - a.price)
  return list
})

// Páginas visibles con ellipsis
const visiblePages = computed(() => {
  const total   = catalogStore.totalPages
  const current = catalogStore.filters.page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (current > 3) pages.push('…')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

function loadProducts() {
  const category = route.params.slug || localFilters.category || null
  catalogStore.fetchProducts({
    page:     1,
    category,
    priceMin: localFilters.priceMin,
    priceMax: localFilters.priceMax,
    inStock:  localFilters.inStock,
  })
}

function changePage(page) {
  catalogStore.setPage(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetFilters() {
  localFilters.category = null
  localFilters.priceMin = null
  localFilters.priceMax = null
  localFilters.inStock  = false
  if (route.params.slug) router.push('/')
}

// Inicializar categoría desde la ruta
onMounted(() => {
  if (route.params.slug) localFilters.category = route.params.slug
  catalogStore.fetchCategories()
  loadProducts()
})

// Re-fetch cuando cambia la ruta /categoria/:slug
watch(() => route.params.slug, (slug) => {
  localFilters.category = slug || null
  catalogStore.invalidateCache()
  loadProducts()
})

// Re-fetch con debounce cuando cambian los filtros
let debounceTimer = null
watch(localFilters, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    catalogStore.invalidateCache()
    loadProducts()
  }, 350)
})
</script>

<style scoped>
.catalog-page { padding: 1.5rem 0 3rem; }

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

.catalog-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 2rem;
  align-items: start;
}
.sidebar-wrap { position: sticky; top: 80px; }

.catalog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
}
.results-count { font-size: .875rem; color: #6b7280; }
.toolbar-right { display: flex; align-items: center; gap: .75rem; }

.skeleton-text {
  display: inline-block;
  width: 80px;
  height: 14px;
  background: #e5e7eb;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.btn-filters-mobile {
  display: none;
  align-items: center;
  gap: .4rem;
  padding: .45rem .75rem;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  background: #fff;
  font-size: .8rem;
  color: #374151;
  cursor: pointer;
}
.btn-filters-mobile svg { width: 16px; height: 16px; }

.sort-select {
  padding: .45rem .75rem;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  font-size: .8rem;
  color: #374151;
  background: #fff;
  cursor: pointer;
}
.sort-select:focus { outline: none; border-color: #2563eb; }

.sidebar-mobile {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: .75rem;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

/* Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

/* Skeletons */
.product-skeleton {
  border: 1px solid #e5e7eb;
  border-radius: .75rem;
  overflow: hidden;
  background: #fff;
}
.skeleton-image {
  aspect-ratio: 1 / 1;
  background: #f3f4f6;
  animation: pulse 1.5s ease-in-out infinite;
}
.skeleton-body { padding: .875rem; display: flex; flex-direction: column; gap: .5rem; }
.skeleton-line {
  height: 12px;
  background: #f3f4f6;
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}
.skeleton-line.long   { width: 80%; }
.skeleton-line.short  { width: 40%; }
.skeleton-line.medium { width: 60%; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

/* Paginación */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}
.page-btn {
  padding: .45rem .85rem;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  background: #fff;
  font-size: .875rem;
  color: #374151;
  cursor: pointer;
  transition: background .1s, border-color .1s;
}
.page-btn:hover:not(:disabled):not(.ellipsis) { background: #f3f4f6; border-color: #d1d5db; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-number.active {
  background: #111827;
  border-color: #111827;
  color: #fff;
  font-weight: 700;
}
.page-number.ellipsis { border: none; background: none; cursor: default; }

/* Error state */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
}
.error-state svg { width: 48px; height: 48px; color: #ef4444; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
}
.empty-state svg { width: 56px; height: 56px; color: #d1d5db; }
.empty-state h3 { font-size: 1.1rem; color: #374151; }
.empty-state p { font-size: .875rem; }
.btn-empty-cta {
  margin-top: .5rem;
  padding: .6rem 1.5rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: .5rem;
  font-size: .875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s;
}
.btn-empty-cta:hover { background: #1d4ed8; }

@media (max-width: 1024px) { .product-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) {
  .catalog-layout { grid-template-columns: 1fr; }
  .sidebar-wrap { display: none; }
  .btn-filters-mobile { display: flex; }
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) { .product-grid { grid-template-columns: 1fr; } }
</style>
