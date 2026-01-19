<template>
  <div>
    <div class="view-header">
      <h2>Productos</h2>
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
        Nuevo Producto
      </button>
    </div>

    <!-- Formulario de producto -->
    <div v-if="showForm" class="card card-padding mb-6">
      <h3 class="form-title">
        {{ editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto' }}
      </h3>
      <div class="form-container">
        <div class="form-group">
          <label class="form-label">Nombre *</label>
          <input
            v-model="formData.name"
            type="text"
            required
            class="form-input"
            placeholder="Ej: Laptop Dell XPS 15"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Precio *</label>
            <div class="input-with-prefix">
              <span class="input-prefix">$</span>
              <input
                v-model.number="formData.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="form-input with-prefix"
                placeholder="0.00"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Stock *</label>
            <input
              v-model.number="formData.stockQuantity"
              type="number"
              min="0"
              required
              class="form-input"
              placeholder="0"
            />
          </div>
        </div>

        <div class="form-actions">
          <button
            @click="handleSubmit"
            class="btn btn-primary"
            :disabled="submitting"
          >
            {{
              submitting
                ? 'Guardando...'
                : editingProduct
                ? 'Actualizar'
                : 'Crear Producto'
            }}
          </button>
          <button @click="cancelForm" class="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de productos -->
    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="products.length === 0">
            <td colspan="5" class="table-empty">
              No hay productos registrados. Crea uno nuevo para comenzar.
            </td>
          </tr>
          <tr v-for="product in products" :key="product.id">
            <td class="font-medium">{{ product.name }}</td>
            <td class="text-price">${{ formatPrice(product.price) }}</td>
            <td>
              <span :class="getStockClass(product.stockQuantity)">
                {{ product.stockQuantity }} unidades
              </span>
            </td>
            <td>
              <span :class="['badge', getStockBadge(product.stockQuantity)]">
                {{ getStockStatus(product.stockQuantity) }}
              </span>
            </td>
            <td class="text-right">
              <div class="action-buttons">
                <button
                  @click="editProduct(product)"
                  class="btn-icon"
                  title="Editar"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(product)"
                  class="btn-icon btn-icon-danger"
                  title="Eliminar"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Confirmar Eliminación</h3>
          <button @click="closeDeleteModal" class="btn-close">
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
        <div class="modal-body">
          <p>
            ¿Estás seguro de que deseas eliminar el producto
            <strong>{{ productToDelete?.name }}</strong
            >?
          </p>
          <p class="text-warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="handleDelete" class="btn btn-danger">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { productService } from '../services/api';

const props = defineProps({
  products: Array,
});

const emit = defineEmits([
  'product-created',
  'product-updated',
  'product-deleted',
  'error',
]);

const showForm = ref(false);
const editingProduct = ref(null);
const showDeleteModal = ref(false);
const productToDelete = ref(null);
const submitting = ref(false);

const formData = ref({
  name: '',
  price: 0,
  stockQuantity: 0,
});

const handleSubmit = async () => {
  if (submitting.value) return;

  submitting.value = true;
  try {
    if (editingProduct.value) {
      // Actualizar producto existente
      // const updated = await productService.update(editingProduct.value.id, formData.value);
      const updated = { ...editingProduct.value, ...formData.value };
      emit('product-updated', updated);
    } else {
      // Crear nuevo producto
      // const newProduct = await productService.create(formData.value);
      const newProduct = {
        id: Date.now().toString(),
        ...formData.value,
      };
      emit('product-created', newProduct);
    }
    cancelForm();
  } catch (err) {
    console.error('Error al guardar producto:', err);
    emit('error', err.message || 'Error al guardar producto');
  } finally {
    submitting.value = false;
  }
};

const editProduct = (product) => {
  editingProduct.value = product;
  formData.value = {
    name: product.name,
    price: product.price,
    stockQuantity: product.stockQuantity,
  };
  showForm.value = true;
};

const confirmDelete = (product) => {
  productToDelete.value = product;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  try {
    // await productService.delete(productToDelete.value.id);
    emit('product-deleted', productToDelete.value.id);
    closeDeleteModal();
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    emit('error', err.message || 'Error al eliminar producto');
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  productToDelete.value = null;
};

const cancelForm = () => {
  showForm.value = false;
  editingProduct.value = null;
  formData.value = { name: '', price: 0, stockQuantity: 0 };
};

const formatPrice = (price) => {
  return price.toFixed(2);
};

const getStockClass = (stock) => {
  if (stock === 0) return 'text-danger';
  if (stock < 10) return 'text-warning';
  return 'text-success';
};

const getStockBadge = (stock) => {
  if (stock === 0) return 'badge-cancelled';
  if (stock < 10) return 'badge-pending';
  return 'badge-delivered';
};

const getStockStatus = (stock) => {
  if (stock === 0) return 'Sin Stock';
  if (stock < 10) return 'Stock Bajo';
  return 'Disponible';
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-with-prefix {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  pointer-events: none;
}

.form-input.with-prefix {
  padding-left: 2rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.font-medium {
  font-weight: 500;
  color: #111827;
}

.text-price {
  font-weight: 600;
  color: #059669;
  font-size: 1rem;
}

.text-danger {
  color: #dc2626;
  font-weight: 500;
}

.text-warning {
  color: #d97706;
  font-weight: 500;
}

.text-success {
  color: #059669;
  font-weight: 500;
}

.text-right {
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.btn-icon-danger {
  color: #dc2626;
}

.btn-icon-danger:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #b91c1c;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  padding: 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin-bottom: 0.75rem;
  color: #374151;
}

.modal-body p:last-child {
  margin-bottom: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}
</style>
