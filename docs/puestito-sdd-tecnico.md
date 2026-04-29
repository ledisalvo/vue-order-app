# SDD Técnico — Puestito
**Versión:** 0.1 (basado en relevamiento 2026-04-26)
**Complementa:** `puestito-sdd-producto.md`

---

## 1. Stack tecnológico

| Capa | Tecnología | Estado |
|---|---|---|
| Frontend | Vue 3 + Vite + JavaScript + Pinia + Vue Router | ✅ Existe |
| Backend | ASP.NET Core 10 + Clean Architecture + CQRS (MediatR) | ✅ Existe |
| ORM | EF Core 10 | ✅ Existe |
| Base de datos | SQL Server → **migrar a PostgreSQL** | 🔄 Migrar |
| Auth | JWT Bearer + Refresh Token + BCrypt | ✅ Existe |
| Pagos | MercadoPago (redirect) | ⚠️ Parcial |
| Email | — | ❌ Falta (Resend) |
| Hosting back | — | ❌ Falta (Railway) |
| Hosting front | — | ❌ Falta (Vercel) |

---

## 2. Repositorios

| Repo | Contenido |
|---|---|
| `puestito-api` | ASP.NET Core REST API (renombrar desde `Generic-Ecommerce`) |
| `puestito-web` | Vue 3 frontend (renombrar desde `vue-order-app`) |

Deploy independiente: el front se deploya en Vercel, el back en Railway. CORS configurado por variables de entorno.

---

## 3. Arquitectura del back

Clean Architecture confirmada con 4 capas:

```
Domain          → Entidades, enums, errores, reglas de negocio puras
Application     → CQRS handlers (MediatR), validadores (FluentValidation), interfaces, DTOs
Infrastructure  → EF Core DbContext, repositorios, migraciones, TokenService
API             → Controllers, middleware, Program.cs
```

Test suite completa: unit tests en Domain y Application, integration tests con EF InMemory.

---

## 4. Arquitectura del front

```
views/
  shop/     → 10 vistas del comprador (catálogo, detalle, carrito, checkout, mis pedidos)
  admin/    → 6 vistas del vendedor (dashboard, productos, pedidos, configuración)
components/
  shop/     → Header, Footer, Toast, Sidebar, ProductCard, Gallery, VariantSelector
  checkout/ → Stepper + 5 pasos (Cart, Shipping, Billing, Notes, Review)
stores/     → auth, cart, catalog, checkout, ui, demoOrders (Pinia)
services/
  api.js    → Instancia axios + todos los servicios declarados
router/     → Vue Router con guards de auth
```

El front tiene **modo demo** (`VITE_DEMO_MODE=true`) que bypasea auth y usa mock data. Muy útil para desarrollo.

---

## 5. Estado actual vs. Puestito — Gap Analysis

### 5.1 Multi-tenancy

| Item | Estado actual | Qué hace falta |
|---|---|---|
| Entidad `Tenant` | ❌ No existe | Crear en Domain |
| `TenantId` en tablas | ❌ No existe en ninguna tabla | Agregar a Product, Order, Customer, User |
| Resolución de tenant por slug | ❌ No existe | Middleware en API que resuelve tenant por path `/{slug}/api` o header |
| Resolución por custom domain | ❌ No existe | Middleware que busca tenant por `Host` header (Premium) |
| Tenant store en front | ❌ No existe | Crear `tenantStore` en Pinia |
| Nombre "MiTienda" hardcodeado | ⚠️ `AppHeader.vue:8` | Leer del `tenantStore` |
| Categorías hardcodeadas | ⚠️ `AppHeader.vue:13-17` | Leer del API del tenant |

### 5.2 Onboarding del vendedor

| Item | Estado actual | Qué hace falta |
|---|---|---|
| Registro de vendedor | ✅ Existe (`/registro`) | Extender con datos de tienda (nombre, slug, categoría) |
| Flujo de onboarding paso a paso | ❌ No existe | Crear vista `OnboardingView.vue` con stepper |
| Conexión MercadoPago OAuth | ❌ No existe | OAuth MP en back + paso en onboarding |
| Generación automática de slug | ❌ No existe | Lógica en back (sanitizar nombre → slug único) |

### 5.3 MercadoPago

| Item | Estado actual | Qué hace falta |
|---|---|---|
| Redirect a MP en checkout | ✅ Existe (`window.location.href = initPoint`) | — |
| Creación de preferencia en back | ❌ No existe (no hay integración MP en API) | `MercadoPagoService` en Infrastructure |
| Webhook de confirmación de pago | ❌ No existe | `POST /webhooks/mercadopago` en API |
| Retorno desde MP al front | ⚠️ `/checkout/resultado` solo lee demo store | Leer resultado real desde query params de MP |
| OAuth del vendedor (multi-tenant) | ❌ No existe | OAuth MP por tenant con access token por tienda |

### 5.4 Dashboard del vendedor

