# SDD de Producto — Puestito
**Versión:** 0.1 (borrador inicial)
**Fecha:** Abril 2026
**Autor:** Leo Di Salvo

---

## 1. Visión

**Puestito** es una plataforma multi-tenant que permite a cualquier persona crear su tienda online en minutos, sin conocimientos técnicos, y comenzar a vender de inmediato.

El diferencial frente a competidores como Tienda Nube o Shopify es la **fricción cero en el onboarding**: el vendedor no necesita configurar nada para tener su tienda operativa. Carga sus productos, comparte el link, y listo.

> "Armá tu puestito y empezá a vender hoy."

---

## 2. Público objetivo

### Vendedor (tenant)
- Emprendedor argentino sin perfil técnico
- Vende por WhatsApp o Instagram hoy, quiere dar el salto a tener su propia tienda
- No quiere pagar nada para arrancar
- Ejemplos: revendedora de ropa, pastelera, artesano, importador de nicho

### Comprador (cliente del tenant)
- Cualquier persona que recibe el link de una tienda Puestito
- No necesariamente sabe que está en Puestito — ve la tienda del vendedor
- Espera una experiencia de compra simple y confiable

---

## 3. Propuesta de valor

| Para el vendedor | Para el comprador |
|---|---|
| Tienda online en minutos | Experiencia de compra limpia y rápida |
| Sin costo para arrancar | Pago seguro |
| Link propio: `puestito.app/mitienda` | Sin necesidad de registrarse |
| Gestión simple de productos y pedidos | Seguimiento básico de su compra |
| Cobros integrados desde el día 1 | — |

---

## 4. Modelo de planes

### Free (siempre gratis)
- Tienda activa con URL `puestito.app/{slug}`
- Productos ilimitados
- Carrito de compras
- Pasarela de pagos integrada (MercadoPago)
- Gestión de pedidos básica
- Panel de administración de la tienda

### Premium (pago mensual, precio a definir)
- Todo lo de Free +
- **Dominio propio** (`mitienda.com` apuntando a Puestito)
- **Estadísticas** de ventas, visitas, productos más vendidos
- **Exportación** de datos transaccionales (CSV/Excel)
- **Exportación** de base de clientes
- ⚠️ TODO: definir precio. Referencia: Tienda Nube cobra ~USD 10-20/mes en plan básico

---

## 5. Flujos principales

### 5.1 Onboarding del vendedor

```
Landing de Puestito
  → CTA "Creá tu puestito"
  → Registro (email + password) o Google OAuth
  → Paso 1: Nombre de la tienda → genera slug automático (editable)
  → Paso 2: Categoría principal (ropa, comida, electrónica, otro)
  → Paso 3: Logo/foto de portada (opcional, skipeable)
  → Paso 4: Conectar MercadoPago (OAuth MP)
  → ✅ Tienda lista → redirige al Dashboard del vendedor
```

El onboarding debe completarse en menos de 5 minutos. Cada paso es skipeable excepto nombre y MercadoPago.

⚠️ TODO: definir si MercadoPago es obligatorio en el onboarding o se puede conectar después (con la tienda en modo "sin pagos online" hasta conectarlo).

### 5.2 Gestión de la tienda (Dashboard vendedor)

```
Dashboard
  ├── Productos → ABM de productos (nombre, precio, foto, stock, categoría)
  ├── Pedidos → lista de pedidos con estado (pendiente, pagado, enviado, entregado)
  ├── Mi Tienda → editar nombre, logo, colores, descripción
  ├── Pagos → estado de la conexión con MercadoPago
  └── Plan → estado del plan actual, upgrade a Premium
```

### 5.3 Experiencia del comprador

```
URL: puestito.app/{slug}  (o dominio propio en Premium)
  → Portada de la tienda con productos
  → Filtro por categoría
  → Detalle de producto
  → Agregar al carrito
  → Checkout: nombre, email, dirección (si aplica envío)
  → Pago vía MercadoPago
  → Confirmación de compra → email al comprador y al vendedor
```

### 5.4 Dominio propio (Premium)

```
Vendedor activa plan Premium
  → Ingresa su dominio personalizado
  → Puestito le muestra el CNAME a configurar en su DNS
  → Una vez verificado → la tienda responde en el dominio propio
  → puestito.app/{slug} redirige al dominio propio (301)
```

---

## 6. Modelo de datos conceptual

