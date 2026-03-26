<template>
  <div class="admin-page">
    <div class="admin-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Productos</h1>
          <p class="page-sub">{{ total }} productos en total</p>
        </div>
        <RouterLink to="/admin/productos/nuevo" class="btn-primary">+ Nuevo producto</RouterLink>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <input v-model="search" class="search-input" placeholder="Buscar por nombre…" />
        <select v-model="filterActive" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="table-wrap">
        <table class="products-table">
          <thead>
            <tr>
              <th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 5" :key="i" class="sk-row">
              <td><div class="sk-block sk-cell wide"></div></td>
              <td><div class="sk-block sk-cell mid"></div></td>
              <td><div class="sk-block sk-cell narrow"></div></td>
              <td><div class="sk-block sk-cell narrow"></div></td>
              <td><div class="sk-block sk-cell narrow"></div></td>
              <td><div class="sk-block sk-cell narrow"></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div v-else-if="!filtered.length" class="state-empty">
        <p v-if="search || filterActive !== ''">No hay productos que coincidan con la búsqueda.</p>
        <p v-else>No hay productos aún.</p>
        <RouterLink v-if="!search && filterActive === ''" to="/admin/productos/nuevo" class="btn-primary">Crear primer producto</RouterLink>
      </div>

      <!-- Table -->
      <div v-else class="table-wrap">
        <table class="products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id" :class="{ inactive: !p.active }">
              <td class="td-product">
                <div class="product-thumb">
                  <img v-if="p.images?.[0]" :src="p.images[0]" :alt="p.name" />
                  <div v-else class="thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg></div>
                </div>
                <div>
                  <p class="product-name">{{ p.name }}</p>
                  <p class="product-slug">{{ p.slug }}</p>
                </div>
              </td>
              <td class="td-cat">{{ p.category }}</td>
              <td class="td-price">{{ formatPrice(p.price) }}</td>
              <td class="td-stock">
                <span :class="{ 'low-stock': p.totalStock > 0 && p.totalStock <= 5, 'no-stock': p.totalStock === 0 }">
                  {{ p.totalStock }}
                </span>
              </td>
              <td class="td-status">
                <span class="status-pill" :class="p.active ? 'active' : 'inactive'">
                  {{ p.active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="td-actions">
                <RouterLink :to="`/admin/productos/${p.id}/editar`" class="action-btn">Editar</RouterLink>
                <button class="action-btn" @click="toggle(p)" :disabled="toggling === p.id">
                  {{ p.active ? 'Desactivar' : 'Activar' }}
                </button>
                <button class="action-btn danger" @click="confirmDelete(p)" :disabled="deleting === p.id">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Delete confirm -->
      <Transition name="fade">
        <div v-if="deleteTarget" class="overlay" @click.self="deleteTarget = null">
          <div class="confirm-dialog">
            <p class="confirm-title">¿Eliminar producto?</p>
            <p class="confirm-desc">Se eliminará "{{ deleteTarget.name }}" permanentemente.</p>
            <div class="confirm-actions">
              <button class="btn-secondary" :disabled="deleting" @click="deleteTarget = null">Cancelar</button>
              <button class="btn-danger" :disabled="deleting" @click="deleteProduct">
                <span v-if="deleting" class="spinner"></span>
                {{ deleting ? 'Eliminando…' : 'Eliminar' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminProductService } from '@/services/api'

const USE_MOCK = false

const loading     = ref(true)
const products    = ref([])
const search      = ref('')
const filterActive = ref('')
const toggling    = ref(null)
const deleteTarget = ref(null)
const deleting    = ref(false)

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Remera Oversize', slug: 'remera-oversize', category: 'Remeras', price: 12500, totalStock: 45, active: true, images: [] },
  { id: 'p2', name: 'Jogger Deportivo', slug: 'jogger-deportivo', category: 'Pantalones', price: 10400, totalStock: 3, active: true, images: [] },
  { id: 'p3', name: 'Buzo Canguro', slug: 'buzo-canguro', category: 'Buzos', price: 18900, totalStock: 12, active: true, images: [] },
  { id: 'p4', name: 'Calza Deportiva', slug: 'calza-deportiva', category: 'Calzas', price: 8750, totalStock: 0, active: false, images: [] },
  { id: 'p5', name: 'Campera Rompevientos', slug: 'campera-rompevientos', category: 'Camperas', price: 32000, totalStock: 8, active: true, images: [] },
]

const filtered = computed(() => {
  let list = products.value
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.slug ?? '').includes(q))
  }
  if (filterActive.value !== '') {
    const want = filterActive.value === 'true'
    list = list.filter(p => p.active === want)
  }
  return list
})

const total = computed(() => products.value.length)

async function load() {
  loading.value = true
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      products.value = [...MOCK_PRODUCTS]
    } else {
      products.value = await adminProductService.getAll()
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function toggle(p) {
  toggling.value = p.id
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      const found = products.value.find(x => x.id === p.id)
      if (found) found.active = !found.active
    } else {
      await adminProductService.toggleActive(p, !p.active)
      await load()
    }
  } finally {
    toggling.value = null
  }
}

