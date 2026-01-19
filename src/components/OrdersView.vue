<template>
  <div>
    <div class="view-header">
      <h2>Pedidos</h2>
      <button @click="showForm = !showForm" class="btn btn-primary">
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Nuevo Pedido
      </button>
    </div>

    <!-- Formulario de pedido -->
    <div v-if="showForm" class="card card-padding mb-6">
      <h3 class="form-title">Crear Nuevo Pedido</h3>
      <!-- ⭐ Agregar mensaje de debug -->
      <div v-if="customers.length === 0" class="alert alert-warning mb-4">
        ⚠️ No hay clientes disponibles. Por favor, crea un cliente primero en la
        pestaña "Clientes".
      </div>
      <div class="form-container">
        <div class="form-group">
          <label class="form-label">Cliente *</label>
          <select v-model="selectedCustomer" required class="form-select">
            <option value="">Seleccionar cliente...</option>
            <option
              v-for="customer in customers"
              :key="customer.id"
              :value="customer.id"
            >
              {{ customer.name }} - {{ customer.email }}
            </option>
          </select>
          <!-- ⭐ Debug: mostrar el ID seleccionado -->
          <small v-if="selectedCustomer" class="text-muted">
            ID seleccionado: {{ selectedCustomer }}
          </small>
        </div>

        <div class="form-group">
          <div class="flex-between mb-2">
            <label class="form-label">Productos *</label>
            <button @click="addOrderItem" type="button" class="text-link">
              + Agregar producto
            </button>
          </div>

          <div
            v-for="(item, index) in orderItems"
            :key="index"
            class="order-item"
          >
            <select
              v-model="item.productId"
              @change="onProductChange(index, item.productId)"
              required
              class="form-select flex-1"
            >
              <option value="">Seleccionar producto...</option>
              <option
                v-for="product in products"
                :key="product.id"
                :value="product.id"
              >
                {{ product.name }} - ${{ product.price }} (Stock:
                {{ product.stockQuantity }})
              </option>
            </select>
            <!-- ⭐ Debug: mostrar el productId seleccionado -->
            <div v-if="item.productId" class="debug-info">
              ID: {{ item.productId }}
            </div>
            <input
              v-model.number="item.quantity"
              type="number"
              min="1"
              required
              placeholder="Cantidad"
              class="form-input quantity-input"
            />
            <button
              @click="removeOrderItem(index)"
              type="button"
              class="btn-remove"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button
            @click="handleSubmit"
            :disabled="orderItems.length === 0"
            class="btn btn-primary"
          >
            Crear Pedido
          </button>
          <button @click="cancelForm" class="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de pedidos -->
    <div class="orders-list">
      <div v-if="orders.length === 0" class="card card-padding empty-state">
        No hay pedidos registrados. Crea uno nuevo para comenzar.
      </div>

      <div
        v-for="order in orders"
        :key="order.id"
        class="card card-padding order-card"
      >
        <div class="order-header">
          <div>
            <h3 class="order-title">Pedido #{{ order.id.slice(0, 8) }}</h3>
            <p class="order-customer">
              Cliente: {{ getCustomerName(order.customerId) }}
            </p>
            <p class="order-date">{{ formatDate(order.createdAt) }}</p>
          </div>
          <div class="order-summary">
            <span :class="['badge', `badge-${order.status.toLowerCase()}`]">
              {{ order.status }}
            </span>
            <p class="order-total">${{ order.totalAmount.toFixed(2) }}</p>
          </div>
        </div>

        <div class="order-items">
          <h4 class="items-title">Productos:</h4>
          <ul class="items-list">
            <li v-for="item in order.orderItems" :key="item.id">
              {{ item.productName }} x {{ item.quantity }} - ${{
                (item.unitPrice * item.quantity).toFixed(2)
              }}
            </li>
          </ul>
        </div>

        <div v-if="canUpdateStatus(order.status)" class="order-actions">
          <button
            v-if="getNextStatus(order.status)"
            @click="updateStatus(order.id, getNextStatus(order.status))"
            class="btn btn-primary btn-sm"
          >
            Marcar como {{ getNextStatus(order.status) }}
          </button>
          <button
            @click="updateStatus(order.id, 'Cancelled')"
            class="btn btn-danger btn-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'; // ⭐ Agregar watch al import