### Tenant (Tienda)
```
Tenant
  - id
  - slug                  → "rk54chicks" (único, URL-safe)
  - name                  → "RK54 Chicks"
  - owner_id              → FK a User
  - plan                  → enum: free | premium
  - plan_expires_at       → nullable
  - logo_url
  - banner_url
  - primary_color
  - category              → enum: ropa | comida | electronica | servicios | otro
  - description
  - mp_access_token       → token OAuth de MercadoPago (encriptado)
  - custom_domain         → nullable (Premium)
  - custom_domain_verified → boolean
  - shipping_cost         → decimal (precio de envío fijo de la tienda, 0 = envío gratis)
  - shipping_notes        → nullable (texto libre: "Coordino envío por WhatsApp", etc.)
  - created_at
```

### User (Vendedor)
```
User
  - id
  - email
  - password_hash
  - name
  - created_at
```

### Product
```
Product
  - id
  - tenant_id
  - name
  - description
  - price                 → decimal (ARS)
  - stock                 → nullable (null = sin límite)
  - category
  - images                → array de URLs
  - active                → boolean
  - created_at
```

### Order
```
Order
  - id
  - tenant_id
  - buyer_name
  - buyer_email
  - buyer_phone
  - shipping_address      → calle, número, ciudad, provincia, CP
  - shipping_cost         → decimal (precio fijo definido por el vendedor)
  - shipping_notes        → nullable (instrucciones libres del vendedor)
  - status                → enum: pending | paid | shipped | delivered | cancelled
  - subtotal              → decimal
  - total                 → decimal (subtotal + shipping_cost)
  - mp_payment_id         → ID del pago en MercadoPago
  - created_at
```

### OrderItem
```
OrderItem
  - id
  - order_id
  - product_id
  - quantity
  - unit_price            → precio al momento de la compra (snapshot)
```

---

## 7. Arquitectura de tenancy

### Routing multi-tenant

El sistema resuelve el tenant por dos vías:

1. **Path-based (Free):** `puestito.app/{slug}` → extrae slug del path
2. **Custom domain (Premium):** `mitienda.com` → resuelve tenant por `custom_domain`

El backend recibe el request e identifica el tenant antes de cualquier lógica de negocio. Todos los datos están filtrados por `tenant_id`.

### Repos
- `puestito-api` → ASP.NET Core, Clean Architecture, REST API
- `puestito-web` → React + Vite + TypeScript + Tailwind + shadcn

### Separación de contextos en el front

```
puestito.app/              → Landing pública de Puestito (marketing)
puestito.app/auth          → Login / Registro de vendedores
puestito.app/dashboard     → Panel del vendedor (autenticado)
puestito.app/{slug}        → Tienda pública del comprador
{custom_domain}.com        → Tienda pública (Premium)
```

---

## 8. Integraciones externas

| Integración | Uso | Plan |
|---|---|---|
| MercadoPago OAuth | Pagos en la tienda del vendedor | Free + Premium |
| Resend / SendGrid | Emails transaccionales (confirmación de compra, etc.) | Free + Premium |
| Cloudflare / Vercel | Resolución de custom domains | Premium |

⚠️ TODO: definir proveedor de email transaccional (Resend es la opción natural dado el stack).

---

## 9. Roadmap

### MVP (lo que ya existe + completar)
- [x] Catálogo de productos con filtros
- [x] Carrito de compras
- [x] Pasarela de pagos (MercadoPago)
- [ ] Onboarding de vendedor (registro + configuración inicial)
- [ ] Dashboard del vendedor (ABM productos, gestión pedidos)
- [ ] Multi-tenancy por slug en la URL
- [ ] Landing pública de Puestito

### v2 (Premium)
- [ ] Plan Premium + billing
- [ ] Custom domain con verificación CNAME
- [ ] Estadísticas de ventas
- [ ] Exportación de datos

### v3 (post-tracción)
- [ ] Notificaciones push / WhatsApp al vendedor por nuevo pedido
- [ ] Integración con correos (OCA, Andreani)
- [ ] Múltiples medios de pago
- [ ] Tienda con variantes de producto (talle, color)

---

## 10. Decisiones técnicas

| Decisión | Resolución |
|---|---|
| MercadoPago en onboarding | ✅ Obligatorio — requisito para activar la tienda |
| Gestión de envíos MVP | ✅ Simple — vendedor define precio fijo, coordina con comprador por fuera |
| Moneda del plan Premium | ✅ ARS — precio fijo mensual, a definir valor |
| Base de datos | ✅ PostgreSQL — migración desde SQL Server |
| Hosting del back | ✅ Railway — back .NET + PostgreSQL en el mismo lugar (~USD 5/mes MVP) |
| Proveedor email transaccional | ✅ Resend |

---

*Este documento es la base del producto. El SDD Técnico (relevamiento del código existente y gap analysis) se genera por separado con Claude Code.*
