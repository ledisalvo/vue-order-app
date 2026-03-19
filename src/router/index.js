import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
  {
    path: '/',
    name: 'catalog',
    component: () => import('@/views/shop/CatalogView.vue'),
  },
  {
    path: '/categoria/:slug',
    name: 'category',
    component: () => import('@/views/shop/CatalogView.vue'),
  },
  {
    path: '/producto/:slug',
    name: 'product-detail',
    component: () => import('@/views/shop/ProductDetailView.vue'),
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/shop/CartView.vue'),
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/shop/CheckoutView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/checkout/resultado',
    name: 'checkout-result',
    component: () => import('@/views/shop/CheckoutResultView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/shop/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/registro',
    name: 'register',
    component: () => import('@/views/shop/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/mi-cuenta/pedidos',
    name: 'my-orders',
    component: () => import('@/views/shop/MyOrdersView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/mi-cuenta/pedidos/:id',
    name: 'order-detail',
    component: () => import('@/views/shop/OrderDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/mi-cuenta/direcciones',
    name: 'my-addresses',
    component: () => import('@/views/shop/MyAddressesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'catalog' }
  }
})

export default router
