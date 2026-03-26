<template>
  <div class="addresses-page">
    <div class="addresses-container">

      <div class="page-header">
        <h1 class="page-title">Mis direcciones</h1>
        <button class="btn-primary" @click="openForm()">+ Nueva dirección</button>
      </div>

      <!-- Skeleton -->
      <template v-if="loading">
        <div v-for="i in 2" :key="i" class="address-card skeleton">
          <div class="sk-lines">
            <div class="sk-block sk-line wide"></div>
            <div class="sk-block sk-line narrow"></div>
            <div class="sk-block sk-line mid"></div>
          </div>
          <div class="sk-actions">
            <div class="sk-block sk-btn"></div>
            <div class="sk-block sk-btn"></div>
          </div>
        </div>
      </template>

      <!-- Empty -->
      <div v-else-if="!addresses.length && !showForm" class="state-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        <p>No tenés direcciones guardadas.</p>
        <button class="btn-primary" @click="openForm()">Agregar dirección</button>
      </div>

      <!-- List -->
      <TransitionGroup v-else-if="!loading" tag="div" name="list" class="addresses-list">
        <div v-for="addr in addresses" :key="addr.id" class="address-card" :class="{ 'is-default': addr.isDefault }">
          <div class="card-body">
            <div class="card-top">
              <p class="addr-alias">{{ addr.alias }}</p>
              <span v-if="addr.isDefault" class="default-badge">Predeterminada</span>
            </div>
            <p class="addr-name">{{ addr.name }}</p>
            <p class="addr-detail">{{ addr.street }}, {{ addr.city }}</p>
            <p class="addr-detail">{{ addr.province }}, CP {{ addr.zip }}</p>
            <p class="addr-detail">Tel: {{ addr.phone }}</p>
          </div>
          <div class="card-actions">
            <button v-if="!addr.isDefault" class="btn-action" @click="setDefault(addr.id)" :disabled="saving === addr.id">
              Predeterminar
            </button>
            <button class="btn-action" @click="openForm(addr)" :disabled="saving === addr.id">Editar</button>
            <button class="btn-action danger" @click="confirmDelete(addr)" :disabled="saving === addr.id">Eliminar</button>
          </div>
        </div>
      </TransitionGroup>

      <!-- Form -->
      <Transition name="slide">
        <div v-if="showForm" class="form-card">
          <h2 class="form-title">{{ editingId ? 'Editar dirección' : 'Nueva dirección' }}</h2>
          <div class="form-grid">
            <div class="field full">
              <label class="field-label">Alias *</label>
              <input v-model="form.alias" class="field-input" :class="{ error: errors.alias }" placeholder="Casa, Trabajo…" />
              <span v-if="errors.alias" class="field-error">{{ errors.alias }}</span>
            </div>
            <div class="field full">
              <label class="field-label">Nombre del destinatario *</label>
              <input v-model="form.name" class="field-input" :class="{ error: errors.name }" placeholder="Juan Pérez" />
              <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
            </div>
            <div class="field full">
              <label class="field-label">Calle y número *</label>
              <input v-model="form.street" class="field-input" :class="{ error: errors.street }" placeholder="Av. Corrientes 1234, Piso 3 Dto B" />
              <span v-if="errors.street" class="field-error">{{ errors.street }}</span>
            </div>
            <div class="field">
              <label class="field-label">Ciudad *</label>
              <input v-model="form.city" class="field-input" :class="{ error: errors.city }" placeholder="Buenos Aires" />
              <span v-if="errors.city" class="field-error">{{ errors.city }}</span>
            </div>
            <div class="field">
              <label class="field-label">Provincia *</label>
              <select v-model="form.province" class="field-input" :class="{ error: errors.province }">
                <option value="">Seleccioná</option>
                <option v-for="p in PROVINCES" :key="p" :value="p">{{ p }}</option>
              </select>
              <span v-if="errors.province" class="field-error">{{ errors.province }}</span>
            </div>
            <div class="field">
              <label class="field-label">Código postal *</label>
              <input v-model="form.zip" class="field-input" :class="{ error: errors.zip }" placeholder="1414" maxlength="8" />
              <span v-if="errors.zip" class="field-error">{{ errors.zip }}</span>
            </div>
            <div class="field">
              <label class="field-label">Teléfono de contacto *</label>
              <input v-model="form.phone" class="field-input" :class="{ error: errors.phone }" placeholder="11 2345-6789" />
              <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
            </div>
            <div class="field full">
              <label class="toggle-row">
                <div class="toggle" :class="{ on: form.isDefault }" @click="form.isDefault = !form.isDefault">
                  <div class="toggle-thumb"></div>
                </div>
                <span>Establecer como predeterminada</span>
              </label>
            </div>
          </div>
          <div v-if="formError" class="form-error-msg">{{ formError }}</div>
          <div class="form-actions">
            <button class="btn-secondary" :disabled="formSaving" @click="cancelForm">Cancelar</button>
            <button class="btn-primary" :disabled="formSaving" @click="submitForm">
              <span v-if="formSaving" class="spinner"></span>
              {{ formSaving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar dirección' }}
            </button>
          </div>
        </div>
      </Transition>

      <!-- Delete confirm -->
      <Transition name="fade">
        <div v-if="deleteTarget" class="overlay" @click.self="deleteTarget = null">
          <div class="confirm-dialog">
            <p class="confirm-title">¿Eliminar dirección?</p>
            <p class="confirm-desc">Se eliminará "{{ deleteTarget.alias }}" de tus direcciones guardadas.</p>
            <div class="confirm-actions">
              <button class="btn-secondary" :disabled="deleting" @click="deleteTarget = null">Cancelar</button>
              <button class="btn-danger" :disabled="deleting" @click="deleteAddress">
                <span v-if="deleting" class="spinner spinner-dark"></span>
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
import { ref, onMounted } from 'vue'
import { addressesService } from '@/services/api'

const USE_MOCK = true

const PROVINCES = ['Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán']

const loading     = ref(true)
const saving      = ref(null) // id of address being saved
const addresses   = ref([])
const showForm    = ref(false)
const editingId   = ref(null)
const formSaving  = ref(false)
const formError   = ref(null)
const deleteTarget = ref(null)
const deleting    = ref(false)

const EMPTY_FORM = () => ({ alias: '', name: '', street: '', city: '', province: '', zip: '', phone: '', isDefault: false })
const form   = ref(EMPTY_FORM())
const errors = ref({})

let nextMockId = 10
const mockAddresses = ref([
  { id: 'a1', alias: 'Casa', name: 'Juan Pérez', street: 'Av. Corrientes 1234', city: 'Buenos Aires', province: 'CABA', zip: '1414', phone: '11 2345-6789', isDefault: true },
])

async function load() {
  loading.value = true
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      addresses.value = [...mockAddresses.value]
    } else {
      addresses.value = await addressesService.getAll()
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openForm(addr = null) {
  if (addr) {
    editingId.value = addr.id
    form.value = { ...addr }
  } else {
    editingId.value = null
    form.value = EMPTY_FORM()
  }
  errors.value  = {}
  formError.value = null
  showForm.value = true
}

function cancelForm() {
  showForm.value  = false
  editingId.value = null
}

function validate() {
  const e = {}
  const f = form.value
  if (!f.alias.trim())    e.alias    = 'Requerido'
  if (!f.name.trim())     e.name     = 'Requerido'
  if (!f.street.trim())   e.street   = 'Requerido'
  if (!f.city.trim())     e.city     = 'Requerido'
  if (!f.province)        e.province = 'Seleccioná una provincia'
  if (!f.zip.trim())      e.zip      = 'Requerido'
  if (!f.phone.trim())    e.phone    = 'Requerido'
  errors.value = e
  return !Object.keys(e).length
}

async function submitForm() {
  if (!validate()) return
  formSaving.value = true
  formError.value  = null
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 500))
      if (editingId.value) {
        const idx = mockAddresses.value.findIndex(a => a.id === editingId.value)
        if (idx !== -1) mockAddresses.value[idx] = { ...form.value, id: editingId.value }
      } else {
        const newAddr = { ...form.value, id: 'a' + (nextMockId++) }
        mockAddresses.value.push(newAddr)
      }
      // Si se marca como predeterminada, desmarcar las otras
      if (form.value.isDefault) {
        mockAddresses.value.forEach(a => { if (a.id !== (editingId.value ?? mockAddresses.value.at(-1)?.id)) a.isDefault = false })
        const target = editingId.value ?? mockAddresses.value.at(-1)?.id
        const t = mockAddresses.value.find(a => a.id === target)
        if (t) t.isDefault = true
      }
      addresses.value = [...mockAddresses.value]
    } else {
      if (editingId.value) {
        await addressesService.update(editingId.value, form.value)
      } else {
        await addressesService.create(form.value)
      }
      addresses.value = await addressesService.getAll()
    }
    cancelForm()
  } catch {
    formError.value = 'No pudimos guardar la dirección. Intentá de nuevo.'
  } finally {
    formSaving.value = false
  }
}

