import axios from 'axios'
import { apiBaseUrl } from '@/config'
import type { AuthResponse, OnboardingResponse, TenantDetail } from '@/types'

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

// --- Interceptor request: adjunta JWT y X-Tenant-Slug si existen ---
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth')
  if (raw) {
    try {
      const { token } = JSON.parse(raw) as { token?: string }
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      // token malformado — ignorar
    }
  }
  // Inyectar tenant activo si existe en sessionStorage/tenantStore hydration
  const tenantSlug = sessionStorage.getItem('tenant_slug')
  if (tenantSlug) config.headers['X-Tenant-Slug'] = tenantSlug
  return config
})

// --- Interceptor response: unwrap envelope + manejo de 401 ---
api.interceptors.response.use(
  (response) => {
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
      localStorage.removeItem('auth')
      const redirect = window.location.pathname + window.location.search
      if (redirect !== '/auth/login') {
        sessionStorage.setItem('auth_redirect', redirect)
      }
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  },
)

// ─── Servicios ──────────────────────────────────────────────────

// TODO(fase-2): conectar cuando Generic-Ecommerce#26 esté listo
export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    return data
  },
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password })
    return data
  },
}

export const onboardingService = {
  async submit(payload: {
    name: string
    email: string
    password: string
    storeName: string
    storeSlug: string
    category: string
  }): Promise<OnboardingResponse> {
    const { data } = await api.post<OnboardingResponse>('/auth/onboarding', payload)
    return data
  },
}

export const customerService = {
  async create(customer: Record<string, unknown>) {
    const { data } = await api.post('/customers', customer)
    return data
  },
  async getById(id: string) {
    const { data } = await api.get(`/customers/${id}`)
    return data
  },
  async getOrdersByCustomerId(customerId: string) {
    const { data } = await api.get(`/customers/${customerId}/orders`)
    return data
  },
  async getCustomers() {
    const { data } = await api.get('/customers')
    return data
  },
}

export const orderService = {
  async getAll(params: Record<string, unknown> = {}) {
    const { data } = await api.get('/orders', { params })
    return data
  },
  async getById(id: string) {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },
  async create(orderData: Record<string, unknown>) {
    const { data } = await api.post('/orders', orderData)
    return data
  },
  async updateStatus(orderId: string, status: string) {
    const { data } = await api.put(`/orders/${orderId}/status`, { status })
    return data
  },
}

export const productDetailService = {
  async getById(id: string) {
    const { data } = await api.get(`/products/${id}`)
    return data
  },
}

// TODO(fase-4): conectar cuando el backend exponga estos endpoints
export const checkoutService = {
  async getAddresses() {
    const { data } = await api.get('/addresses')
    return data
  },
  async getShippingOptions(addressId: string, items: unknown[]) {
    const { data } = await api.post('/shipping/options', { addressId, items })
    return data
  },
  async createOrder(payload: Record<string, unknown>) {
    const { data } = await api.post('/orders', payload)
    return data
  },
}

// TODO(fase-4): conectar cuando el backend exponga /cart
export const cartApiService = {
  async getCart() {
    const { data } = await api.get('/cart')
    return data
  },
  async addItem(productId: string, quantity: number) {
    const { data } = await api.post('/cart/items', { productId, quantity })
    return data
  },
  async updateItem(productId: string, quantity: number) {
    const { data } = await api.put(`/cart/items/${productId}`, { quantity })
    return data
  },
  async removeItem(productId: string) {
    const { data } = await api.delete(`/cart/items/${productId}`)
    return data
  },
}

// TODO(fase-3): conectar cuando Generic-Ecommerce#28 esté listo
export const catalogService = {
  async getProducts(params: Record<string, unknown> = {}) {
    const { data } = await api.get('/products', { params })
    return data
  },
  async getCategories() {
    const { data } = await api.get('/categories')
    return data
  },
}

export const productService = {
  async getAll() {
    const { data } = await api.get('/products')
    return data
  },
  async create(product: Record<string, unknown>) {
    const { data } = await api.post('/products', product)
    return data
  },
  async update(id: string, product: Record<string, unknown>) {
    const { data } = await api.put(`/products/${id}`, product)
    return data
  },
  async delete(id: string) {
    const { data } = await api.delete(`/products/${id}`)
    return data
  },
}