import { orderService } from '../services/api';

const props = defineProps({
  customers: Array,
  products: Array,
  orders: Array,
});

watch(
  () => props.customers,
  (newCustomers) => {
    console.log('Clientes disponibles en OrdersView:', newCustomers);
  },
  { immediate: true }
);

const emit = defineEmits(['order-created', 'status-updated', 'error']);

// ⭐ Debug: observar productos
watch(
  () => props.products,
  (newProducts) => {
    console.log('Productos disponibles en OrdersView:', newProducts);
    if (newProducts.length > 0) {
      console.log('Ejemplo de producto:', newProducts[0]);
      console.log('Tipo de ID del primer producto:', typeof newProducts[0].id);
    }
  },
  { immediate: true }
);

// ⭐ Debug: observar cambios en customers
watch(
  () => props.customers,
  (newCustomers) => {
    console.log('Clientes disponibles en OrdersView:', newCustomers);
  },
  { immediate: true }
);

const showForm = ref(false);
const selectedCustomer = ref('');
const selectedProduct = ref('');
const orderItems = ref([]);

const statusFlow = ['Pending', 'Paid', 'Shipped', 'Delivered'];

const addOrderItem = () => {
  orderItems.value.push({ productId: '', quantity: 1 });
};

const removeOrderItem = (index) => {
  orderItems.value.splice(index, 1);
};

// ⭐ Función para debug cuando cambia el producto
const onProductChange = (index, productId) => {
  console.log(`Producto seleccionado en índice ${index}:`, productId);
  console.log('Tipo:', typeof productId);
  const product = props.products.find((p) => p.id === productId);
  console.log('Producto encontrado:', product);
};

const handleSubmit = async () => {
  try {
    console.log(orderItems.value);
    const total = orderItems.value.reduce((sum, item) => {
      const product = props.products.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const orderData = {
      customerId: selectedCustomer.value,
      items: orderItems.value,
    };
    const newOrder = await orderService.create(orderData);

    emit('order-created', newOrder);
    cancelForm();
  } catch (err) {
    emit('error', 'Error al crear pedido');
  }
};

const updateStatus = async (orderId, newStatus) => {
  try {
    await orderService.updateStatus(orderId, newStatus);

    emit('status-updated', { orderId, status: newStatus });
  } catch (err) {
    emit('error', 'Error al actualizar estado');
  }
};

const cancelForm = () => {
  showForm.value = false;
  selectedCustomer.value = '';
  orderItems.value = [];
};

const getCustomerName = (customerId) => {
  const customer = props.customers.find((c) => c.id === customerId);
  return customer?.name || 'Desconocido';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const canUpdateStatus = (status) => {
  return status !== 'Delivered' && status !== 'Cancelled';
};

const getNextStatus = (currentStatus) => {
  const currentIndex = statusFlow.indexOf(currentStatus);
  return statusFlow[currentIndex + 1] || null;
};
</script>

<style scoped>
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.text-link {
  color: #2563eb;
  font-weight: 500;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
}
.text-link:hover {
  color: #1d4ed8;
}
.order-item {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.flex-1 {
  flex: 1;
}
.quantity-input {
  width: 6rem;
}
.btn-remove {
  padding: 0.5rem;
  color: #dc2626;
  background: none;
  border: none;
  cursor: pointer;
}
.btn-remove:hover {
  color: #b91c1c;
}
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.order-card {
  background: white;
}
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}
.order-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}
.order-customer {
  font-size: 0.875rem;
  color: #4b5563;
}
.order-date {
  font-size: 0.875rem;
  color: #6b7280;
}
.order-summary {
  text-align: right;
}
.order-total {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-top: 0.5rem;
}
.order-items {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-bottom: 1rem;
}
.items-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}
.items-list {
  list-style: none;
}
.items-list li {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
}
.order-actions {
  display: flex;
  gap: 0.5rem;
}
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
.empty-state {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.mb-6 {
  margin-bottom: 1.5rem;
}
</style>
