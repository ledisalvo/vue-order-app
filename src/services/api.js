import axios from 'axios';

const API_BASE_URL = 'https://localhost:7274/api'; // Ajustar según tu configuración

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ⭐ Interceptor para asegurar que los GUIDs se mantengan como strings
api.interceptors.response.use(
  (response) => {
    console.log('Raw response data:', response.data);

    // Si la respuesta tiene la estructura { success, value, errors }
    if (response.data && response.data.hasOwnProperty('success')) {
      if (response.data.success) {
        response.data = response.data.value;
      } else {
        throw new Error(response.data.errors.join(', '));
      }
    }

    console.log('Processed response data:', response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error);
    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   (response) => {
//     // Si la respuesta tiene la estructura { success, value, errors }
//     if (response.data && response.data.hasOwnProperty('success')) {
//       // Si fue exitoso, devolver el value
//       if (response.data.success) {
//         response.data = response.data.value;
//       } else {
//         // Si falló, lanzar error con los mensajes
//         throw new Error(response.data.errors.join(', '));
//       }
//     }
//     return response;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export const customerService = {
  async create(customer) {
    const response = await api.post('/customers', customer);
    return response.data;
  },
  async getById(id) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  async getOrdersByCustomerId(customerId) {
    const response = await api.get(`/customers/${customerId}/orders`);
    return response.data;
  },
  async getCustomers() {
    const response = await api.get('/customers');
    return response.data;
  },
};

export const orderService = {
  async create(orderData) {
    // Verifica qué formato espera tu API
    console.log('Datos a enviar:', orderData);

    const response = await api.post('/orders', orderData);
    return response.data;
  },
  async updateStatus(orderId, status) {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

export const productService = {
  async getAll() {
    const response = await api.get('/products');
    return response.data;
  },
  async create(product) {
    const response = await api.post('/products', product);
    return response.data;
  },
  async update(id, product) {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },
  async delete(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default api;
