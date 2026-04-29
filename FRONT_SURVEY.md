# FRONT_SURVEY.md — Relevamiento técnico del frontend

> Generado el 2026-04-26. Solo documenta lo encontrado — sin sugerencias de mejora.

---

## ⚠️ Aclaración de stack

El prompt de solicitud menciona "React/Vite/TypeScript". El proyecto es en realidad **Vue 3 + Vite + JavaScript (sin TypeScript)**. Todo lo que sigue refleja la realidad del código.

---

## 1. Project structure

```
vue-order-app/
├── public/            # Assets estáticos (vite.svg)
├── src/
│   ├── App.vue        # Shell: AppHeader + RouterView + AppFooter + AppToast
│   ├── main.js        # Punto de entrada; registra Vue app, Pinia, Router
│   ├── style.css      # Reset global + .container utility
│   ├── assets/        # Assets del proyecto (vue.svg)
│   ├── components/
│   │   ├── admin/     # ⚠️ Directorio vacío (ningún componente dentro)
│   │   ├── checkout/  # Componentes del flujo de checkout (6 componentes)
│   │   ├── shop/      # Componentes compartidos de la tienda (5 componentes)
│   │   ├── CustomersView.vue  # ⚠️ Componente huérfano (ver §3)
│   │   ├── OrdersView.vue     # ⚠️ Componente huérfano (ver §3)
│   │   └── ProductsView.vue   # ⚠️ Componente huérfano (ver §3)
│   ├── composables/
│   │   └── useToast.js
│   ├── config/
│   │   └── index.js   # isDemoMode y apiBaseUrl desde env vars
│   ├── data/
│   │   └── mockProducts.js    # Datos mock para catálogo en demo mode
│   ├── router/
│   │   └── index.js
│   ├── services/
│   │   └── api.js     # Instancia axios + todos los servicios
│   ├── stores/        # Pinia stores (6 stores)
│   └── views/
│       ├── admin/     # 6 vistas del backoffice
│       └── shop/      # 10 vistas de la tienda
├── .env               # ⚠️ No ignorado por .gitignore (ver §9)
├── .env.production
├── index.html
├── package.json
└── vite.config.js
```

**Organización**: dominio + rol. `views/shop/` agrupa las vistas del comprador; `views/admin/` las del vendedor. `components/shop/` y `components/checkout/` son los únicos subdirectorios de componentes con contenido real.

**No hay TypeScript**: ningún archivo `.ts` o `.vue` con `<script lang="ts">`. No hay `tsconfig.json`.

---

## 2. Routing

Router: `vue-router` v5 en modo `createWebHistory`.

### Guard global (`src/router/index.js:117`)

```
beforeEach:
  isDemoMode → todas las rutas accesibles sin verificación
  meta.requiresAuth && !isAuthenticated → redirect /login?redirect=<fullPath>
  meta.guestOnly && isAuthenticated → redirect /
```

⚠️ No existe guard de rol (admin vs. buyer). Cualquier usuario autenticado puede acceder a `/admin/*`.

### Grupo: Storefront (comprador)

| Ruta | Nombre | Vista | Auth |
|------|--------|-------|------|
| `/` | `catalog` | `CatalogView` | — |
| `/categoria/:slug` | `category` | `CatalogView` | — |
| `/producto/:slug` | `product-detail` | `ProductDetailView` | — |
| `/cart` | `cart` | `CartView` | — |
| `/checkout` | `checkout` | `CheckoutView` | requiresAuth |
| `/checkout/resultado` | `checkout-result` | `CheckoutResultView` | requiresAuth |
| `/mi-cuenta/pedidos` | `my-orders` | `MyOrdersView` | requiresAuth |
| `/mi-cuenta/pedidos/:id` | `order-detail` | `OrderDetailView` | requiresAuth |
| `/mi-cuenta/direcciones` | `my-addresses` | `MyAddressesView` | requiresAuth |

### Grupo: Auth

| Ruta | Nombre | Vista | Auth |
|------|--------|-------|------|
| `/login` | `login` | `LoginView` | guestOnly |
| `/registro` | `register` | `RegisterView` | guestOnly |

### Grupo: Backoffice (admin)

