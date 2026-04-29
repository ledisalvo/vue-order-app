import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { catalogService } from '@/services/api'

export const useCatalogStore = defineStore('catalog', () => {
  const products   = ref([])
  const totalCount = ref(0)
  const totalPages = ref(1)
  const loading    = ref(false)
  const error      = ref(null)

  const categories       = ref([])
  const categoriesLoaded = ref(false)

  const filters = reactive({
    page:     1,
    pageSize: 20,
    category: null,
    priceMin: null,
    priceMax: null,
    inStock:  false,
  })

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
      const result = await catalogService.getProducts({ ...filters })
      products.value   = result.items
      totalCount.value = result.totalCount
      totalPages.value = result.totalPages
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
      categories.value    = await catalogService.getCategories()
      categoriesLoaded.value = true
    } catch {
      // no bloquear la UI si falla el fetch de categorías
    }
  }

  function setPage(page) {
    lastFetchKey = null
    fetchProducts({ page })
  }

  function invalidateCache() {
    lastFetchKey = null
  }

  return {
    products, totalCount, totalPages, loading, error,
    categories, filters,
    fetchProducts, fetchCategories, setPage, invalidateCache,
  }
})
