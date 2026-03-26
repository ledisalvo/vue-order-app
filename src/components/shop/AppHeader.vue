<template>
  <header class="header">
    <div class="header-inner container">

      <!-- Logo -->
      <RouterLink to="/" class="logo">
        <span class="logo-icon">🛒</span>
        <span class="logo-name">MiTienda</span>
      </RouterLink>

      <!-- Nav categorías (desktop) -->
      <nav class="cat-nav" aria-label="Categorías">
        <RouterLink to="/categoria/ropa" class="cat-link">Ropa</RouterLink>
        <RouterLink to="/categoria/calzado" class="cat-link">Calzado</RouterLink>
        <RouterLink to="/categoria/accesorios" class="cat-link">Accesorios</RouterLink>
        <RouterLink to="/categoria/hogar" class="cat-link">Hogar</RouterLink>
        <RouterLink to="/categoria/electronica" class="cat-link">Electrónica</RouterLink>
      </nav>

      <!-- Acciones derecha -->
      <div class="header-actions">

        <!-- Buscador (placeholder MVP) -->
        <button class="action-btn" aria-label="Buscar" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        <!-- Usuario -->
        <div class="user-menu" ref="userMenuRef">
          <button class="action-btn" aria-label="Mi cuenta" @click="toggleUserMenu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          <div v-if="userMenuOpen" class="dropdown">
            <template v-if="authStore.isAuthenticated">
              <RouterLink to="/mi-cuenta/pedidos" class="dropdown-item" @click="userMenuOpen = false">Mis pedidos</RouterLink>
              <RouterLink to="/mi-cuenta/direcciones" class="dropdown-item" @click="userMenuOpen = false">Mis direcciones</RouterLink>
              <hr class="dropdown-divider" />
              <button class="dropdown-item dropdown-item--danger" @click="logout">Cerrar sesión</button>
            </template>
            <template v-else>
              <RouterLink to="/login" class="dropdown-item" @click="userMenuOpen = false">Ingresar</RouterLink>
              <RouterLink to="/registro" class="dropdown-item" @click="userMenuOpen = false">Registrarse</RouterLink>
            </template>
          </div>
        </div>

        <!-- Carrito -->
        <RouterLink to="/cart" class="action-btn cart-btn" aria-label="Carrito">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span v-if="cartStore.totalItems > 0" class="cart-badge">{{ cartStore.totalItems }}</span>
        </RouterLink>

        <!-- Hamburguesa (mobile) -->
        <button class="action-btn mobile-menu-btn" aria-label="Menú" @click="uiStore.toggleMobileMenu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="uiStore.mobileMenuOpen" class="mobile-menu container">
      <RouterLink to="/categoria/ropa" class="mobile-link" @click="uiStore.toggleMobileMenu">Ropa</RouterLink>
      <RouterLink to="/categoria/calzado" class="mobile-link" @click="uiStore.toggleMobileMenu">Calzado</RouterLink>
      <RouterLink to="/categoria/accesorios" class="mobile-link" @click="uiStore.toggleMobileMenu">Accesorios</RouterLink>
      <RouterLink to="/categoria/hogar" class="mobile-link" @click="uiStore.toggleMobileMenu">Hogar</RouterLink>
      <RouterLink to="/categoria/electronica" class="mobile-link" @click="uiStore.toggleMobileMenu">Electrónica</RouterLink>
      <hr class="mobile-divider" />
      <template v-if="authStore.isAuthenticated">
        <RouterLink to="/mi-cuenta/pedidos" class="mobile-link" @click="uiStore.toggleMobileMenu">Mis pedidos</RouterLink>
        <RouterLink to="/mi-cuenta/direcciones" class="mobile-link" @click="uiStore.toggleMobileMenu">Mis direcciones</RouterLink>
        <button class="mobile-link mobile-link--danger" @click="logout">Cerrar sesión</button>
      </template>
      <template v-else>
        <RouterLink to="/login" class="mobile-link" @click="uiStore.toggleMobileMenu">Ingresar</RouterLink>
        <RouterLink to="/registro" class="mobile-link" @click="uiStore.toggleMobileMenu">Registrarse</RouterLink>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'

const authStore = useAuthStore()
const cartStore = useCartStore()
const uiStore = useUiStore()
const router = useRouter()

const userMenuOpen = ref(false)
const userMenuRef = ref(null)

onClickOutside(userMenuRef, () => { userMenuOpen.value = false })

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function logout() {
  authStore.clearAuth()
  userMenuOpen.value = false
  router.push('/')
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 64px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: .5rem;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-icon { font-size: 1.4rem; }
.logo-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
}

/* Category nav */
.cat-nav {
  display: flex;
  gap: 1.5rem;
  flex: 1;
}
.cat-link {
  font-size: .875rem;
  font-weight: 500;
  color: #374151;
  text-decoration: none;
  white-space: nowrap;
  transition: color .15s;
}
.cat-link:hover,
.cat-link.router-link-active { color: #2563eb; }

/* Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: .25rem;
  flex-shrink: 0;
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: .5rem;
  color: #374151;
  cursor: pointer;
  text-decoration: none;
  transition: background .15s, color .15s;
}
.action-btn:hover { background: #f3f4f6; color: #111827; }
.action-btn:disabled { opacity: .4; cursor: default; }
.action-btn svg { width: 20px; height: 20px; }

/* Cart badge */
.cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: #2563eb;
  color: #fff;
  font-size: .65rem;
  font-weight: 700;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* User dropdown */
.user-menu { position: relative; }
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  box-shadow: 0 4px 16px rgba(0,0,0,.1);
  padding: .25rem 0;
  z-index: 200;
}
.dropdown-item {
  display: block;
  width: 100%;
  padding: .6rem 1rem;
  font-size: .875rem;
  color: #374151;
  text-decoration: none;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background .1s;
}
.dropdown-item:hover { background: #f3f4f6; }
.dropdown-item--danger { color: #dc2626; }
.dropdown-item--danger:hover { background: #fef2f2; }
.dropdown-divider { border: none; border-top: 1px solid #e5e7eb; margin: .25rem 0; }

/* Mobile */
.mobile-menu-btn { display: none; }
.mobile-menu {
  padding: .75rem 0 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}
.mobile-link {
  display: block;
  padding: .65rem .5rem;
  font-size: .95rem;
  color: #374151;
  text-decoration: none;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: color .15s;
}
.mobile-link:hover { color: #2563eb; }
.mobile-link--danger { color: #dc2626; }
.mobile-divider { border: none; border-top: 1px solid #e5e7eb; margin: .5rem 0; }

@media (max-width: 768px) {
  .cat-nav { display: none; }
  .mobile-menu-btn { display: flex; }
}
</style>
