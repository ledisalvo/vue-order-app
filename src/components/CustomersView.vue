<template>
  <div>
    <div class="view-header">
      <h2>Clientes</h2>
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
        Nuevo Cliente
      </button>
    </div>

    <!-- Formulario -->
    <div v-if="showForm" class="card card-padding mb-6">
      <h3 class="form-title">Crear Nuevo Cliente</h3>
      <div class="form-container">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input
            v-model="formData.name"
            type="text"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Email *</label>
          <input
            v-model="formData.email"
            type="email"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Teléfono</label>
          <input v-model="formData.phoneNumber" type="tel" class="form-input" />
        </div>

        <div class="form-actions">
          <button @click="handleSubmit" class="btn btn-primary">
            Crear Cliente
          </button>
          <button @click="cancelForm" class="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de clientes -->
    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Pedidos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="customers.length === 0">
            <td colspan="4" class="table-empty">
              No hay clientes registrados. Crea uno nuevo para comenzar.
            </td>
          </tr>
          <tr v-for="customer in customers" :key="customer.id">
            <td class="font-medium">{{ customer.name }}</td>
            <td>{{ customer.email }}</td>
            <td>{{ customer.phoneNumber || '-' }}</td>
            <td>{{ customer.orders?.length || 0 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { customerService } from '../services/api';

const props = defineProps({
  customers: Array,
});

const emit = defineEmits(['customer-created', 'error']);

const showForm = ref(false);
const formData = ref({
  name: '',
  email: '',
  phoneNumber: '',
});

const handleSubmit = async () => {
  try {
    const newCustomer = await customerService.create(formData.value);

    emit('customer-created', newCustomer);
    cancelForm();
  } catch (err) {
    emit('error', 'Error al crear cliente');
  }
};

const cancelForm = () => {
  showForm.value = false;
  formData.value = { name: '', email: '', phoneNumber: '' };
};
</script>

<style scoped>
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.view-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.form-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.form-container {
  max-width: 600px;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.font-medium {
  font-weight: 500;
  color: #111827;
}
</style>