export const adminProductService = {
  async getAll() {
    const { data } = await api.get('/products')
    return data.map((p: Record<string, unknown>) => ({
      ...p,
      totalStock: p.stockQuantity,
      active: p.isActive,
    }))
  },
  async getById(id: string) {
    const { data } = await api.get(`/products/${id}`)
    return { ...data, stock: data.stockQuantity, active: data.isActive }
  },
  async create(payload: { name: string; price: number; stock?: number }) {
    const { data } = await api.post('/products', {
      name: payload.name,
      price: payload.price,
      stockQuantity: payload.stock ?? 0,
    })
    return data
  },
  async update(id: string, payload: { name: string; price: number; stock?: number; active?: boolean }) {
    const { data } = await api.put(`/products/${id}`, {
      name: payload.name,
      price: payload.price,
      stockQuantity: payload.stock ?? 0,
      isActive: payload.active,
    })
    return data
  },
  async remove(id: string) {
    await api.delete(`/products/${id}`)
  },
  async toggleActive(product: { id: string; name: string; price: number; totalStock?: number }, active: boolean) {
    const { data } = await api.put(`/products/${product.id}`, {
      name: product.name,
      price: product.price,
      stockQuantity: product.totalStock ?? 0,
      isActive: active,
    })
    return data
  },
  async uploadImage(file: File) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post('/admin/images/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}

// TODO(fase-5): conectar cuando el backend exponga /my/addresses
export const addressesService = {
  async getAll() {
    const { data } = await api.get('/my/addresses')
    return data
  },
  async create(address: Record<string, unknown>) {
    const { data } = await api.post('/my/addresses', address)
    return data
  },
  async update(id: string, address: Record<string, unknown>) {
    const { data } = await api.put(`/my/addresses/${id}`, address)
    return data
  },
  async remove(id: string) {
    await api.delete(`/my/addresses/${id}`)
  },
  async setDefault(id: string) {
    const { data } = await api.patch(`/my/addresses/${id}/default`)
    return data
  },
}

// TODO(fase-6): conectar cuando el backend exponga /admin/orders
export const adminOrderService = {
  async getAll(params: Record<string, unknown> = {}) {
    const { data } = await api.get('/admin/orders', { params })
    return data
  },
  async getById(id: string) {
    const { data } = await api.get(`/admin/orders/${id}`)
    return data
  },
  async updateStatus(id: string, status: string, trackingNumber: string | null = null) {
    const { data } = await api.put(`/admin/orders/${id}/status`, { status, trackingNumber })
    return data
  },
}

// TODO(back): el endpoint GET /orders no filtra por customerId todavía.
// Agregar filtro en GetAllOrdersQuery del back cuando esté listo.
export const myOrdersService = {
  async getOrders(customerId?: string) {
    const params = customerId ? { customerId } : {}
    const { data } = await api.get('/orders', { params })
    return data
  },
}

// TODO(fase-6): conectar cuando el backend exponga /admin/config
export const adminConfigService = {
  async getCategories() { const { data } = await api.get('/admin/categories'); return data },
  async createCategory(payload: Record<string, unknown>) { const { data } = await api.post('/admin/categories', payload); return data },
  async updateCategory(id: string, payload: Record<string, unknown>) { const { data } = await api.put(`/admin/categories/${id}`, payload); return data },
  async deleteCategory(id: string) { await api.delete(`/admin/categories/${id}`) },

  async getPromotions() { const { data } = await api.get('/admin/promotions'); return data },
  async createPromotion(payload: Record<string, unknown>) { const { data } = await api.post('/admin/promotions', payload); return data },
  async updatePromotion(id: string, payload: Record<string, unknown>) { const { data } = await api.put(`/admin/promotions/${id}`, payload); return data },
  async deletePromotion(id: string) { await api.delete(`/admin/promotions/${id}`) },

  async getShippingZones() { const { data } = await api.get('/admin/shipping-zones'); return data },
  async createShippingZone(payload: Record<string, unknown>) { const { data } = await api.post('/admin/shipping-zones', payload); return data },
  async updateShippingZone(id: string, payload: Record<string, unknown>) { const { data } = await api.put(`/admin/shipping-zones/${id}`, payload); return data },
  async deleteShippingZone(id: string) { await api.delete(`/admin/shipping-zones/${id}`) },

  async getPickupPoints() { const { data } = await api.get('/admin/pickup-points'); return data },
  async updatePickupPoint(id: string, payload: Record<string, unknown>) { const { data } = await api.put(`/admin/pickup-points/${id}`, payload); return data },
}

export const tenantService = {
  async getBySlug(slug: string): Promise<TenantDetail> {
    const { data } = await api.get<TenantDetail>(`/tenants/${slug}`)
    return data
  },
  async getByDomain(hostname: string): Promise<TenantDetail> {
    const { data } = await api.get<TenantDetail>('/tenants/by-domain', { params: { hostname } })
    return data
  },
  async getMe(): Promise<TenantDetail> {
    const { data } = await api.get<TenantDetail>('/tenants/me')
    return data
  },
}

export default api