| Ruta | Nombre | Vista | Auth |
|------|--------|-------|------|
| `/admin` | `admin` | `AdminView` | requiresAuth |
| `/admin/productos` | `admin-products` | `AdminProductsView` | requiresAuth |
| `/admin/productos/nuevo` | `admin-product-new` | `AdminProductFormView` | requiresAuth |
| `/admin/productos/:id/editar` | `admin-product-edit` | `AdminProductFormView` | requiresAuth |
| `/admin/pedidos` | `admin-orders` | `AdminOrdersView` | requiresAuth |
| `/admin/pedidos/:id` | `admin-order-detail` | `AdminOrderDetailView` | requiresAuth |
| `/admin/configuracion` | `admin-config` | `AdminConfigView` | requiresAuth |

**No hay grupo "landing"**. La raíz `/` va directo al catálogo.

---

## 3. Pages & components

### Vistas — Storefront

| Archivo | Ruta | Qué renderiza |
|---------|------|----------------|
| `views/shop/CatalogView.vue` | `/`, `/categoria/:slug` | Grid de productos con sidebar de filtros (categoría, precio, stock), paginación, sort client-side, skeleton loading |
| `views/shop/ProductDetailView.vue` | `/producto/:slug` | Detalle de producto: galería, selector de variantes, precio, botón "Agregar al carrito" |
| `views/shop/CartView.vue` | `/cart` | Lista de items del carrito, subtotales, botón ir a checkout |
| `views/shop/CheckoutView.vue` | `/checkout` | Orquestador del stepper de 5 pasos (1-Cart 2-Envío 3-Facturación 4-Notas 5-Revisión) |
| `views/shop/CheckoutResultView.vue` | `/checkout/resultado` | Confirmación de pedido con resumen de items, dirección, total y nota de demo |
| `views/shop/LoginView.vue` | `/login` | Formulario email + password con toggle de visibilidad y error global |
| `views/shop/RegisterView.vue` | `/registro` | Formulario nombre + email + password |
| `views/shop/MyOrdersView.vue` | `/mi-cuenta/pedidos` | Lista de pedidos del usuario con thumbnail, estado, fecha, total |
| `views/shop/OrderDetailView.vue` | `/mi-cuenta/pedidos/:id` | Detalle de un pedido del comprador |
| `views/shop/MyAddressesView.vue` | `/mi-cuenta/direcciones` | CRUD de direcciones del usuario con formulario inline |

### Vistas — Backoffice

| Archivo | Ruta | Qué renderiza |
|---------|------|----------------|
| `views/admin/AdminView.vue` | `/admin` | Dashboard con métricas (pedidos hoy, revenue, pendientes, stock), alertas, últimos pedidos, accesos rápidos. ⚠️ `USE_MOCK = true` hardcodeado independiente de `isDemoMode` |
| `views/admin/AdminProductsView.vue` | `/admin/productos` | Tabla de productos con toggle active/inactive, acciones editar/eliminar |
| `views/admin/AdminProductFormView.vue` | `/admin/productos/nuevo` y `/:id/editar` | Formulario de creación/edición de producto (mismo componente, detecta modo por `route.params.id`) |
| `views/admin/AdminOrdersView.vue` | `/admin/pedidos` | Lista de pedidos con filtros de estado, búsqueda, cambio de estado inline |
| `views/admin/AdminOrderDetailView.vue` | `/admin/pedidos/:id` | Detalle completo de pedido para admin: items, dirección, historial de estados, cambio de estado |
| `views/admin/AdminConfigView.vue` | `/admin/configuracion` | Tabs: Categorías / Promociones / Zonas de envío / Puntos de retiro — CRUD completo para cada entidad |

### Componentes compartidos significativos

| Archivo | Descripción |
|---------|-------------|
| `components/shop/AppHeader.vue` | Header global: logo "MiTienda" (hardcodeado), nav de categorías (hardcodeado), menú usuario (auth-aware), badge de carrito, hamburguesa mobile |
| `components/shop/AppFooter.vue` | Footer de la tienda |
| `components/shop/AppToast.vue` | Sistema de notificaciones toast global (consume `useToast`) |
| `components/shop/CatalogSidebar.vue` | Sidebar de filtros del catálogo (categoría, rango de precio, in-stock) |
| `components/shop/ProductCard.vue` | Tarjeta de producto para el grid del catálogo |
| `components/shop/ProductGallery.vue` | Galería de imágenes para el detalle de producto |
| `components/shop/VariantSelector.vue` | Selector de variantes (talle, color, etc.) en detalle de producto |
| `components/checkout/CheckoutStepper.vue` | Barra de progreso del checkout con navegación entre pasos |
| `components/checkout/StepCart.vue` | Paso 1: revisión del carrito dentro del checkout |
| `components/checkout/StepShipping.vue` | Paso 2: selección de dirección y opción de envío |
| `components/checkout/StepBilling.vue` | Paso 3: datos de facturación (ticket / factura CUIT) |
| `components/checkout/StepNotes.vue` | Paso 4: notas para el pedido |
| `components/checkout/StepReview.vue` | Paso 5: revisión final + botón "Confirmar y pagar" |

