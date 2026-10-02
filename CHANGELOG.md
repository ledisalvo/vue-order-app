# Changelog

Todos los cambios relevantes de este proyecto están documentados acá.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## ⚠️ Nota de realineación de scope (Agosto 2026)

Este changelog quedó desactualizado respecto al backend real (`puestito-api`, antes
`Generic-Ecommerce`). Mientras este front seguía planeando contra el repo viejo, el back
recortó scope (Plan 01-02, GAP-ANALYSIS) y **eliminó MercadoPago, custom domain y planes
Free/Premium por completo** — no los pospuso, los sacó del código. Ver
`puestito-api/docs/puestito-sdd-producto.md` sección 0 y 11 para el detalle.

Impacto directo en este front:

- **"MercadoPago Checkout Pro" (Fase 4, más abajo) queda cancelado, no bloqueado.** No hay
  backend contra el cual construirlo. El checkout real del MVP es pago manual (`Cash`),
  coordinado por fuera de la plataforma — igual que ya hace `StepShipping` con las zonas
  sin cobertura, pero para el pago entero.
- Los issues `Generic-Ecommerce#26/27/28` referenciados abajo pertenecen al repo viejo
  (renombrado a `puestito-api`) y **#26 (JWT) y #28 (paginación server-side) ya están
  resueltos** del lado del backend — no siguen bloqueados, lo que falta es conectar este
  front a la API real (sigue en `VITE_DEMO_MODE=true`).
- El backend expone hoy un modelo de **tienda pública por slug + checkout de invitado**
  (`GET/POST /api/public/{slug}/...`), sin cuenta de comprador — alineado con `StepCart`
  a `StepReview`, pero sin el paso de pago con MP al final.
- El commit `43db162` ("fase 2+3 — TypeScript migration, onboarding, multi-tenant routing")
  **ya está en `develop`** (verificado 2026-10-02). Construyó routing multi-tenant,
  onboarding y `tenantStore`, pero **contra el contrato anterior** del backend (incluye el
  paso de conectar MercadoPago y el endpoint `/tenants/by-domain`), así que todavía hay que
  realinearlo antes de conectar el checkout.
- **El backend descripto arriba ya está en `develop` de `puestito-api`** (la rama
  `fix/bugs-varios` fue mergeada; Fase 5, commit `d5b5649`, 14-ago-2026). `main` de ese repo
  queda atrás por decisión hasta el primer release.

