# Changelog

Todos los cambios relevantes de este proyecto están documentados acá.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [Unreleased] — develop

### Fase 1 — Fundación del frontend ✅

#### Added
- **Vue Router** con todas las rutas del e-commerce, lazy loading y navigation guards (`requiresAuth`, `guestOnly`) — issue #4
- **Pinia** con 5 stores base: `authStore`, `cartStore` (persist), `catalogStore`, `checkoutStore`, `uiStore` — issue #4
- **Alias `@`** configurado en `vite.config.js` — issue #4
- **AppHeader** sticky: logo, nav de categorías, dropdown de usuario reactivo al estado de auth, badge del carrito — issue #5
- **AppFooter** con links informativos (Términos, Privacidad, Cómo comprar, Contacto) — issue #5
- **App.vue** reescrito como shell con `RouterView` — issue #5
- **CatalogView**: grid responsivo 4/3/2/1 columnas, breadcrumb, toolbar con ordenamiento — issue #6
- **ProductCard**: imagen placeholder, badges (OFERTA/ÚLTIMOS/AGOTADO), precio tachado, add-to-cart — issue #6
- **CatalogSidebar**: filtros por categoría, rango de precio, stock; limpiar filtros — issue #6
- **mockProducts.js**: productos y categorías de ejemplo con estructura idéntica a la API real — issue #6
- **ProductDetailView**: galería, selector de variantes, precio dinámico, indicador de stock, qty, CTA — issue #7
- **VariantSelector**: deshabilita combinaciones sin stock según selecciones actuales — issue #7
- **ProductGallery**: imagen principal + miniaturas, placeholder SVG — issue #7

### Fase 2 — Autenticación ✅

#### Added
- **LoginView**: formulario email/contraseña, toggle ver/ocultar, soporte `?redirect=`, error inline — issue #8
- **RegisterView**: nombre, email, contraseña + confirmación, strength indicator animado — issue #8
- **authStore**: acciones `login()`, `register()`, `logout()` conectadas al `authService` — issue #8
- **api.js**: interceptor request (adjunta JWT), interceptor response (401 → limpia auth + redirige), `authService` — issue #8
- Guard `guestOnly` en router: usuario autenticado no puede acceder a `/login` ni `/registro` — issue #8
- Restauración de ruta post-login desde `sessionStorage` (edge case sesión expirada en checkout) — issue #8

#### Blocked
- Integración real con backend JWT → bloqueado por [Generic-Ecommerce#26](https://github.com/ledisalvo/Generic-Ecommerce/issues/26)

### Fase 3 — Catálogo y detalle conectados a API ✅

#### Added
- **catalogStore**: paginación server-side, caché por parámetros, soporte `USE_MOCK` flag — issue #9
- **CatalogView**: skeleton loading animado, error state con reintento, paginación con ellipsis, debounce 350ms en filtros — issue #9
- **catalogService**: `getProducts(params)` y `getCategories()` en `api.js` — issue #9
- **Decisión de arquitectura**: paginación server-side desde el inicio para soportar desde emprendedores hasta importadoras — issue #9
- **ProductDetailView**: skeleton loading, carga async, watch en slug para navegación entre productos — issue #10
- **AppToast**: sistema de toasts global via `Teleport`, `useToast` composable singleton, tipos success/error/info — issue #10
- Manejo de race condition en detalle: producto agotado entre carga y click del usuario — issue #10
- **CartView**: lista de items editables, imagen placeholder, subtotal por ítem, eliminar con animación — issue #11
- **Resumen del carrito**: subtotal, promociones auto-apply (nombre + monto), total — issue #11
- **cartStore**: optimistic updates con rollback, `promotions[]`, `loadCart()` para sync al login — issue #11
- **cartApiService**: `getCart`, `addItem`, `updateItem`, `removeItem` en `api.js` — issue #11
- Empty state del carrito con CTA al catálogo — issue #11

#### Blocked
- Activación de API real del catálogo → bloqueado por [Generic-Ecommerce#28](https://github.com/ledisalvo/Generic-Ecommerce/issues/28)
- Activación de API real del carrito → bloqueado por endpoint `/cart` pendiente en backend

### Fase 4 — Checkout y pagos ✅ (parcial)

#### Added
- **checkoutStore**: máquina de estados de 5 pasos, `saveToSession`/`restoreFromSession` para sesión interrumpida — issue #12
- **CheckoutStepper**: indicador de progreso con pasos completados clickeables — issue #12
- **StepCart** (paso 1): revisión de carrito de solo lectura con link a edición — issue #12
- **StepShipping** (paso 2): direcciones guardadas, formulario nueva dirección con validación, opciones de envío con mock (estándar/express/retiro), edge case zona sin cobertura — issue #12
- **StepBilling** (paso 3): toggle "Necesito factura" con animación slide, campos CUIT + razón social — issue #12
- **StepNotes** (paso 4): textarea opcional con contador 500 chars — issue #12
- **StepReview** (paso 5): resumen completo con botones editar por sección, totales con envío, CTA "Ir a pagar" — issue #12
- **CheckoutView**: contenedor principal, orquesta los 5 pasos, guarda estado en store, redirige a MercadoPago al pagar — issue #12
- **checkoutService**: `getAddresses`, `getShippingOptions`, `createOrder` en `api.js` — issue #12

#### Blocked
- Activación de API real del checkout → bloqueado por [Generic-Ecommerce#27](https://github.com/ledisalvo/Generic-Ecommerce/issues/27) (MercadoPago)

---

## Planificado

### Fase 4 — Checkout y pagos (continuación)

- [ ] **MercadoPago Checkout Pro** + pantalla de resultado (approved/pending/failure) — issue #13
- [ ] Activación de carrito backend → bloqueado por [Generic-Ecommerce#27](https://github.com/ledisalvo/Generic-Ecommerce/issues/27) (MP)

### Fase 5 — Mi cuenta

- [ ] **Historial de pedidos** y detalle — issue #14
- [ ] **Gestión de direcciones** — issue #15

### Fase 6 — Backoffice

- [ ] **CRUD de productos** con variantes e imágenes (Cloudinary) — issue #16
- [ ] **Gestión de pedidos** y cambio de estado — issue #17
- [ ] **Categorías, promociones** y configuración de envío — issue #18

---

## Backend — Generic-Ecommerce (pendiente)

| Issue | Descripción | Prioridad |
|-------|-------------|-----------|
| [#2](https://github.com/ledisalvo/Generic-Ecommerce/issues/2) | Migrar DB InMemory a SQL Server/PostgreSQL | 🔴 Crítico |
| [#26](https://github.com/ledisalvo/Generic-Ecommerce/issues/26) | Implementar autenticación JWT completa | 🔴 Crítico |
| [#28](https://github.com/ledisalvo/Generic-Ecommerce/issues/28) | Paginación y filtros server-side en productos/categorías | 🟡 Importante |
| [#27](https://github.com/ledisalvo/Generic-Ecommerce/issues/27) | Integración MercadoPago Checkout Pro | 🟡 Importante |