### ⚠️ Componentes huérfanos

`src/components/CustomersView.vue`, `src/components/OrdersView.vue`, `src/components/ProductsView.vue` son vistas de un backoffice anterior, en el directorio incorrecto (`components/` en lugar de `views/`). No están referenciadas por ninguna ruta ni importadas por ningún componente activo.

---

## 4. State management

**Pinia** (`pinia` v3 + `pinia-plugin-persistedstate` v4). Sin Vuex, sin React Query, sin Composition API stores externos.

| Store | Archivo | Persistencia | Descripción |
|-------|---------|-------------|-------------|
| `auth` | `stores/authStore.js` | localStorage (pinia-persistedstate) | `token`, `user`, `isAuthenticated`. Métodos: `login`, `register`, `logout`, `setAuth` |
| `cart` | `stores/cartStore.js` | localStorage (pinia-persistedstate) | Items, promociones, totales calculados. Dual-mode: en demo mode es completamente local; en prod sincroniza con API (optimistic updates + rollback) |
| `catalog` | `stores/catalogStore.js` | No persiste | Productos paginados, categorías, filtros activos, caché simple por key de parámetros |
| `checkout` | `stores/checkoutStore.js` | sessionStorage (manual, métodos `saveToSession`/`restoreFromSession`) | 5 pasos: dirección, opción de envío, facturación (CUIT), notas, resultado (orderId + initPoint MP) |
| `ui` | `stores/uiStore.js` | No persiste | `cartOpen`, `mobileMenuOpen`, `globalLoading` |
| `demoOrders` | `stores/demoOrdersStore.js` | localStorage (pinia-persistedstate) | Lista de pedidos creados en demo mode. Solo activo cuando `isDemoMode = true` |

**No existe** un tenant store ni un store de configuración de tienda.

---

## 5. API communication

### Instancia axios

`src/services/api.js` — instancia única de axios configurada con:

- `baseURL`: `VITE_API_BASE_URL` || `http://localhost:5141/api`
- Header `Content-Type: application/json`

### Request interceptor

Lee `localStorage.getItem('auth')`, parsea JSON `{ token }`, adjunta `Authorization: Bearer <token>`.  
⚠️ Lee localStorage directamente, no el Pinia authStore. Si el token cambia en el store sin escribir a localStorage, el interceptor usará un valor desactualizado.

### Response interceptor

Desenvuelve envelope `{ success: boolean, value: any, errors: string[] }`. Si `success = false`, lanza `Error` con el mensaje de errores. En 401: limpia `localStorage`, guarda redirect en `sessionStorage`, redirige a `/login`.

### Servicios declarados en `api.js`

| Export | Endpoints | Estado |
|--------|-----------|--------|
| `authService` | `POST /auth/login`, `POST /auth/register` | Conectado |
| `customerService` | `POST /customers`, `GET /customers/:id`, `GET /customers/:id/orders`, `GET /customers` | Conectado |
| `orderService` | `POST /orders`, `PUT /orders/:id/status` | Conectado |
| `productDetailService` | `GET /products/:slug` | ⚠️ TODO fase-3 |
| `checkoutService` | `GET /addresses`, `POST /shipping/options`, `POST /orders` | ⚠️ TODO fase-4 |
| `cartApiService` | `GET /cart`, `POST/PUT/DELETE /cart/items/:id` | ⚠️ TODO fase-4 |
| `catalogService` | `GET /products`, `GET /categories` | ⚠️ TODO fase-3 |
| `productService` | `GET /products`, `POST/PUT/DELETE /products/:id` | Conectado |
| `adminProductService` | `GET/POST/PUT/DELETE /products`, `POST /admin/images/upload` | Conectado (imagen: TODO cloudinary) |
| `addressesService` | `GET/POST/PUT/DELETE /my/addresses`, `PATCH /my/addresses/:id/default` | ⚠️ TODO fase-5 |
| `adminOrderService` | `GET /admin/orders`, `GET /admin/orders/:id`, `PUT /admin/orders/:id/status` | ⚠️ TODO fase-6 |
| `myOrdersService` | `GET /my/orders` | ⚠️ TODO fase-5 |
| `adminConfigService` | `GET/POST/PUT/DELETE /admin/categories`, `/admin/promotions`, `/admin/shipping-zones`, `/admin/pickup-points` | ⚠️ TODO fase-6 |
| `adminDashboardService` | `GET /admin/dashboard` | ⚠️ TODO fase-6 |

