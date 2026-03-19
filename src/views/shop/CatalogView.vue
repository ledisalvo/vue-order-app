<template>
  <div class="catalog-page container">

    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <RouterLink to="/" class="breadcrumb-link">Inicio</RouterLink>
      <span class="breadcrumb-sep">/</span>
      <span v-if="activeCategory">
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
          v-model="filters"
          :categories="mockCategories"
          :total-count="mockProducts.length"
        />
      </div>

      <!-- Contenido principal -->
      <div class="catalog-main">

        <!-- Toolbar -->
        <div class="catalog-toolbar">
          <p class="results-count">
            <strong>{{ filteredProducts.length }}</strong> producto{{ filteredProducts.length !== 1 ? 's' : '' }}
          </p>

          <div class="toolbar-right">
            <!-- Filtros mobile toggle -->
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
            v-model="filters"
            :categories="mockCategories"
            :total-count="mockProducts.length"
          />
        </div>

        <!-- Grid -->
        <div v-if="filteredProducts.length > 0" class="product-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
        </div>

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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import CatalogSidebar from '@/components/shop/CatalogSidebar.vue'
import ProductCard from '@/components/shop/ProductCard.vue'
import { mockProducts, mockCategories } from '@/data/mockProducts.js'

const route = useRoute()

const filters = ref({ category: null, priceMin: null, priceMax: null, inStock: false })
const sortBy = ref('relevance')
const sidebarOpen = ref(false)

const activeCategory = computed(() => route.params.slug || filters.value.category)
const activeCategoryName = computed(() =>
  mockCategories.find(c => c.slug === activeCategory.value)?.name ?? ''
)

const filteredProducts = computed(() => {
  let result = [...mockProducts]

  const cat = activeCategory.value
  if (cat) result = result.filter(p => p.category === cat)
  if (filters.value.priceMin) result = result.filter(p => p.price >= filters.value.priceMin)
  if (filters.value.priceMax) result = result.filter(p => p.price <= filters.value.priceMax)
  if (filters.value.inStock)  result = result.filter(p => p.stock > 0)

  if (sortBy.value === 'price-asc')  result.sort((a, b) => a.price - b.price)
  if (sortBy.value === 'price-desc') result.sort((a, b) => b.price - a.price)

  return result
})

function resetFilters() {
  filters.value = { category: null, priceMin: null, priceMax: null, inStock: false }
}
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

.sidebar-wrap {
  position: sticky;
  top: 80px;
}

.catalog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  gap: 1rem;
}
.results-count { font-size: .875rem; color: #6b7280; }
.toolbar-right { display: flex; align-items: center; gap: .75rem; }

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

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

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

@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .catalog-layout { grid-template-columns: 1fr; }
  .sidebar-wrap { display: none; }
  .btn-filters-mobile { display: flex; }
  .product-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .product-grid { grid-template-columns: 1fr; }
}
</style>
