# 🛒 Sistema de Gestión de Pedidos

Sistema completo de gestión de pedidos para tienda online.

## 📋 Descripción

Aplicación full-stack que permite gestionar clientes, productos y pedidos de una tienda online. Este proyecto es una interfaz web moderna construida con Vue.js 3.

### Características Principales

- ✅ Gestión completa de **Clientes** (crear, listar, ver detalle)
- ✅ Gestión completa de **Productos** (CRUD completo con validaciones)
- ✅ Gestión de **Pedidos** (crear, actualizar estado, listar por cliente)
- ✅ Validación de stock antes de confirmar pedidos
- ✅ Flujo de estados de pedidos (Pending → Paid → Shipped → Delivered)
- ✅ Interfaz responsive y moderna
- ✅ Manejo de errores robusto

## 🏗️ Arquitectura

### Frontend (Vue.js 3)

- **Vue 3** con Composition API
- **Vite** como build tool
- **Axios** para comunicación con la API
- **CSS moderno** con diseño responsive
- **Componentes reutilizables** y bien estructurados

## 🚀 Tecnologías Utilizadas

### Frontend
- Vue.js 3
- Vite
- Axios
- JavaScript ES6+

## 📦 Estructura del Proyecto
```
vue-order-app/
│─── src/
│   │───├──components/          # Componentes Vue
│   │   │   ├── CustomersView.vue
│   │   │   ├── ProductsView.vue
│   │   │   └── OrdersView.vue
│   │   ├── services/            # Servicios API
│   │   │   └── api.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔧 Instalación y Configuración

### Prerrequisitos

- Node.js 16+ y npm
- Visual Studio Code / Visual Studio / Rider (recomendado)

1. **Clonar el repositorio**
```bash
git clone https://github.com/ledisalvo/vue-order-app.git
cd vue-order-app/
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la URL de la API**

En `src/services/api.js`, ajustar la URL base:
```javascript
const API_BASE_URL = 'https://localhost:7001/api';
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

5. **Build para producción**
```bash
npm run build
```

## 📚 API Endpoints

### Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/customers` | Crear nuevo cliente |
| GET | `/api/customers/{id}` | Obtener cliente por ID |
| GET | `/api/customers/{id}/orders` | Listar pedidos de un cliente |

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar todos los productos |
| POST | `/api/products` | Crear nuevo producto |
| PUT | `/api/products/{id}` | Actualizar producto |
| DELETE | `/api/products/{id}` | Eliminar producto |

### Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/orders` | Crear nuevo pedido |
| PUT | `/api/orders/{id}/status` | Actualizar estado del pedido |
| GET | `/api/orders/{id}` | Obtener pedido por ID |

## 🗃️ Modelo de Datos

### Customer (Cliente)
```csharp
{
  "id": "guid",
  "name": "string",
  "email": "string",
  "phoneNumber": "string"
}
```

### Product (Producto)
```csharp
{
  "id": "guid",
  "name": "string",
  "price": "decimal",
  "stockQuantity": "int"
}
```

### Order (Pedido)
```csharp
{
  "id": "guid",
  "customerId": "guid",
  "totalAmount": "decimal",
  "createdAt": "datetime",
  "status": "enum", // Pending, Paid, Shipped, Delivered, Cancelled
  "orderItems": []
}
```

### OrderItem (Item del Pedido)
```csharp
{
  "id": "guid",
  "orderId": "guid",
  "productId": "guid",
  "quantity": "int",
  "unitPrice": "decimal"
}
```

## 🎨 Capturas de Pantalla

### Gestión de Clientes
![Clientes](<img width="1678" height="643" alt="imagen" src="https://github.com/user-attachments/assets/90791fb9-275d-43a9-81e4-e8bc6058b77e" />)

### Gestión de Productos
![Productos](<img width="1735" height="560" alt="Productos" src="https://github.com/user-attachments/assets/56f743c7-a834-4628-b20a-dba682b46a8b" />)

### Gestión de Pedidos
![Pedidos](<img width="1671" height="790" alt="imagen" src="https://github.com/user-attachments/assets/a88cf5bb-f94a-44b1-9829-e8bfa749628f" />)

## 🔐 Consideraciones de Seguridad

- ✅ Validación de datos en backend y frontend
- ✅ CORS configurado correctamente
- ✅ Manejo seguro de errores
- ⚠️ JWT no implementado (pendiente para producción)
- ⚠️ HTTPS recomendado para producción

## 🚧 Mejoras Futuras

- [ ] Implementar autenticación con JWT
- [ ] Agregar paginación en listados
- [ ] Implementar búsqueda y filtros
- [ ] Agregar reportes y estadísticas
- [ ] Implementar notificaciones en tiempo real
- [ ] Dockerizar la aplicación completa
- [ ] Agregar caché con Redis
- [ ] Implementar CI/CD pipeline

## 👨‍💻 Desarrollador

**Tu Nombre**
- GitHub: [@ledisalvo](https://github.com/ledisalvo)
- LinkedIn: [Leonardo Di Salvo](https://linkedin.com/in/leonardo-di-salvo)
- Email: ledisalvo@gmail.com
---