**No se usa React Query, ni SWR, ni Vue Query**. El fetching es manual en cada store o componente.

---

## 6. Auth

### UI

Sí. Existen `LoginView.vue` y `RegisterView.vue` con formularios completos (validación, loading, error global, toggle de contraseña).

### Almacenamiento del token

- Pinia `authStore` persiste `{ token, user }` en `localStorage` bajo la clave `auth` via `pinia-plugin-persistedstate`.
- El interceptor de axios lee `localStorage.getItem('auth')` y parsea el campo `token`.
- ⚠️ Doble fuente de verdad: el store y el localStorage directo en el interceptor.

### Envío del token

`Authorization: Bearer <token>` en cada request via interceptor de request.

### Logout / expiración

- Logout manual: `authStore.logout()` → limpia `token` y `user` en el store (y por ende en localStorage al persistir).
- Expiración (401 backend): el interceptor de response limpia `localStorage.removeItem('auth')` directamente (⚠️ no llama a `authStore.logout()`), guarda la ruta en `sessionStorage`, y redirige a `/login`.

---

## 7. Multi-tenancy

**El frontend es actualmente single-tenant y hardcodeado.**

- El nombre "MiTienda" está hardcodeado en `AppHeader.vue:8`.
- Las categorías de navegación están hardcodeadas en `AppHeader.vue:13-17` (`/categoria/ropa`, `/categoria/calzado`, etc.).
- No existe URL slug de tenant, no existe subdomain routing, no existe store de tenant.
- `apiBaseUrl` es una única URL sin prefijo de tenant.
- No hay ningún mecanismo de resolución de tenant en el router ni en `main.js`.

---

## 8. External integrations

### MercadoPago

Integración tipo **redirect** (sin SDK embebido):

1. `checkoutStore.paymentInitPoint` almacena la URL de MercadoPago retornada por el backend al crear la orden.
2. En `CheckoutView.handlePaid()` (`views/shop/CheckoutView.vue:91`):
   ```js
   if (isDemoMode || !initPoint) {
     router.push('/checkout/resultado')
   } else {
     window.location.href = initPoint  // redirect a MercadoPago
   }
   ```
3. No hay SDK de MercadoPago cargado en `index.html` ni en ningún componente.
4. No hay manejo de webhook ni de retorno desde MP en el frontend (⚠️ `/checkout/resultado` actualmente solo lee del `demoOrdersStore`).

### Otras integraciones

Ninguna. No hay Google Analytics, Hotjar, Sentry, Firebase, ni otros scripts de terceros en `index.html` o en los componentes.

---

## 9. Environment config

### Variables de entorno usadas en el código

| Variable | Referencia | Descripción |
|----------|-----------|-------------|
| `VITE_API_BASE_URL` | `src/config/index.js:2` | URL base de la API. Default: `http://localhost:5141/api` |
| `VITE_DEMO_MODE` | `src/config/index.js:1` | `"true"` activa el modo demo (mock data, sin auth guard, sin pagos reales) |

Ambas se centralizan en `src/config/index.js` y se importan desde ahí — ningún componente o store lee `import.meta.env` directamente.

### Archivos de entorno presentes

- `.env` — existe en el repositorio
- `.env.production` — existe en el repositorio
- ⚠️ `.gitignore` **no excluye `.env`** (solo excluye `*.local`). Los archivos `.env` y `.env.production` están siendo trackeados por git.

### .env.example

No existe ningún `.env.example`.
