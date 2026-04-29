import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'

// ─── Grupo 1: Plataforma pública (sin tenant) ────────────────────────────────
const platformRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/LandingView.vue'),
  },
  {
    path: '/auth/login',
    alias: '/login',
    name: 'login',
    component: () => import('@/views/shop/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/auth/registro',
    alias: '/registro',
    name: 'register',
    component: () => import('@/views/shop/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

// ─── Onboarding del vendedor ──────────────────────────────────────────────────
const onboardingRoutes = [
  {
    path: '/onboarding/step1',
    name: 'onboarding-step1',
    component: () => import('@/views/onboarding/OnboardingStep1View.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/onboarding/step2',
    name: 'onboarding-step2',
    component: () => import('@/views/onboarding/OnboardingStep2View.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/onboarding/step3',
    name: 'onboarding-step3',
    component: () => import('@/views/onboarding/OnboardingStep3View.vue'),
    meta: { requiresAuth: true, requiresRole: 'seller' },
  },
  {
    path: '/onboarding/listo',
    name: 'onboarding-completed',
    component: () => import('@/views/onboarding/OnboardingCompletedView.vue'),
    meta: { requiresAuth: true, requiresRole: 'seller' },
  },
]

// ─── Redirects desde rutas viejas (por links hardcodeados en componentes) ────
const legacyRedirects = [
  { path: '/cart',                    redirect: '/' },
  { path: '/checkout',                redirect: '/' },
  { path: '/checkout/resultado',      redirect: '/' },
  { path: '/mi-cuenta/pedidos',       redirect: '/' },
  { path: '/mi-cuenta/pedidos/:id',   redirect: '/' },
  { path: '/mi-cuenta/direcciones',   redirect: '/' },
  { path: '/categoria/:slug',         redirect: '/' },
  { path: '/producto/:slug',          redirect: '/' },
]

// ─── Grupo 2: Dashboard del vendedor (auth + rol seller, sin tenant) ──────────
const dashboardRoutes = [
  {
    path: '/dashboard',
    alias: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminView.vue'),
    meta: { requiresAuth: true, requiresRole: 'seller' as const },
  },
  {
    path: '/dashboard/productos',
    alias: '/admin/productos',
    name: 'admin-products',
    component: () => import('@/views/admin/AdminProductsView.vue'),
    meta: { requiresAuth: true, requiresRole: 'seller' as const },
  },
  {
    path: '/dashboard/productos/nuevo',
    alias: '/admin/productos/nuevo',
    name: 'admin-product-new',
    component: () => import('@/views/admin/AdminProductFormView.vue'),
    meta: { requiresAuth: true, requiresRole: 'seller' as const },
  },
  {
    path: '/dashboard/productos/:id/editar',
    alias: '/admin/productos/:id/editar',
    name: 'admin-product-edit',
    component: () => import('@/views/admin/AdminProductFormView.vue'),
    meta: { requiresAuth: true, requiresRole: 'seller' as const },
  },
  {
    path: '/dashboard/pedidos',
    alias: '/admin/pedidos',
    name: 'admin-orders',
    component: () => import('@/views/admin/AdminOrdersView.vue'),
    meta: { requiresAuth: true, requiresRole: 'seller' as const },
  },
  {
    path: '/dashboard/pedidos/:id',
    alias: '/admin/pedidos/:id',
    name: 'admin-order-detail',
    component: () => import('@/views/admin/AdminOrderDetailView.vue'),
    meta: { requiresAuth: true, requiresRole: 'seller' as const },
  },
  {
    path: '/dashboard/configuracion',
    alias: '/admin/configuracion',
    name: 'admin-config',
    component: () => import('@/views/admin/AdminConfigView.vue'),
    meta: { requiresAuth: true, requiresRole: 'seller' as const },
  },
]

// ─── Grupo 3: Tienda pública del comprador (requiere resolución de tenant) ────
const storeRoutes = [
  {
    path: '/:slug',
    name: 'store-home',
    component: () => import('@/views/shop/CatalogView.vue'),
    meta: { requiresTenant: true },
  },
  {
    path: '/:slug/producto/:id',
    name: 'store-product',
    component: () => import('@/views/shop/ProductDetailView.vue'),
    meta: { requiresTenant: true },
  },
  {
    path: '/:slug/carrito',
    name: 'store-cart',
    component: () => import('@/views/shop/CartView.vue'),
    meta: { requiresTenant: true },
  },
  {
    path: '/:slug/checkout',
    name: 'store-checkout',
    component: () => import('@/views/shop/CheckoutView.vue'),
    meta: { requiresTenant: true, requiresAuth: true },
  },
  {
    path: '/:slug/resultado',
    name: 'store-checkout-result',
    component: () => import('@/views/shop/CheckoutResultView.vue'),
    meta: { requiresTenant: true },
  },
  {
    path: '/:slug/mis-pedidos',
    name: 'store-my-orders',
    component: () => import('@/views/shop/MyOrdersView.vue'),
    meta: { requiresTenant: true, requiresAuth: true },
  },
  {
    path: '/:slug/mis-pedidos/:id',
    name: 'store-order-detail',
    component: () => import('@/views/shop/OrderDetailView.vue'),
    meta: { requiresTenant: true, requiresAuth: true },
  },
]

// ─── Catch-all ────────────────────────────────────────────────────────────────
const fallbackRoutes = [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'not-found' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...platformRoutes,
    ...onboardingRoutes,
    ...dashboardRoutes,
    ...storeRoutes,
    ...legacyRedirects,
    ...fallbackRoutes,
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // ─── Resolución de tenant ────────────────────────────────────────────────────
  if (to.meta.requiresTenant) {
    const tenantStore = useTenantStore()
    const slug = to.params.slug as string

    if (!tenantStore.isLoaded || tenantStore.slug !== slug) {
      await tenantStore.loadTenant(slug)
    }

    if (!tenantStore.isLoaded) {
      return { name: 'not-found' }
    }
  }

  // ─── Guard de autenticación ──────────────────────────────────────────────────
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // ─── Guard de rol ────────────────────────────────────────────────────────────
  if (to.meta.requiresRole && authStore.role !== to.meta.requiresRole) {
    return { name: 'not-found' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
