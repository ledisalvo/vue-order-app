import axios from 'axios'

const API_BASE_URL = 'https://localhost:7274/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// --- Interceptor request: adjunta JWT si existe ---
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth')
  if (raw) {
    try {
      const { token } = JSON.parse(raw)
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      // token malformado — ignorar
    }
  }
  return config
})

// --- Interceptor response: unwrap envelope + manejo de 401 ---
api.interceptors.response.use(
  (response) => {
    // API devuelve { success, value, errors }
    if (Object.prototype.hasOwnProperty.call(response.data, 'success')) {
      if (response.data.success) {
        response.data = response.data.value
      } else {
        throw new Error(response.data.errors?.join(', ') ?? 'Error desconocido')
      }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Sesión expirada: limpiar auth y guardar ruta actual en sessionStorage
      localStorage.removeItem('auth')
      const redirect = window.location.pathname + window.location.search
      if (redirect !== '/login') {
        sessionStorage.setItem('auth_redirect', redirect)
      }
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

// ─── Servicios ──────────────────────────────────────────────────

// TODO(fase-2): conectar cuando Generic-Ecommerce#26 esté listo
export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    return data // { token, user }
  },
  async register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password })
    return data // { token, user }
  },
}

export const customerService = {
  async create(customer) {
    const { data } = await api.post('/customers', customer)
    return data
  },
  async getById(id) {
    const { data } = await api.get(`/customers/${id}`)
    return data
  },
  async getOrdersByCustomerId(customerId) {
    const { data } = await api.get(`/customers/${customerId}/orders`)
    return data
  },
  async getCustomers() {
    const { data } = await api.get('/customers')
    return data
  },
}

export const orderService = {
  async create(orderData) {
    const { data } = await api.post('/orders', orderData)
    return data
  },
  async updateStatus(orderId, status) {
    const { data } = await api.put(`/orders/${orderId}/status`, { status })
    return data
  },
}

// TODO(fase-3): conectar cuando el backend exponga GET /products/:slug con variantes
export const productDetailService = {
  async getBySlug(slug) {
    const { data } = await api.get(`/products/${slug}`)
    return data // { id, slug, name, category, description, price, originalPrice, images, attributes, variants }
  },
}

// TODO(fase-4): conectar cuando el backend exponga /cart
export const cartApiService = {
  async getCart() {
    const { data } = await api.get('/cart')
    return data // { items, promotions }
  },
  async addItem(productId, quantity) {
    const { data } = await api.post('/cart/items', { productId, quantity })
    return data // { items, promotions }
  },
  async updateItem(productId, quantity) {
    const { data } = await api.put(`/cart/items/${productId}`, { quantity })
    return data // { items, promotions }
  },
  async removeItem(productId) {
    const { data } = await api.delete(`/cart/items/${productId}`)
    return data // { items, promotions }
  },
}

// TODO(fase-3): conectar cuando Generic-Ecommerce#28 esté listo
export const catalogService = {
  async getProducts(params = {}) {
    // params: { page, pageSize, category, priceMin, priceMax, inStock }
    const { data } = await api.get('/products', { params })
    return data // { items, totalCount, page, pageSize, totalPages }
  },
  async getCategories() {
    const { data } = await api.get('/categories')
    return data // [{ slug, name, count }]
  },
}

export const productService = {
  async getAll() {
    const { data } = await api.get('/products')
    return data
  },
  async create(product) {
    const { data } = await api.post('/products', product)
    return data
  },
  async update(id, product) {
    const { data } = await api.put(`/products/${id}`, product)
    return data
  },
  async delete(id) {
    const { data } = await api.delete(`/products/${id}`)
    return data
  },
}

export default api
