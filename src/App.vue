<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="header-title">
            <svg
              class="icon-lg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h1>Sistema de Pedidos</h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="nav">
      <div class="container">
        <div class="nav-tabs">
          <button
            @click="activeView = 'customers'"
            :class="['nav-tab', { active: activeView === 'customers' }]"
          >
            <svg
              class="icon-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Clientes
          </button>
          <button
            @click="activeView = 'products'"
            :class="['nav-tab', { active: activeView === 'products' }]"
          >
            <svg
              class="icon-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            Productos
          </button>
          <button
            @click="activeView = 'orders'"
            :class="['nav-tab', { active: activeView === 'orders' }]"
          >
            <svg
              class="icon-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            Pedidos
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main">
      <div class="container">
        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error">
          <svg
            class="icon-sm"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- Views -->
        <CustomersView
          v-if="activeView === 'customers'"
          :customers="customers"
          @customer-created="handleCustomerCreated"
          @error="handleError"
        />

        <OrdersView
          v-if="activeView === 'orders'"
          :customers="customers"
          :products="products"
          :orders="orders"
          @order-created="handleOrderCreated"
          @status-updated="handleStatusUpdate"
          @error="handleError"
        />

        <ProductsView
          v-if="activeView === 'products'"
          :products="products"
          @product-created="handleProductCreated"
          @product-updated="handleProductUpdated"
          @product-deleted="handleProductDeleted"
          @error="handleError"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CustomersView from './components/CustomersView.vue';
import OrdersView from './components/OrdersView.vue';
import ProductsView from './components/ProductsView.vue';
import { productService, customerService } from './services/api';

const activeView = ref('customers');
const customers = ref([]);
const orders = ref([]);
const products = ref([]);
const error = ref(null);
const loading = ref(false);

onMounted(async () => {
  await loadInitialData();
});

const loadInitialData = async () => {
  loading.value = true;
  try {
    // Cargar productos
    await loadProducts();
    // Cargar clientes
    await loadCustomers();
  } catch (err) {
    error.value = 'Error al cargar datos iniciales';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadProducts = async () => {
  try {
    // ⭐ Cargar productos reales desde la API
    products.value = await productService.getAll();
    console.log('Productos cargados:', products.value);

    // Verificar que los IDs son strings
    if (products.value.length > 0) {
      console.log(
        'Tipo de ID del primer producto:',
        typeof products.value[0].id
      );
      console.log('Primer producto:', products.value[0]);
    }
  } catch (err) {
    console.error('Error cargando productos:', err);
  }
};

const loadCustomers = async () => {
  try {
    customers.value = await customerService.getCustomers();
    console.log('Clientes cargados:', customers.value); // Para debug
  } catch (err) {
    console.error('Error cargando clientes:', err);
    error.value = 'Error al cargar clientes';
  }
};

const handleCustomerCreated = async (customer) => {
  // Recargar la lista de clientes
  await loadCustomers();
  error.value = null;
};

const handleOrderCreated = (order) => {
  orders.value.push(order);
  error.value = null;
};

const handleStatusUpdate = ({ orderId, status }) => {
  const order = orders.value.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
  }
};

const handleProductCreated = (product) => {
  products.value.push(product);
  error.value = null;
};

const handleProductUpdated = (updatedProduct) => {
  const index = products.value.findIndex((p) => p.id === updatedProduct.id);
  if (index !== -1) {
    products.value[index] = updatedProduct;
  }
  error.value = null;
};

const handleProductDeleted = (productId) => {
  products.value = products.value.filter((p) => p.id !== productId);
  error.value = null;
};

const handleError = (errorMessage) => {
  error.value = errorMessage;
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  background: #f9fafb;
}

.app {
  min-height: 100vh;
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header */
.header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.header-content {
  padding: 1rem 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.icon-lg {
  width: 2rem;
  height: 2rem;
  color: #2563eb;
}

.icon-sm {
  width: 1rem;
  height: 1rem;
}

/* Navigation */
.nav {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.nav-tabs {
  display: flex;
  gap: 2rem;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-tab:hover {
  color: #374151;
  border-bottom-color: #d1d5db;
}

.nav-tab.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
}

/* Main */
.main {
  padding: 2rem 0;
}

/* Alert */
.alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Card */
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.card-padding {
  padding: 1.5rem;
}

/* Form */
.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table th {
  padding: 0.75rem 1.5rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table tbody tr {
  border-bottom: 1px solid #e5e7eb;
}

.table tbody tr:hover {
  background: #f9fafb;
}

.table td {
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.table-empty {
  padding: 2rem 1.5rem;
  text-align: center;
  color: #6b7280;
}

/* Badge */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.badge-paid {
  background: #dbeafe;
  color: #1e40af;
}

.badge-shipped {
  background: #e9d5ff;
  color: #6b21a8;
}

.badge-delivered {
  background: #d1fae5;
  color: #065f46;
}

.badge-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.alert-warning {
  background: #fef3c7;
  border: 1px solid #fde68a;
  color: #92400e;
}

.text-muted {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>