Las secciones "Fase" de abajo no se reescriben — documentan lo que este front construyó y
siguen siendo ciertas. Lo que cambia es contra qué backend real hay que conectar cada
`Blocked`/`Planificado`: ver la nota en cada uno.

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
- ~~Integración real con backend JWT → bloqueado por [Generic-Ecommerce#26](https://github.com/ledisalvo/Generic-Ecommerce/issues/26)~~
  **Resuelto del lado del backend** (`puestito-api`, autenticación JWT completa). Falta conectar este front (sigue en `VITE_DEMO_MODE=true`).

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
- ~~Activación de API real del catálogo → bloqueado por [Generic-Ecommerce#28](https://github.com/ledisalvo/Generic-Ecommerce/issues/28)~~
  **Resuelto del lado del backend** — catálogo público con imágenes vía `GET /api/public/{slug}/products`. Falta conectar este front.
- Activación de API real del carrito → el backend del MVP no modela un carrito persistido en servidor (el checkout de invitado arma el pedido en un solo paso: `POST /api/public/{slug}/orders`). Revisar si `cartApiService` sigue teniendo sentido tal cual, o si el carrito debe quedar 100% client-side hasta el checkout.

### Fase 4 — Checkout y pagos ✅ (parcial)

#### Added
- **checkoutStore**: máquina de estados de 5 pasos, `saveToSession`/`restoreFromSession` para sesión interrumpida — issue #12
- **CheckoutStepper**: indicador de progreso con pasos completados clickeables — issue #12
- **StepCart** (paso 1): revisión de carrito de solo lectura con link a edición — issue #12
- **StepShipping** (paso 2): direcciones guardadas, formulario nueva dirección con validación, opciones de envío con mock (estándar/express/retiro), edge case zona sin cobertura — issue #12
- **StepBilling** (paso 3): toggle "Necesito factura" con animación slide, campos CUIT + razón social — issue #12
- **StepNotes** (paso 4): textarea opcional con contador 500 chars — issue #12
- **StepReview** (paso 5): resumen completo con botones editar por sección, totales con envío, CTA "Ir a pagar" — issue #12
- **CheckoutView**: contenedor principal, orquesta los 5 pasos, guarda estado en store, redirige a MercadoPago al pagar — issue #12 (⚠️ este último paso queda obsoleto, ver nota de realineación arriba)
- **checkoutService**: `getAddresses`, `getShippingOptions`, `createOrder` en `api.js` — issue #12

#### Blocked
- ~~Activación de API real del checkout → bloqueado por [Generic-Ecommerce#27](https://github.com/ledisalvo/Generic-Ecommerce/issues/27) (MercadoPago)~~
  **Ya no aplica** — no hay MercadoPago en el backend del MVP. El checkout real es
  `POST /api/public/{slug}/orders` (invitado, sin pago online); `StepReview` debe terminar
  en confirmación + comprobante, no en redirect a MP.

---

### Fase 6 — Backoffice dashboard ✅

#### Added
- **AdminView** `/admin`: métricas del día (pedidos, facturación, pendientes, stock agotado), alertas clicables, últimos 5 pedidos con estado, acceso rápido a todas las secciones — issue #33
- **adminDashboardService**: `getSummary()` en `api.js` con `USE_MOCK = true` — issue #33

#### Blocked
- Métricas reales → pendiente endpoint `/admin/dashboard` en backend

---

## Planificado

### Fase 4 — Checkout y pagos (continuación)

- [ ] ~~**MercadoPago Checkout Pro** + pantalla de resultado (approved/pending/failure) — issue #13~~
      **Cancelado** (Agosto 2026) — MercadoPago está fuera de scope del MVP en `puestito-api`
      (Plan 01-02). Queda diferido a un eventual plan Premium, ver
      `puestito-api/docs/puestito-sdd-producto.md` sección 11. No construir contra esto hasta
      que se reintroduzca explícitamente.
- [ ] Reemplazo: **pantalla de confirmación + comprobante** post-checkout — consumir
      `GET /api/public/{slug}/orders/{orderId}/summary` (HTML) del backend real en vez del
      flujo de resultado de MP.
- [ ] El trabajo de multi-tenant routing (`43db162`) **ya está en `develop`**. Falta
      realinearlo al contrato del MVP (sin paso de MercadoPago ni `/tenants/by-domain`)
      antes de conectar el checkout al backend real.

### Fase 5 — Mi cuenta ✅

#### Added
- **MyOrdersView** `/mi-cuenta/pedidos`: lista de pedidos con skeleton, empty state, badge de estado y thumbnail del primer producto — issue #14
- **OrderDetailView** `/mi-cuenta/pedidos/:id`: items con snapshot de variante, dirección de envío, facturación, notas, totales — issue #14
- **Timeline de estados**: Pendiente de pago → Confirmado → Enviado → Entregado con dots animados — issue #14
- **myOrdersService**: `getOrders()` y `getOrderById(id)` en `api.js` con mock completo (`USE_MOCK = true`) — issue #14
- **MyAddressesView** `/mi-cuenta/direcciones`: CRUD completo de direcciones con alias, nombre, calle, ciudad, provincia, CP y teléfono — issue #15
- Dirección predeterminada marcada visualmente y acción "Predeterminar" — issue #15
- Formulario inline con validación, transición slide y toggle "Establecer como predeterminada" — issue #15
- Confirmación de eliminación con overlay modal — issue #15
- Skeleton loading y empty state con CTA — issue #15
- **addressesService**: `getAll`, `create`, `update`, `remove`, `setDefault` en `api.js` con mock (`USE_MOCK = true`) — issue #15

#### Blocked
- Activación de API real de pedidos → pendiente endpoint `/my/orders` en backend
- Activación de API real de direcciones → pendiente endpoint `/my/addresses` en backend

### Fase 6 — Backoffice ✅

#### Added
- **AdminProductsView** `/admin/productos`: tabla con nombre, categoría, precio, stock (alertas bajo stock/agotado), estado; filtro por nombre y estado; acciones editar/activar-desactivar/eliminar — issue #16
- **AdminProductFormView** `/admin/productos/nuevo` y `/:id/editar`: formulario completo con datos básicos, slug auto-generado, imágenes con upload (mock Cloudinary), gestión de atributos con chips y generación automática de variantes por producto cartesiano — issue #16
- **Variantes**: tabla editable de combinaciones con SKU, precio override, stock y toggle activo/inactivo — issue #16
- **adminProductService** conectado al backend real; normalización de campos `isActive`/`stockQuantity` — issue #16
- **AdminOrdersView** `/admin/pedidos`: tabla con filtros por estado, nombre/# y rango de fechas; badges de estado de pedido y pago — issue #17
- **AdminOrderDetailView** `/admin/pedidos/:id`: detalle completo con items, snapshots de envío/facturación, totales, referencia de pago MP — issue #17
- **Cambio de estado** con transiciones definidas (pending → confirmed → shipped → delivered / cancelled desde cualquier estado); campo de número de seguimiento al pasar a "Enviado" — issue #17
- `adminOrderService`: `getAll`, `getById`, `updateStatus` en `api.js` con `USE_MOCK = true` — issue #17
- **AdminConfigView** `/admin/configuracion`: vista con 4 tabs — issue #18
  - **Categorías**: CRUD con nombre, slug auto-generado, orden y toggle activo/inactivo
  - **Promociones**: CRUD de promociones auto-apply (% o monto fijo), vigencia por fechas, monto mínimo de carrito, toggle activo
  - **Zonas de envío**: CRUD con selección de provincias por checkbox, costo base, costo/kg y umbral de envío gratis
  - **Punto de retiro**: formulario de configuración del local (nombre, dirección, horario, teléfono, notas, toggle habilitado)
- `adminConfigService` en `api.js` con todos los endpoints de categorías, promociones, zonas y puntos de retiro — issue #18

#### Blocked
- ~~Upload real de imágenes → pendiente integración Cloudinary (Generic-Ecommerce#1)~~
  **Resuelto del lado del backend** (`puestito-api`, storage intercambiable Cloudinary/local). Falta conectar este front.
- API real de pedidos admin → resuelto del lado del backend (`GET/PUT /api/orders/...`), falta conectar
- Activación de API real de config → resuelto del lado del backend (`PUT /api/tenants/me`, entrega/pago/punto de retiro — no incluye categorías/promociones/zonas de envío como estaba planeado acá, revisar si esas siguen en scope)

---

## Backend — `puestito-api` (estado real, Agosto 2026)

La tabla original de este changelog listaba pendientes del repo `Generic-Ecommerce` (nombre
viejo de `puestito-api`). Reemplazada por el estado real, para que este front deje de planear
contra issues resueltos o features que ya no existen:

| Ítem | Estado en `puestito-api` | Qué falta del lado de este front |
|---|---|---|
| DB PostgreSQL | ✅ Resuelto | — |
| Autenticación JWT | ✅ Resuelto | Conectar `authStore`/`api.js` a la API real (sacar `VITE_DEMO_MODE`) |
| Paginación/filtros server-side | ✅ Resuelto (`GET /api/public/{slug}/products`) | Conectar `catalogService` |
| Multi-tenancy por slug | ✅ Resuelto (`TenantResolutionMiddleware`) | `43db162` (multi-tenant routing) ya está en `develop`; realinearlo al contrato del MVP (quitar `/tenants/by-domain`) |
| Checkout de invitado | ✅ Resuelto (`POST /api/public/{slug}/orders`) | Conectar `checkoutService`, sacar el paso de MercadoPago |
| Dashboard de pedidos + comprobante | ✅ Resuelto (`GET /api/orders/{id}/summary`) | Conectar `adminOrderService`/`adminDashboardService` |
| Imágenes de producto (Cloudinary) | ✅ Resuelto | Conectar upload real en `AdminProductFormView` |
| **MercadoPago Checkout Pro** | ❌ **Retirado del scope del MVP**, no bloqueado | No construir — ver nota de realineación arriba |
| Custom domain | ❌ Retirado del scope del MVP | No aplica al MVP |
| Plan Premium / billing | ❌ Retirado del scope del MVP | No aplica al MVP |

> ✅ El backend de esta tabla está mergeado en `develop` de `puestito-api` (verificado
> 2026-10-02; la rama `fix/bugs-varios` fue mergeada). `main` de ese repo queda atrás por
> decisión hasta el primer release: para conectar este front, usar `develop` del API.
