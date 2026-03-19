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
- Upload real de imágenes → pendiente integración Cloudinary (Generic-Ecommerce#1)
- API real de pedidos admin → pendiente endpoint `/admin/orders` en backend
- Activación de API real de config → pendientes endpoints `/admin/config` en backend

---

## Backend — Generic-Ecommerce (pendiente)

| Issue | Descripción | Prioridad |
|-------|-------------|-----------|
| [#2](https://github.com/ledisalvo/Generic-Ecommerce/issues/2) | Migrar DB InMemory a SQL Server/PostgreSQL | 🔴 Crítico |
| [#26](https://github.com/ledisalvo/Generic-Ecommerce/issues/26) | Implementar autenticación JWT completa | 🔴 Crítico |
| [#28](https://github.com/ledisalvo/Generic-Ecommerce/issues/28) | Paginación y filtros server-side en productos/categorías | 🟡 Importante |
| [#27](https://github.com/ledisalvo/Generic-Ecommerce/issues/27) | Integración MercadoPago Checkout Pro | 🟡 Importante |
