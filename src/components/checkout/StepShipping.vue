<template>
  <div class="step-shipping">
    <h2 class="step-title">Dirección de envío</h2>

    <!-- Direcciones guardadas -->
    <div v-if="savedAddresses.length" class="saved-addresses">
      <p class="section-label">Tus direcciones guardadas</p>
      <div
        v-for="addr in savedAddresses"
        :key="addr.id"
        class="address-card"
        :class="{ selected: selectedAddressId === addr.id }"
        @click="selectSaved(addr)"
      >
        <div class="address-radio">
          <div class="radio-dot" :class="{ active: selectedAddressId === addr.id }"></div>
        </div>
        <div class="address-info">
          <p class="address-name">{{ addr.name }}</p>
          <p class="address-detail">{{ addr.street }}, {{ addr.city }}, {{ addr.province }} {{ addr.zip }}</p>
        </div>
      </div>
      <button class="btn-new-address" @click="showNewForm = !showNewForm">
        {{ showNewForm ? '− Cancelar nueva dirección' : '+ Usar otra dirección' }}
      </button>
    </div>

    <!-- Formulario nueva dirección -->
    <div v-if="!savedAddresses.length || showNewForm" class="new-address-form">
      <p v-if="savedAddresses.length" class="section-label">Nueva dirección</p>
      <div class="form-grid">
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
            <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
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
      </div>
    </div>

    <!-- Opciones de envío -->
    <template v-if="activeAddress">
      <div v-if="loadingOptions" class="shipping-loading">
        <span class="spinner"></span> Calculando opciones de envío...
      </div>

      <div v-else-if="shippingError" class="shipping-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <p class="error-title">{{ shippingError }}</p>
          <p v-if="hasPickupOption" class="error-hint">Podés optar por retiro en local.</p>
        </div>
      </div>

      <div v-else-if="shippingOptions.length" class="shipping-options">
        <p class="section-label">Opciones de envío</p>
        <div
          v-for="opt in shippingOptions"
          :key="opt.id"
          class="option-card"
          :class="{ selected: selectedOption?.id === opt.id }"
          @click="selectedOption = opt"
        >
          <div class="option-radio">
            <div class="radio-dot" :class="{ active: selectedOption?.id === opt.id }"></div>
          </div>
          <div class="option-info">
            <p class="option-name">{{ opt.name }}</p>
            <p class="option-days">{{ opt.estimatedDays }} días hábiles</p>
          </div>
          <p class="option-price">{{ opt.price === 0 ? 'Gratis' : formatPrice(opt.price) }}</p>
        </div>
      </div>
    </template>

    <div class="step-actions">
      <button class="btn-secondary" @click="emit('back')">Volver</button>
      <button class="btn-primary" :disabled="!canContinue" @click="handleContinue">Continuar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { checkoutService } from '@/services/api'
import { isDemoMode } from '@/config'

const USE_MOCK = isDemoMode

const cartStore = useCartStore()
const emit = defineEmits(['next', 'back'])

const provinces = ['Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán']

const savedAddresses  = ref([])
const selectedAddressId = ref(null)
const showNewForm     = ref(false)
const shippingOptions = ref([])
const selectedOption  = ref(null)
const loadingOptions  = ref(false)
const shippingError   = ref(null)

const form   = ref({ name: '', street: '', city: '', province: '', zip: '', phone: '' })
const errors = ref({ name: '', street: '', city: '', province: '', zip: '', phone: '' })

const hasPickupOption = computed(() => shippingOptions.value.some(o => o.id === 'pickup'))
const activeAddress   = computed(() => {
  if (savedAddresses.value.length && selectedAddressId.value && !showNewForm.value) {
    return savedAddresses.value.find(a => a.id === selectedAddressId.value)
  }
  if (showNewForm.value || !savedAddresses.value.length) {
    const f = form.value
    if (f.name && f.street && f.city && f.province && f.zip) return { ...f, id: null }
  }
  return null
})

const canContinue = computed(() => !!activeAddress.value && !!selectedOption.value)

function selectSaved(addr) {
  selectedAddressId.value = addr.id
  showNewForm.value = false
}

function validateForm() {
  const f = form.value
  const e = errors.value
  Object.keys(e).forEach(k => e[k] = '')
  let ok = true
  if (!f.name.trim())     { e.name = 'Requerido'; ok = false }
  if (!f.street.trim())   { e.street = 'Requerido'; ok = false }
  if (!f.city.trim())     { e.city = 'Requerido'; ok = false }
  if (!f.province)        { e.province = 'Seleccioná una provincia'; ok = false }
  if (!f.zip.trim())      { e.zip = 'Requerido'; ok = false }
  if (!f.phone.trim())    { e.phone = 'Requerido'; ok = false }
  return ok
}

