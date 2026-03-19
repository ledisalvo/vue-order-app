import axios from 'axios'

const API_BASE_URL = 'http://localhost:5141/api'

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

// TODO(fase-4): conectar cuando el backend exponga estos endpoints
export const checkoutService = {
  async getAddresses() {
    const { data } = await api.get('/addresses')
    return data // [{ id, name, street, city, province, zip, phone, isDefault }]
  },
  async getShippingOptions(addressId, items) {
    const { data } = await api.post('/shipping/options', { addressId, items })
    return data // [{ id, name, price, estimatedDays }]
  },
  async createOrder(payload) {
    const { data } = await api.post('/orders', payload)
    return data // { orderId, initPoint (URL MercadoPago) }
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

export const adminProductService = {
  async getAll() {
    const { data } = await api.get('/products')
    // Normalizar campos del backend al formato que usan las vistas
    return data.map(p => ({
      ...p,
      totalStock: p.stockQuantity,
      active: p.isActive,
    }))
  },
  async getById(id) {
    const { data } = await api.get(`/products/${id}`)
    return {
      ...data,
      stock: data.stockQuantity,
      active: data.isActive,
    }
  },
  async create(payload) {
    const { data } = await api.post('/products', {
      name: payload.name,
      price: payload.price,
      stockQuantity: payload.stock ?? 0,
    })
    return data
  },
  async update(id, payload) {
    const { data } = await api.put(`/products/${id}`, {
      name: payload.name,
      price: payload.price,
      stockQuantity: payload.stock ?? 0,
      isActive: payload.active,
    })
    return data
  },
  async remove(id) {
    await api.delete(`/products/${id}`)
  },
  async toggleActive(product, active) {
    const { data } = await api.put(`/products/${product.id}`, {
      name: product.name,
      price: product.price,
      stockQuantity: product.totalStock ?? 0,
      isActive: active,
    })
    return data
  },
  // TODO(cloudinary): conectar upload cuando Generic-Ecommerce#1 esté resuelto
  async uploadImage(file) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/admin/images/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data // { url, publicId }
  },
}

// TODO(fase-5): conectar cuando el backend exponga /my/addresses
export const addressesService = {
  async getAll() {
    const { data } = await api.get('/my/addresses')
    return data // [{ id, alias, name, street, city, province, zip, phone, isDefault }]
  },
  async create(address) {
    const { data } = await api.post('/my/addresses', address)
    return data
  },
  async update(id, address) {
    const { data } = await api.put(`/my/addresses/${id}`, address)
    return data
  },
  async remove(id) {
    await api.delete(`/my/addresses/${id}`)
  },
  async setDefault(id) {
    const { data } = await api.patch(`/my/addresses/${id}/default`)
    return data
  },
}

// TODO(fase-6): conectar cuando el backend exponga /admin/orders
export const adminOrderService = {
  async getAll(params = {}) {
    const { data } = await api.get('/admin/orders', { params })
    return data // [{ id, number, date, customer, total, status, paymentStatus, trackingNumber }]
  },
  async getById(id) {
    const { data } = await api.get(`/admin/orders/${id}`)
    return data
  },
  async updateStatus(id, status, trackingNumber = null) {
    const { data } = await api.put(`/admin/orders/${id}/status`, { status, trackingNumber })
    return data
  },
}

export default api