| Item | Estado actual | Qué hace falta |
|---|---|---|
| ABM de productos | ✅ Existe (`/admin/productos`) | Agregar `TenantId` al contexto |
| Gestión de pedidos | ✅ Existe (`/admin/pedidos`) | Ídem |
| Dashboard con métricas | ⚠️ `USE_MOCK = true` hardcodeado | Conectar a endpoint real `/admin/dashboard` |
| Configuración de tienda | ⚠️ Existe pero gestiona categorías/promociones/envíos locales | Reorientar a config del tenant (nombre, logo, colores, envío) |
| Guard de rol vendedor | ❌ No existe (cualquier auth accede a `/admin/*`) | Agregar rol `Seller` y guard por rol en router y back |

### 5.5 Experiencia del comprador

| Item | Estado actual | Qué hace falta |
|---|---|---|
| Catálogo con filtros | ✅ Existe | Filtrar por tenant |
| Detalle de producto | ✅ Existe | Ídem |
| Carrito | ✅ Existe (dual-mode local/API) | Ídem |
| Checkout stepper 5 pasos | ✅ Existe | Conectar step de pago a MP real |
| Mis pedidos | ✅ Existe (UI) | Servicio `myOrdersService` marcado TODO fase-5 |
| Mis direcciones | ✅ Existe (UI) | Servicio `addressesService` marcado TODO fase-5 |
| Resolución de tienda por URL | ❌ No existe | Router lee slug de la URL y carga el tenant |

### 5.6 Base de datos

| Item | Estado actual | Qué hace falta |
|---|---|---|
| Provider | SQL Server | Migrar a PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`) |
| Migraciones existentes | 3 migraciones | Recrear desde cero contra PostgreSQL |
| Tabla `Tenant` | ❌ No existe | Nueva migración |
| `TenantId` en tablas existentes | ❌ No existe | Agregar a `Products`, `Orders`, `Customers`, `Users` |

### 5.7 Deuda técnica a resolver antes de arrancar

| # | Item | Dónde | Prioridad |
|---|---|---|---|
| 1 | `JwtBearer` pinneado a 8.0.11 en net10 | `Generic-Ecommerce.API.csproj` | 🔴 Alta |
| 2 | Credenciales hardcodeadas en `appsettings.Development.json` | Infrastructure | 🔴 Alta |
| 3 | `.env` trackeado por git (no en `.gitignore`) | `vue-order-app/` | 🔴 Alta |
| 4 | `Result<T>` duplicado en Application | `Application/Abstractions` vs `Application/Exceptions` | 🟡 Media |
| 5 | No hay guard de rol en el router | `router/index.js` | 🟡 Media |
| 6 | Interceptor axios lee localStorage directo en lugar del authStore | `services/api.js` | 🟡 Media |
| 7 | `USE_MOCK = true` hardcodeado en `AdminView.vue` | `views/admin/AdminView.vue` | 🟡 Media |
| 8 | Componentes huérfanos en `components/` | `CustomersView`, `OrdersView`, `ProductsView` | 🟢 Baja |
| 9 | `OrderItem` tabla en singular (inconsistente) | Migrations | 🟢 Baja (corregir en migración PostgreSQL) |
| 10 | No hay `.env.example` | `vue-order-app/` | 🟢 Baja |

---

## 6. Modelo de datos — estado objetivo

### Nuevo: `Tenants`
```
id                    uuid PK
slug                  varchar(60) UNIQUE NOT NULL   -- "rk54chicks"
name                  varchar(120) NOT NULL
owner_id              uuid FK → Users
plan                  varchar(20) NOT NULL           -- 'free' | 'premium'
plan_expires_at       timestamp NULL
logo_url              text NULL
banner_url            text NULL
primary_color         char(7) NULL                  -- "#FF5733"
category              varchar(40) NOT NULL
description           text NULL
mp_access_token       text NULL                     -- encriptado
custom_domain         varchar(255) NULL
custom_domain_verified boolean NOT NULL DEFAULT false
shipping_cost         decimal(10,2) NOT NULL DEFAULT 0
shipping_notes        text NULL
created_at            timestamp NOT NULL
```

### Modificaciones a tablas existentes
```
Products  → agregar tenant_id uuid FK → Tenants
Orders    → agregar tenant_id uuid FK → Tenants
           → agregar shipping_cost decimal(10,2)
           → agregar shipping_notes text NULL
           → agregar subtotal decimal(10,2)
