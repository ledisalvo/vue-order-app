<template>
  <div class="admin-page">
    <div class="admin-container">
      <h1 class="page-title">Configuración del catálogo</h1>

      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in TABS"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </div>

      <!-- ─── CATEGORÍAS ─── -->
      <section v-if="activeTab === 'categories'" class="tab-content">
        <div class="section-header">
          <p class="section-sub">{{ categories.length }} categorías</p>
          <button class="btn-primary" @click="openCatForm()">+ Nueva categoría</button>
        </div>

        <template v-if="cats.loading">
          <div v-for="i in 3" :key="i" class="sk-row-item">
            <div class="sk-block sk-line wide"></div>
            <div class="sk-block sk-line narrow"></div>
          </div>
        </template>

        <div v-else-if="!categories.length && !cats.showForm" class="state-empty">
          <p>Sin categorías. Creá la primera.</p>
        </div>

        <div v-else class="item-list">
          <div v-for="cat in categories" :key="cat.id" class="list-row">
            <div class="row-info">
              <span class="row-name">{{ cat.name }}</span>
              <span class="row-slug">{{ cat.slug }}</span>
              <span class="status-pill" :class="cat.active ? 'pill-on' : 'pill-off'">{{ cat.active ? 'Activa' : 'Inactiva' }}</span>
            </div>
            <div class="row-actions">
              <span class="order-badge">Orden {{ cat.order }}</span>
              <button class="action-btn" @click="openCatForm(cat)">Editar</button>
              <button class="action-btn danger" @click="deleteCategory(cat.id)">Eliminar</button>
            </div>
          </div>
        </div>

        <!-- Formulario inline -->
        <Transition name="slide">
          <div v-if="cats.showForm" class="inline-form">
            <h3 class="form-sub">{{ cats.editingId ? 'Editar categoría' : 'Nueva categoría' }}</h3>
            <div class="form-row">
              <div class="field">
                <label class="field-label">Nombre *</label>
                <input v-model="cats.form.name" @input="autoCatSlug" class="field-input" :class="{ error: cats.errors.name }" placeholder="Remeras" />
                <span v-if="cats.errors.name" class="field-error">{{ cats.errors.name }}</span>
              </div>
              <div class="field">
                <label class="field-label">Slug</label>
                <input v-model="cats.form.slug" class="field-input" placeholder="remeras" />
              </div>
              <div class="field narrow">
                <label class="field-label">Orden</label>
                <input v-model.number="cats.form.order" type="number" min="1" class="field-input" placeholder="1" />
              </div>
              <div class="field narrow">
                <label class="toggle-label">
                  <div class="toggle" :class="{ on: cats.form.active }" @click="cats.form.active = !cats.form.active">
                    <div class="toggle-thumb"></div>
                  </div>
                  Activa
                </label>
              </div>
            </div>
            <div class="inline-form-actions">
              <button class="btn-secondary" @click="cats.showForm = false">Cancelar</button>
              <button class="btn-primary" :disabled="cats.saving" @click="saveCategory">
                <span v-if="cats.saving" class="spinner"></span>
                {{ cats.saving ? 'Guardando…' : cats.editingId ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </Transition>
      </section>

      <!-- ─── PROMOCIONES ─── -->
      <section v-if="activeTab === 'promotions'" class="tab-content">
        <div class="section-header">
          <p class="section-sub">Promociones auto-apply — sin cupones en MVP</p>
          <button class="btn-primary" @click="openPromoForm()">+ Nueva promoción</button>
        </div>

        <div v-if="!promotions.length && !promos.showForm" class="state-empty">
          <p>Sin promociones activas.</p>
        </div>

        <div v-else class="item-list">
          <div v-for="promo in promotions" :key="promo.id" class="list-row">
            <div class="row-info">
              <span class="row-name">{{ promo.name }}</span>
              <span class="promo-type">{{ promo.type === 'percent' ? `${promo.value}% de descuento` : `$${promo.value} de descuento` }}</span>
              <span v-if="promo.minCartAmount" class="promo-cond">Mínimo {{ formatPrice(promo.minCartAmount) }}</span>
              <span class="status-pill" :class="promo.active ? 'pill-on' : 'pill-off'">{{ promo.active ? 'Activa' : 'Inactiva' }}</span>
            </div>
            <div class="row-actions">
              <span class="date-range">{{ formatShortDate(promo.dateFrom) }} → {{ formatShortDate(promo.dateTo) }}</span>
              <button class="action-btn" @click="openPromoForm(promo)">Editar</button>
              <button class="action-btn danger" @click="deletePromotion(promo.id)">Eliminar</button>
            </div>
          </div>
        </div>

        <Transition name="slide">
          <div v-if="promos.showForm" class="inline-form">
            <h3 class="form-sub">{{ promos.editingId ? 'Editar promoción' : 'Nueva promoción' }}</h3>
            <div class="form-row">
              <div class="field full">
                <label class="field-label">Nombre *</label>
                <input v-model="promos.form.name" class="field-input" :class="{ error: promos.errors.name }" placeholder="2x1 en buzos" />
                <span v-if="promos.errors.name" class="field-error">{{ promos.errors.name }}</span>
              </div>
              <div class="field">
                <label class="field-label">Tipo de descuento</label>
                <select v-model="promos.form.type" class="field-input">
                  <option value="percent">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo (ARS)</option>
                </select>
              </div>
              <div class="field narrow">
                <label class="field-label">Valor *</label>
                <input v-model.number="promos.form.value" type="number" min="0" class="field-input" :class="{ error: promos.errors.value }" placeholder="10" />
                <span v-if="promos.errors.value" class="field-error">{{ promos.errors.value }}</span>
              </div>
              <div class="field">
                <label class="field-label">Monto mínimo de carrito</label>
                <input v-model.number="promos.form.minCartAmount" type="number" min="0" class="field-input" placeholder="Sin mínimo" />
              </div>
              <div class="field">
                <label class="field-label">Fecha inicio</label>
                <input v-model="promos.form.dateFrom" type="date" class="field-input" />
              </div>
              <div class="field">
                <label class="field-label">Fecha fin</label>
                <input v-model="promos.form.dateTo" type="date" class="field-input" />
              </div>
              <div class="field narrow">
                <label class="toggle-label">
                  <div class="toggle" :class="{ on: promos.form.active }" @click="promos.form.active = !promos.form.active">
                    <div class="toggle-thumb"></div>
                  </div>
                  Activa
                </label>
              </div>
            </div>
            <div class="inline-form-actions">
              <button class="btn-secondary" @click="promos.showForm = false">Cancelar</button>
              <button class="btn-primary" :disabled="promos.saving" @click="savePromotion">
                <span v-if="promos.saving" class="spinner"></span>
                {{ promos.saving ? 'Guardando…' : promos.editingId ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </Transition>
      </section>

      <!-- ─── ZONAS DE ENVÍO ─── -->
      <section v-if="activeTab === 'shipping'" class="tab-content">
        <div class="section-header">
          <p class="section-sub">Zonas y tarifas de envío</p>
          <button class="btn-primary" @click="openZoneForm()">+ Nueva zona</button>
        </div>

        <div v-if="!shippingZones.length && !zones.showForm" class="state-empty">
          <p>Sin zonas de envío configuradas.</p>
        </div>

        <div v-else class="item-list">
          <div v-for="zone in shippingZones" :key="zone.id" class="list-row">
            <div class="row-info">
              <span class="row-name">{{ zone.name }}</span>
              <span class="zone-detail">{{ zone.provinces.slice(0,3).join(', ') }}{{ zone.provinces.length > 3 ? ` +${zone.provinces.length - 3}` : '' }}</span>
              <span class="zone-detail">Base: {{ formatPrice(zone.baseCost) }} · {{ formatPrice(zone.costPerKg) }}/kg</span>
              <span v-if="zone.freeShippingThreshold" class="zone-detail free">Gratis desde {{ formatPrice(zone.freeShippingThreshold) }}</span>
            </div>
            <div class="row-actions">
              <button class="action-btn" @click="openZoneForm(zone)">Editar</button>
              <button class="action-btn danger" @click="deleteZone(zone.id)">Eliminar</button>
            </div>
          </div>
        </div>

        <Transition name="slide">
          <div v-if="zones.showForm" class="inline-form">
            <h3 class="form-sub">{{ zones.editingId ? 'Editar zona' : 'Nueva zona de envío' }}</h3>
            <div class="form-row">
              <div class="field full">
                <label class="field-label">Nombre de la zona *</label>
                <input v-model="zones.form.name" class="field-input" :class="{ error: zones.errors.name }" placeholder="Buenos Aires y CABA" />
                <span v-if="zones.errors.name" class="field-error">{{ zones.errors.name }}</span>
              </div>
              <div class="field full">
                <label class="field-label">Provincias cubiertas</label>
                <div class="provinces-grid">
                  <label v-for="p in PROVINCES" :key="p" class="province-check">
                    <input type="checkbox" :value="p" v-model="zones.form.provinces" />
                    {{ p }}
                  </label>
                </div>
              </div>
              <div class="field">
                <label class="field-label">Costo base (ARS)</label>
                <input v-model.number="zones.form.baseCost" type="number" min="0" class="field-input" placeholder="2500" />
              </div>
              <div class="field">
                <label class="field-label">Costo por kg (ARS)</label>
                <input v-model.number="zones.form.costPerKg" type="number" min="0" class="field-input" placeholder="50" />
              </div>
              <div class="field">
                <label class="field-label">Umbral envío gratis (0 = no aplica)</label>
                <input v-model.number="zones.form.freeShippingThreshold" type="number" min="0" class="field-input" placeholder="20000" />
              </div>
            </div>
            <div class="inline-form-actions">
              <button class="btn-secondary" @click="zones.showForm = false">Cancelar</button>
              <button class="btn-primary" :disabled="zones.saving" @click="saveZone">
                <span v-if="zones.saving" class="spinner"></span>
                {{ zones.saving ? 'Guardando…' : zones.editingId ? 'Guardar' : 'Crear' }}
              </button>
            </div>
          </div>
        </Transition>
      </section>

      <!-- ─── PUNTO DE RETIRO ─── -->
      <section v-if="activeTab === 'pickup'" class="tab-content">
        <div class="section-header">
          <p class="section-sub">Configuración del local de retiro</p>
        </div>
        <div class="inline-form always-open">
          <div class="form-row">
            <div class="field full">
              <label class="field-label">Nombre del local</label>
              <input v-model="pickup.form.name" class="field-input" placeholder="Local central" />
            </div>
            <div class="field full">
              <label class="field-label">Dirección</label>
              <input v-model="pickup.form.address" class="field-input" placeholder="Av. Santa Fe 1234, CABA" />
            </div>
            <div class="field">
              <label class="field-label">Horario</label>
              <input v-model="pickup.form.hours" class="field-input" placeholder="Lun–Vie 10–18hs" />
            </div>
            <div class="field">
              <label class="field-label">Teléfono</label>
              <input v-model="pickup.form.phone" class="field-input" placeholder="11 2345-6789" />
            </div>
            <div class="field full">
              <label class="field-label">Indicaciones adicionales</label>
              <textarea v-model="pickup.form.notes" class="field-input textarea" rows="2" placeholder="Tocar timbre, preguntar por…"></textarea>
            </div>
            <div class="field narrow">
              <label class="toggle-label">
                <div class="toggle" :class="{ on: pickup.form.active }" @click="pickup.form.active = !pickup.form.active">
                  <div class="toggle-thumb"></div>
                </div>
                Habilitado
              </label>
            </div>
          </div>
          <div v-if="pickup.error" class="save-error">{{ pickup.error }}</div>
          <div class="inline-form-actions">
            <button class="btn-primary" :disabled="pickup.saving" @click="savePickup">
              <span v-if="pickup.saving" class="spinner"></span>
              {{ pickup.saving ? 'Guardando…' : 'Guardar configuración' }}
            </button>
          </div>
          <div v-if="pickup.saved" class="save-ok">Configuración guardada correctamente.</div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { adminConfigService } from '@/services/api'

const TABS = [
  { key: 'categories', label: 'Categorías' },
  { key: 'promotions', label: 'Promociones' },
  { key: 'shipping',   label: 'Zonas de envío' },
  { key: 'pickup',     label: 'Punto de retiro' },
]
const activeTab = ref('categories')

const PROVINCES = ['Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán']

// ─── CATEGORIES ───
const categories = ref([])
const cats = reactive({
  loading: true, showForm: false, editingId: null, saving: false,
  form: { name: '', slug: '', order: 1, active: true },
  errors: {},
})

function openCatForm(cat = null) {
  cats.editingId = cat?.id ?? null
  cats.form = cat ? { ...cat } : { name: '', slug: '', order: categories.value.length + 1, active: true }
  cats.errors = {}
  cats.showForm = true
}
function autoCatSlug() {
  if (cats.editingId) return
  cats.form.slug = cats.form.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-')
}
async function saveCategory() {
  if (!cats.form.name.trim()) { cats.errors = { name: 'Requerido' }; return }
  cats.saving = true
  try {
    if (cats.editingId) {
      await adminConfigService.updateCategory(cats.editingId, cats.form)
    } else {
      await adminConfigService.createCategory(cats.form)
    }
    categories.value = await adminConfigService.getCategories()
    cats.showForm = false
  } finally {
    cats.saving = false
  }
}
async function deleteCategory(id) {
  await adminConfigService.deleteCategory(id)
  categories.value = categories.value.filter(c => c.id !== id)
}

// ─── PROMOTIONS ───
const promotions = ref([])
const promos = reactive({
  showForm: false, editingId: null, saving: false,
  form: { name: '', type: 'percent', value: null, minCartAmount: null, dateFrom: '', dateTo: '', active: true },
  errors: {},
})

function openPromoForm(promo = null) {
  promos.editingId = promo?.id ?? null
  promos.form = promo ? { ...promo } : { name: '', type: 'percent', value: null, minCartAmount: null, dateFrom: '', dateTo: '', active: true }
  promos.errors = {}
  promos.showForm = true
}
async function savePromotion() {
  const e = {}
  if (!promos.form.name.trim()) e.name = 'Requerido'
  if (!promos.form.value)       e.value = 'Requerido'
  if (Object.keys(e).length) { promos.errors = e; return }
  promos.saving = true
  try {
    if (promos.editingId) {
      await adminConfigService.updatePromotion(promos.editingId, promos.form)
    } else {
      await adminConfigService.createPromotion(promos.form)
    }
    promotions.value = await adminConfigService.getPromotions()
    promos.showForm = false
  } finally {
    promos.saving = false
  }
}
async function deletePromotion(id) {
  await adminConfigService.deletePromotion(id)
  promotions.value = promotions.value.filter(p => p.id !== id)
}

// ─── SHIPPING ZONES ───
const shippingZones = ref([])
const zones = reactive({
  showForm: false, editingId: null, saving: false,
  form: { name: '', provinces: [], baseCost: null, costPerKg: null, freeShippingThreshold: 0 },
  errors: {},
})

function openZoneForm(zone = null) {
  zones.editingId = zone?.id ?? null
  zones.form = zone ? { ...zone, provinces: [...zone.provinces] } : { name: '', provinces: [], baseCost: null, costPerKg: null, freeShippingThreshold: 0 }
  zones.errors = {}
  zones.showForm = true
}
async function saveZone() {
  if (!zones.form.name.trim()) { zones.errors = { name: 'Requerido' }; return }
  zones.saving = true
  try {
    if (zones.editingId) {
      await adminConfigService.updateShippingZone(zones.editingId, zones.form)
    } else {
      await adminConfigService.createShippingZone(zones.form)
    }
    shippingZones.value = await adminConfigService.getShippingZones()
    zones.showForm = false
  } finally {
    zones.saving = false
  }
}
async function deleteZone(id) {
  await adminConfigService.deleteShippingZone(id)
  shippingZones.value = shippingZones.value.filter(z => z.id !== id)
}

// ─── PICKUP ───
const pickup = reactive({
  saving: false, saved: false, error: null,
  pickupId: null,
  form: { name: 'Local central', address: '', hours: '', phone: '', notes: '', active: true },
})

async function savePickup() {
  pickup.saving = true
  pickup.error  = null
  pickup.saved  = false
  try {
    await adminConfigService.updatePickupPoint(pickup.pickupId, pickup.form)
    pickup.saved = true
    setTimeout(() => { pickup.saved = false }, 3000)
  } catch {
    pickup.error = 'No pudimos guardar el punto de retiro.'
  } finally {
    pickup.saving = false
  }
}

onMounted(async () => {
  try {
    const [cats_, promos_, zones_, pts] = await Promise.all([
      adminConfigService.getCategories(),
      adminConfigService.getPromotions(),
      adminConfigService.getShippingZones(),
      adminConfigService.getPickupPoints(),
    ])
    categories.value    = cats_
    promotions.value    = promos_
    shippingZones.value = zones_
    if (pts[0]) {
      pickup.pickupId = pts[0].id
      pickup.form     = { ...pts[0] }
    }
  } catch {
    // continuar con listas vacías
  } finally {
    cats.loading = false
  }
})

function formatPrice(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n ?? 0)
}
function formatShortDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}
</script>

<style scoped>
.admin-page { min-height: calc(100vh - 64px); background: #f9fafb; padding: 2rem 1rem; }
.admin-container { max-width: 900px; margin: 0 auto; }
.page-title { font-size: 1.35rem; font-weight: 700; color: #111827; margin-bottom: 1.25rem; }

/* Tabs */
.tabs { display: flex; gap: .25rem; border-bottom: 1.5px solid #e5e7eb; margin-bottom: 1.5rem; }
.tab-btn { background: none; border: none; border-bottom: 2px solid transparent; padding: .625rem 1rem; font-size: .875rem; font-weight: 500; color: #6b7280; cursor: pointer; margin-bottom: -1.5px; transition: color .15s, border-color .15s; }
.tab-btn:hover { color: #374151; }
.tab-btn.active { color: #111827; border-bottom-color: #111827; font-weight: 700; }

/* Section header */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.section-sub { font-size: .82rem; color: #6b7280; }

/* Item list */
.item-list { display: flex; flex-direction: column; gap: .5rem; margin-bottom: .875rem; }
.list-row { display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid #e5e7eb; border-radius: .6rem; padding: .875rem 1.25rem; gap: 1rem; flex-wrap: wrap; }
.row-info { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.row-name { font-weight: 600; color: #111827; font-size: .875rem; }
.row-slug { font-size: .75rem; color: #9ca3af; }
.row-actions { display: flex; align-items: center; gap: .75rem; flex-shrink: 0; }
.order-badge { font-size: .72rem; color: #9ca3af; white-space: nowrap; }
.date-range { font-size: .72rem; color: #9ca3af; white-space: nowrap; }
.promo-type { font-size: .78rem; color: #374151; }
.promo-cond { font-size: .72rem; color: #6b7280; }
.zone-detail { font-size: .75rem; color: #6b7280; }
.zone-detail.free { color: #166534; font-weight: 500; }

.action-btn { background: none; border: none; font-size: .8rem; font-weight: 500; cursor: pointer; color: #2563eb; padding: 0; }
.action-btn:hover { text-decoration: underline; }
.action-btn.danger { color: #ef4444; }

/* Status pill */
.status-pill { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; padding: .15rem .5rem; border-radius: .375rem; }
.pill-on  { background: #dcfce7; color: #166534; }
.pill-off { background: #f3f4f6; color: #6b7280; }

/* Inline form */
.inline-form { background: #fff; border: 1.5px solid #2563eb; border-radius: .75rem; padding: 1.25rem; }
.inline-form.always-open { border-color: #e5e7eb; }
.form-sub { font-size: .875rem; font-weight: 700; color: #111827; margin-bottom: .875rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.field { display: flex; flex-direction: column; gap: .3rem; }
.field.full { grid-column: 1 / -1; }
.field.narrow { grid-column: auto; }
.field-label { font-size: .78rem; font-weight: 600; color: #374151; }
.field-input { padding: .6rem .75rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; font-size: .875rem; color: #111827; background: #fff; }
.field-input:focus { outline: none; border-color: #2563eb; }
.field-input.error { border-color: #ef4444; }
.field-input.textarea { resize: vertical; font-family: inherit; line-height: 1.5; }
.field-error { font-size: .72rem; color: #ef4444; }

.provinces-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: .35rem; max-height: 180px; overflow-y: auto; padding: .5rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; }
.province-check { display: flex; align-items: center; gap: .35rem; font-size: .8rem; color: #374151; cursor: pointer; }
.province-check input { accent-color: #111827; }

.toggle-label { display: flex; align-items: center; gap: .5rem; cursor: pointer; font-size: .875rem; color: #374151; user-select: none; padding-top: 1.25rem; }
.toggle { width: 40px; height: 22px; border-radius: 11px; background: #e5e7eb; position: relative; transition: background .2s; flex-shrink: 0; }
.toggle.on { background: #111827; }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.toggle.on .toggle-thumb { transform: translateX(18px); }

.inline-form-actions { display: flex; justify-content: flex-end; gap: .75rem; margin-top: .875rem; }

/* Buttons */
.btn-primary { display: inline-flex; align-items: center; gap: .4rem; padding: .65rem 1.5rem; background: #111827; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .875rem; cursor: pointer; transition: background .15s; }
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-secondary { padding: .65rem 1.25rem; background: #fff; color: #374151; border: 1px solid #e5e7eb; border-radius: .6rem; font-weight: 600; font-size: .875rem; cursor: pointer; }
.btn-secondary:hover { border-color: #374151; }

/* Skeleton */
.sk-row-item { display: flex; gap: .75rem; align-items: center; padding: .75rem; background: #fff; border: 1px solid #e5e7eb; border-radius: .6rem; margin-bottom: .5rem; }
.sk-block { background: #f3f4f6; border-radius: .375rem; animation: pulse 1.5s ease-in-out infinite; height: 14px; }
.sk-line.wide { width: 200px; }
.sk-line.narrow { width: 80px; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }

/* Feedback */
.save-error { padding: .65rem .875rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: .5rem; font-size: .82rem; color: #991b1b; margin-bottom: .75rem; }
.save-ok { padding: .65rem .875rem; background: #dcfce7; border: 1px solid #bbf7d0; border-radius: .5rem; font-size: .82rem; color: #166534; margin-top: .75rem; }

/* Empty */
.state-empty { text-align: center; padding: 2rem 1rem; background: #fff; border: 1px solid #e5e7eb; border-radius: .6rem; margin-bottom: .875rem; }
.state-empty p { font-size: .9rem; color: #9ca3af; }

/* Transitions */
.slide-enter-active, .slide-leave-active { transition: all .25s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; }
.slide-enter-to, .slide-leave-from { opacity: 1; max-height: 1000px; }

/* Spinner */
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .admin-page { padding: 1.25rem .75rem; }
  .form-row { grid-template-columns: 1fr; }
  .field.full { grid-column: auto; }
  .tabs { overflow-x: auto; }
}
</style>
