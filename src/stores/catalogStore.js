import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref([])
  const categories = ref([])
  const activeCategory = ref(null)
  const loading = ref(false)

  function setProducts(data) {
    products.value = data
  }

  function setCategories(data) {
    categories.value = data
  }

  function setActiveCategory(slug) {
    activeCategory.value = slug
  }

  return { products, categories, activeCategory, loading, setProducts, setCategories, setActiveCategory }
})