Customers → agregar tenant_id uuid FK → Tenants
Users     → agregar role varchar(20) NOT NULL DEFAULT 'buyer'  -- 'buyer' | 'seller' | 'admin'
```

---

## 7. Routing multi-tenant

### Estrategia de URLs

```
puestito.app/                    → Landing marketing
puestito.app/auth/login          → Login vendedor
puestito.app/auth/registro       → Registro vendedor
puestito.app/onboarding          → Setup inicial post-registro
puestito.app/dashboard           → Panel del vendedor (auth + rol seller)
puestito.app/{slug}              → Tienda pública del comprador (free)
{custom_domain}                  → Tienda pública (premium, mismo front con tenant resuelto por Host)
```

### Resolución de tenant en el front

En `router/index.js`, antes del guard de auth:

```
1. ¿La ruta matchea /{slug}/*?
   → dispatch tenantStore.loadTenant(slug)
   → Si no existe → 404
2. ¿Es custom domain?
   → dispatch tenantStore.loadTenantByDomain(window.location.hostname)
```

### Resolución de tenant en el back

Middleware `TenantResolutionMiddleware`:
```
1. Lee slug de route prefix o header X-Tenant-Slug
2. Busca Tenant en DB
3. Inyecta ITenantContext en el DI container del request
4. Todos los repositorios filtran por TenantContext.TenantId automáticamente
```

---

## 8. Roles y autorización

| Rol | Descripción | Acceso |
|---|---|---|
| `buyer` | Comprador registrado | Checkout, mis pedidos, mis direcciones |
| `seller` | Dueño de una tienda | Dashboard, ABM productos, pedidos de su tienda |
| `admin` | Administrador de plataforma | Todo (gestión de tenants, planes, métricas globales) |

Guards en el front: `meta.requiresRole: 'seller'` en todas las rutas `/dashboard/*`.
Guards en el back: `[Authorize(Roles = "seller")]` en todos los controllers de admin.

---

## 9. Servicios nuevos a implementar en el back

| Servicio | Capa | Descripción |
|---|---|---|
| `TenantService` | Application | CRUD de tenants, generación de slug, validación de custom domain |
| `MercadoPagoService` | Infrastructure | Crear preferencia de pago, validar webhook, OAuth del vendedor |
| `EmailService` | Infrastructure | Envío via Resend: confirmación de compra, nueva venta al vendedor |
| `TenantResolutionMiddleware` | API | Resolución del tenant por slug o custom domain en cada request |
| `SlugGeneratorService` | Application | Genera slug URL-safe único desde el nombre de la tienda |

---

## 10. Roadmap técnico

### Fase 0 — Limpieza (antes de tocar features)
- [ ] Actualizar `JwtBearer` a versión compatible con net10
- [ ] Mover credenciales a user secrets / env vars
- [ ] Agregar `.env` al `.gitignore` del front, crear `.env.example`
- [ ] Eliminar componentes huérfanos del front
- [ ] Unificar `Result<T>` duplicado
- [ ] Renombrar solución y proyecto Vue al nombre `puestito`
- [ ] Migrar front de JavaScript a TypeScript (incremental: stores y services primero, luego vistas y componentes)

> **Decisión registrada:** front se mantiene en Vue 3 + TypeScript. Migración a React diferida a versiones futuras cuando el producto tenga tracción real.

### Fase 1 — Migración a PostgreSQL + Multi-tenancy base
- [ ] Swap SQL Server → PostgreSQL con Npgsql en el back
- [ ] Recrear migrations contra PostgreSQL
- [ ] Crear entidad `Tenant` y nueva migration
- [ ] Agregar `TenantId` a todas las tablas existentes
- [ ] Implementar `TenantResolutionMiddleware`
- [ ] Crear `tenantStore` en el front
- [ ] Implementar routing multi-tenant en Vue Router

### Fase 2 — Onboarding y roles
- [ ] Agregar rol `seller` / `buyer` al sistema de auth
- [ ] Guards de rol en front y back
- [ ] Flujo de onboarding del vendedor (registro + setup de tienda)
- [ ] Conexión MercadoPago OAuth por tenant

### Fase 3 — Conectar front con back real (sin demo mode)
- [ ] Conectar `catalogService` y `productDetailService` (marcados TODO fase-3)
- [ ] Conectar checkout real con MP
- [ ] Webhook de MercadoPago
- [ ] Retorno real desde MP a `/checkout/resultado`
- [ ] Conectar `myOrdersService` y `addressesService` (TODO fase-5)
- [ ] Conectar `adminDashboardService` y `adminOrderService` (TODO fase-6)

### Fase 4 — Email y notificaciones
- [ ] Integrar Resend
- [ ] Email de confirmación al comprador
- [ ] Email de nueva venta al vendedor

### Fase 2.5 — Documentación de API (post Fase 2, antes de Fase 3)
- [ ] Habilitar comentarios XML en todos los .csproj
- [ ] Configurar Swashbuckle para leer XML docs
- [ ] Documentar controllers con summary, remarks y response codes
- [ ] Documentar DTOs con descripción de campos
- [ ] Enums mostrados como valores seleccionables en Swagger UI (no string libre)
- [ ] Ejemplos de request/response en endpoints clave (onboarding, checkout)

### Fase 5 — Plan Premium
- [ ] Billing (a definir proveedor)
- [ ] Custom domain + verificación CNAME
- [ ] Estadísticas
- [ ] Exportación de datos

---

*El SDD de Producto (`puestito-sdd-producto.md`) define el qué. Este documento define el cómo y el estado de partida.*
