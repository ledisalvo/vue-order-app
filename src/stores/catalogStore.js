import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { catalogService } from '@/services/api'
import { mockProducts, mockCategories } from '@/data/mockProducts.js'

// TODO(fase-3): eliminar USE_MOCK cuando Generic-Ecommerce#28 esté listo
const USE_MOCK = true

export const useCatalogStore = defineStore('catalog', () => {
  // --- Estado de productos ---
  const products   = ref([])
  const totalCount = ref(0)
  const totalPages = ref(1)
  const loading    = ref(false)
  const error      = ref(null)

  // --- Estado de categorías ---
  const categories         = ref([])
  const categoriesLoaded   = ref(false)

  // --- Filtros y paginación activos ---
  const filters = reactive({
    page:     1,
    pageSize: 20,
    category: null,
    priceMin: null,
    priceMax: null,
    inStock:  false,
  })

  // --- Caché simple: evita re-fetch si los params no cambiaron ---
  let lastFetchKey = null

  function _cacheKey() {
    return JSON.stringify({ ...filters })
  }

  async function fetchProducts(params = {}) {
    Object.assign(filters, params)
    const key = _cacheKey()
    if (key === lastFetchKey) return

    loading.value = true
    error.value   = null

    try {
      if (USE_MOCK) {
        await _fetchMock()
      } else {
        const result = await catalogService.getProducts({ ...filters })
        products.value   = result.items
        totalCount.value = result.totalCount
        totalPages.value = result.totalPages
      }
      lastFetchKey = key
    } catch (err) {
      error.value = err.message || 'Error al cargar productos'
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    if (categoriesLoaded.value) return
    try {
      if (USE_MOCK) {
        categories.value = mockCategories
      } else {
        categories.value = await catalogService.getCategories()
      }
      categoriesLoaded.value = true
    } catch {
      // no bloquear la UI si falla el fetch de categorías
    }
  }

  function setPage(page) {
    lastFetchKey = null // forzar re-fetch
    fetchProducts({ page })
  }

  function invalidateCache() {
    lastFetchKey = null
  }

  // --- Mock helper (simula paginación y filtros) ---
  async function _fetchMock() {
    let result = [...mockProducts]

    if (filters.category) result = result.filter(p => p.category === filters.category)
    if (filters.priceMin)  result = result.filter(p => p.price >= filters.priceMin)
    if (filters.priceMax)  result = result.filter(p => p.price <= filters.priceMax)
    if (filters.inStock)   result = result.filter(p => p.stock > 0)

    totalCount.value = result.length
    totalPages.value = Math.max(1, Math.ceil(result.length / filters.pageSize))

    const start = (filters.page - 1) * filters.pageSize
    products.value = result.slice(start, start + filters.pageSize)
  }

  return {
    products, totalCount, totalPages, loading, error,
    categories, filters,
    fetchProducts, fetchCategories, setPage, invalidateCache,
  }
})