async function fetchShippingOptions(address) {
  loadingOptions.value = true
  shippingError.value  = null
  selectedOption.value = null
  try {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 600))
      // Simular zona no cubierta para CP fuera de rango
      if (address.zip === '9999') {
        shippingError.value = 'No hacemos envíos a esa zona por el momento.'
        shippingOptions.value = [{ id: 'pickup', name: 'Retiro en local', price: 0, estimatedDays: 0 }]
        return
      }
      shippingOptions.value = [
        { id: 'standard', name: 'Envío estándar', price: 2500,  estimatedDays: '5-7' },
        { id: 'express',  name: 'Envío express',  price: 5500,  estimatedDays: '1-2' },
        { id: 'pickup',   name: 'Retiro en local', price: 0,    estimatedDays: 0 },
      ]
    } else {
      shippingOptions.value = await checkoutService.getShippingOptions(address.id, cartStore.items)
    }
  } catch {
    shippingError.value = 'No pudimos calcular las opciones de envío. Intentá de nuevo.'
  } finally {
    loadingOptions.value = false
  }
}

watch(activeAddress, (addr) => { if (addr) fetchShippingOptions(addr) }, { deep: true })

onMounted(async () => {
  if (USE_MOCK) {
    savedAddresses.value = [
      { id: 'a1', name: 'Casa', street: 'Av. Corrientes 1234', city: 'Buenos Aires', province: 'CABA', zip: '1414', phone: '11 2345-6789', isDefault: true },
    ]
  } else {
    savedAddresses.value = await checkoutService.getAddresses()
  }
  const def = savedAddresses.value.find(a => a.isDefault)
  if (def) selectedAddressId.value = def.id
})

function handleContinue() {
  if (showNewForm.value || !savedAddresses.value.length) {
    if (!validateForm()) return
  }
  emit('next', { address: activeAddress.value, option: selectedOption.value })
}

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.step-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin-bottom: 1.25rem; }
.section-label { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin-bottom: .6rem; }

.saved-addresses { margin-bottom: 1.25rem; }
.address-card, .option-card {
  display: flex; align-items: center; gap: .875rem;
  padding: .875rem 1rem; border: 1.5px solid #e5e7eb;
  border-radius: .6rem; cursor: pointer; margin-bottom: .5rem;
  transition: border-color .15s;
}
.address-card:hover, .option-card:hover { border-color: #9ca3af; }
.address-card.selected, .option-card.selected { border-color: #111827; background: #f9fafb; }
.address-radio, .option-radio { flex-shrink: 0; }
.radio-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d1d5db; transition: all .15s; }
.radio-dot.active { border-color: #111827; border-width: 5px; }
.address-name, .option-name { font-size: .875rem; font-weight: 600; color: #111827; }
.address-detail, .option-days { font-size: .78rem; color: #6b7280; margin-top: .15rem; }
.option-info { flex: 1; }
.option-price { font-size: .9rem; font-weight: 700; color: #111827; white-space: nowrap; }

.btn-new-address { background: none; border: none; color: #2563eb; font-size: .85rem; font-weight: 500; cursor: pointer; padding: .25rem 0; margin-top: .25rem; }
.btn-new-address:hover { text-decoration: underline; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .875rem; }
.field { display: flex; flex-direction: column; gap: .3rem; }
.field.full { grid-column: 1 / -1; }
.field-label { font-size: .78rem; font-weight: 600; color: #374151; }
.field-input { padding: .6rem .75rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; font-size: .875rem; color: #111827; }
.field-input:focus { outline: none; border-color: #2563eb; }
.field-input.error { border-color: #ef4444; }
.field-error { font-size: .72rem; color: #ef4444; }

.shipping-loading { display: flex; align-items: center; gap: .6rem; padding: 1rem; color: #6b7280; font-size: .875rem; }
.spinner { width: 18px; height: 18px; border: 2px solid #e5e7eb; border-top-color: #111827; border-radius: 50%; animation: spin .6s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }

.shipping-error { display: flex; align-items: flex-start; gap: .75rem; padding: .875rem 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: .6rem; margin: .875rem 0; }
.shipping-error svg { width: 20px; height: 20px; color: #ef4444; flex-shrink: 0; margin-top: .1rem; }
.error-title { font-size: .875rem; font-weight: 600; color: #991b1b; }
.error-hint  { font-size: .8rem; color: #b91c1c; margin-top: .25rem; }

.shipping-options { margin-top: .875rem; }

.step-actions { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.75rem; }
.btn-primary { padding: .7rem 2rem; background: #111827; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .9rem; cursor: pointer; transition: background .15s; }
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { background: #d1d5db; cursor: not-allowed; }
.btn-secondary { padding: .7rem 1.25rem; background: #fff; color: #374151; border: 1px solid #e5e7eb; border-radius: .6rem; font-weight: 600; font-size: .9rem; cursor: pointer; transition: border-color .15s; }
.btn-secondary:hover { border-color: #374151; }
</style>