function confirmDelete(p) { deleteTarget.value = p }

async function deleteProduct() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      products.value = products.value.filter(p => p.id !== deleteTarget.value.id)
    } else {
      await adminProductService.remove(deleteTarget.value.id)
      await load()
    }
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.admin-page { min-height: calc(100vh - 64px); background: #f9fafb; padding: 2rem 1rem; }
.admin-container { max-width: 1100px; margin: 0 auto; }

.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.page-title { font-size: 1.35rem; font-weight: 700; color: #111827; }
.page-sub { font-size: .82rem; color: #6b7280; margin-top: .15rem; }

.toolbar { display: flex; gap: .75rem; margin-bottom: 1rem; }
.search-input { flex: 1; padding: .6rem .875rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; font-size: .875rem; color: #111827; max-width: 320px; }
.search-input:focus { outline: none; border-color: #2563eb; }
.filter-select { padding: .6rem .75rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; font-size: .875rem; color: #374151; background: #fff; }

/* Table */
.table-wrap { background: #fff; border: 1px solid #e5e7eb; border-radius: .75rem; overflow: auto; }
.products-table { width: 100%; border-collapse: collapse; font-size: .875rem; }
.products-table thead tr { border-bottom: 1px solid #e5e7eb; }
.products-table th { padding: .875rem 1rem; text-align: left; font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; white-space: nowrap; }
.products-table tbody tr { border-bottom: 1px solid #f3f4f6; transition: background .1s; }
.products-table tbody tr:last-child { border-bottom: none; }
.products-table tbody tr:hover { background: #f9fafb; }
.products-table tbody tr.inactive { opacity: .6; }
.products-table td { padding: .875rem 1rem; vertical-align: middle; }

.td-product { display: flex; align-items: center; gap: .75rem; }
.product-thumb { width: 40px; height: 40px; border-radius: .375rem; overflow: hidden; background: #f3f4f6; flex-shrink: 0; }
.product-thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #d1d5db; }
.thumb-placeholder svg { width: 18px; height: 18px; }
.product-name { font-weight: 600; color: #111827; }
.product-slug { font-size: .75rem; color: #9ca3af; margin-top: .1rem; }
.td-cat { color: #6b7280; white-space: nowrap; }
.td-price { font-weight: 600; color: #111827; white-space: nowrap; }
.td-stock { white-space: nowrap; }
.low-stock { color: #d97706; font-weight: 600; }
.no-stock { color: #ef4444; font-weight: 600; }

.status-pill { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: .2rem .55rem; border-radius: .375rem; }
.status-pill.active   { background: #dcfce7; color: #166534; }
.status-pill.inactive { background: #f3f4f6; color: #6b7280; }

.td-actions { display: flex; gap: .5rem; align-items: center; white-space: nowrap; }
.action-btn { background: none; border: none; font-size: .8rem; font-weight: 500; cursor: pointer; color: #2563eb; padding: .2rem 0; text-decoration: none; }
.action-btn:hover { text-decoration: underline; }
.action-btn.danger { color: #ef4444; }
.action-btn:disabled { opacity: .5; cursor: not-allowed; text-decoration: none; }

/* Buttons */
.btn-primary { display: inline-flex; align-items: center; gap: .4rem; padding: .65rem 1.5rem; background: #111827; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .875rem; cursor: pointer; text-decoration: none; transition: background .15s; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { padding: .65rem 1.25rem; background: #fff; color: #374151; border: 1px solid #e5e7eb; border-radius: .6rem; font-weight: 600; font-size: .875rem; cursor: pointer; }
.btn-secondary:hover { border-color: #374151; }
.btn-danger { display: inline-flex; align-items: center; gap: .4rem; padding: .65rem 1.25rem; background: #ef4444; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .875rem; cursor: pointer; }
.btn-danger:hover:not(:disabled) { background: #dc2626; }
.btn-danger:disabled { opacity: .6; cursor: not-allowed; }

/* Skeleton */
.sk-block { background: #f3f4f6; border-radius: .375rem; animation: pulse 1.5s ease-in-out infinite; height: 14px; }
.sk-cell.wide { width: 160px; }
.sk-cell.mid { width: 90px; }
.sk-cell.narrow { width: 60px; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }

/* Confirm */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.confirm-dialog { background: #fff; border-radius: .75rem; padding: 1.75rem; max-width: 380px; width: 100%; }
.confirm-title { font-size: 1rem; font-weight: 700; color: #111827; margin-bottom: .5rem; }
.confirm-desc { font-size: .875rem; color: #6b7280; margin-bottom: 1.5rem; }
.confirm-actions { display: flex; justify-content: flex-end; gap: .75rem; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Empty */
.state-empty { text-align: center; padding: 3rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: .75rem; }
.state-empty p { font-size: .95rem; color: #6b7280; }

/* Spinner */
.spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 700px) {
  .table-wrap { font-size: .8rem; }
  .products-table th, .products-table td { padding: .625rem .75rem; }
  .td-actions { flex-direction: column; gap: .25rem; align-items: flex-start; }
}
</style>