async function setDefault(id) {
  saving.value = id
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      mockAddresses.value.forEach(a => { a.isDefault = a.id === id })
      addresses.value = [...mockAddresses.value]
    } else {
      await addressesService.setDefault(id)
      addresses.value = await addressesService.getAll()
    }
  } finally {
    saving.value = null
  }
}

function confirmDelete(addr) {
  deleteTarget.value = addr
}

async function deleteAddress() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 400))
      mockAddresses.value = mockAddresses.value.filter(a => a.id !== deleteTarget.value.id)
      addresses.value = [...mockAddresses.value]
    } else {
      await addressesService.remove(deleteTarget.value.id)
      addresses.value = await addressesService.getAll()
    }
    deleteTarget.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.addresses-page { min-height: calc(100vh - 64px); background: #f9fafb; padding: 2rem 1rem; }
.addresses-container { max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }

.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: .5rem; }
.page-title { font-size: 1.35rem; font-weight: 700; color: #111827; }

/* Address card */
.address-card {
  background: #fff; border: 1.5px solid #e5e7eb; border-radius: .75rem;
  padding: 1.25rem 1.5rem; display: flex; justify-content: space-between;
  align-items: flex-start; gap: 1rem;
  transition: border-color .15s;
}
.address-card.is-default { border-color: #111827; }

.card-top { display: flex; align-items: center; gap: .625rem; margin-bottom: .35rem; }
.addr-alias { font-size: .95rem; font-weight: 700; color: #111827; }
.default-badge { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; background: #111827; color: #fff; padding: .15rem .5rem; border-radius: .3rem; }
.addr-name   { font-size: .875rem; font-weight: 600; color: #374151; margin-bottom: .15rem; }
.addr-detail { font-size: .8rem; color: #6b7280; line-height: 1.5; }

.card-actions { display: flex; flex-direction: column; align-items: flex-end; gap: .4rem; flex-shrink: 0; }
.btn-action { background: none; border: none; font-size: .8rem; font-weight: 500; cursor: pointer; color: #2563eb; padding: .2rem 0; }
.btn-action:hover { text-decoration: underline; }
.btn-action.danger { color: #ef4444; }
.btn-action:disabled { opacity: .5; cursor: not-allowed; text-decoration: none; }

/* Form card */
.form-card { background: #fff; border: 1.5px solid #2563eb; border-radius: .75rem; padding: 1.5rem; }
.form-title { font-size: 1rem; font-weight: 700; color: #111827; margin-bottom: 1.25rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .875rem; }
.field { display: flex; flex-direction: column; gap: .3rem; }
.field.full { grid-column: 1 / -1; }
.field-label { font-size: .78rem; font-weight: 600; color: #374151; }
.field-input { padding: .6rem .75rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; font-size: .875rem; color: #111827; }
.field-input:focus { outline: none; border-color: #2563eb; }
.field-input.error { border-color: #ef4444; }
.field-error { font-size: .72rem; color: #ef4444; }

.toggle-row { display: flex; align-items: center; gap: .75rem; cursor: pointer; user-select: none; font-size: .875rem; color: #374151; }
.toggle { width: 40px; height: 22px; border-radius: 11px; background: #e5e7eb; position: relative; transition: background .2s; flex-shrink: 0; }
.toggle.on { background: #111827; }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.toggle.on .toggle-thumb { transform: translateX(18px); }

.form-error-msg { margin-top: .75rem; padding: .65rem .875rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: .5rem; font-size: .82rem; color: #991b1b; }
.form-actions { display: flex; justify-content: flex-end; gap: .75rem; margin-top: 1.25rem; }

/* Buttons */
.btn-primary { display: inline-flex; align-items: center; gap: .4rem; padding: .65rem 1.5rem; background: #111827; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .875rem; cursor: pointer; transition: background .15s; }
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-secondary { padding: .65rem 1.25rem; background: #fff; color: #374151; border: 1px solid #e5e7eb; border-radius: .6rem; font-weight: 600; font-size: .875rem; cursor: pointer; }
.btn-secondary:hover:not(:disabled) { border-color: #374151; }
.btn-secondary:disabled { opacity: .5; cursor: not-allowed; }
.btn-danger { display: inline-flex; align-items: center; gap: .4rem; padding: .65rem 1.25rem; background: #ef4444; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .875rem; cursor: pointer; }
.btn-danger:hover:not(:disabled) { background: #dc2626; }
.btn-danger:disabled { opacity: .6; cursor: not-allowed; }

/* Spinner */
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; flex-shrink: 0; }
.spinner-dark { border-color: rgba(0,0,0,.15); border-top-color: #fff; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Confirm dialog */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.confirm-dialog { background: #fff; border-radius: .75rem; padding: 1.75rem; max-width: 380px; width: 100%; }
.confirm-title { font-size: 1rem; font-weight: 700; color: #111827; margin-bottom: .5rem; }
.confirm-desc { font-size: .875rem; color: #6b7280; margin-bottom: 1.5rem; }
.confirm-actions { display: flex; justify-content: flex-end; gap: .75rem; }

/* Empty */
.state-empty { text-align: center; padding: 3rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.state-empty svg { width: 48px; height: 48px; color: #d1d5db; }
.state-empty p { font-size: .95rem; color: #6b7280; }

/* Skeleton */
.skeleton { pointer-events: none; }
.sk-block { background: #f3f4f6; border-radius: .375rem; animation: pulse 1.5s ease-in-out infinite; }
.sk-lines { flex: 1; display: flex; flex-direction: column; gap: .5rem; }
.sk-line { height: 12px; }
.sk-line.wide { width: 55%; }
.sk-line.narrow { width: 30%; }
.sk-line.mid { width: 70%; }
.sk-actions { display: flex; flex-direction: column; gap: .5rem; }
.sk-btn { width: 64px; height: 18px; border-radius: .25rem; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }

/* Transitions */
.list-enter-active, .list-leave-active { transition: all .25s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(-8px); }
.slide-enter-active, .slide-leave-active { transition: all .25s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; }
.slide-enter-to, .slide-leave-from { opacity: 1; max-height: 800px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .addresses-page { padding: 1.25rem .75rem; }
  .address-card { flex-direction: column; }
  .card-actions { flex-direction: row; align-items: center; }
  .form-grid { grid-template-columns: 1fr; }
  .field.full { grid-column: auto; }
}
</style>
