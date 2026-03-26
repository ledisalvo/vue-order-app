<template>
  <div class="admin-page">
    <div class="admin-container">

      <!-- Skeleton -->
      <template v-if="loading">
        <div class="sk-block sk-title"></div>
        <div class="form-card">
          <div v-for="i in 4" :key="i" class="sk-field">
            <div class="sk-block sk-label"></div>
            <div class="sk-block sk-input"></div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="page-header">
          <RouterLink to="/admin/productos" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Productos
          </RouterLink>
          <h1 class="page-title">{{ isEditing ? 'Editar producto' : 'Nuevo producto' }}</h1>
        </div>

        <div class="form-layout">

          <!-- Datos básicos -->
          <section class="form-card">
            <h2 class="section-title">Datos básicos</h2>
            <div class="form-grid">
              <div class="field full">
                <label class="field-label">Nombre *</label>
                <input v-model="form.name" @input="autoSlug" class="field-input" :class="{ error: errors.name }" placeholder="Remera Oversize" />
                <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
              </div>
              <div class="field full">
                <label class="field-label">Slug *</label>
                <input v-model="form.slug" class="field-input" :class="{ error: errors.slug }" placeholder="remera-oversize" />
                <span class="field-hint">Generado automáticamente. Afecta la URL del producto.</span>
                <span v-if="errors.slug" class="field-error">{{ errors.slug }}</span>
              </div>
              <div class="field full">
                <label class="field-label">Descripción</label>
                <textarea v-model="form.description" class="field-input textarea" rows="3" placeholder="Descripción del producto…"></textarea>
              </div>
              <div class="field">
                <label class="field-label">Categoría *</label>
                <select v-model="form.category" class="field-input" :class="{ error: errors.category }">
                  <option value="">Seleccioná</option>
                  <option v-for="c in MOCK_CATEGORIES" :key="c" :value="c">{{ c }}</option>
                </select>
                <span v-if="errors.category" class="field-error">{{ errors.category }}</span>
              </div>
              <div class="field">
                <label class="field-label">Precio base (ARS) *</label>
                <input v-model.number="form.price" type="number" min="0" class="field-input" :class="{ error: errors.price }" placeholder="12500" />
                <span v-if="errors.price" class="field-error">{{ errors.price }}</span>
              </div>
              <div class="field">
                <label class="field-label">Precio original (tachado)</label>
                <input v-model.number="form.originalPrice" type="number" min="0" class="field-input" placeholder="Dejar vacío si no aplica" />
              </div>
              <div class="field">
                <label class="field-label">Stock *</label>
                <input v-model.number="form.stock" type="number" min="0" class="field-input" placeholder="0" />
              </div>
              <div class="field">
                <label class="field-label">Peso (gramos)</label>
                <input v-model.number="form.weight" type="number" min="0" class="field-input" placeholder="250" />
              </div>
              <div class="field full">
                <label class="toggle-row">
                  <div class="toggle" :class="{ on: form.active }" @click="form.active = !form.active">
                    <div class="toggle-thumb"></div>
                  </div>
                  <span>Producto activo (visible en el catálogo)</span>
                </label>
              </div>
            </div>
          </section>

          <!-- Imágenes -->
          <section class="form-card">
            <h2 class="section-title">
              Imágenes
              <span class="section-note">TODO(cloudinary): integración pendiente — Generic-Ecommerce#1</span>
            </h2>
            <div class="images-grid">
              <div
                v-for="(img, idx) in form.images"
                :key="idx"
                class="image-slot"
                :class="{ 'is-main': idx === form.mainImageIndex }"
              >
                <img :src="img.url" :alt="`Imagen ${idx + 1}`" />
                <div class="image-overlay">
                  <button class="img-btn" @click="form.mainImageIndex = idx" title="Marcar como principal">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </button>
                  <button class="img-btn danger" @click="removeImage(idx)" title="Eliminar imagen">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <span v-if="idx === form.mainImageIndex" class="main-badge">Principal</span>
              </div>
              <label class="image-upload-slot" :class="{ uploading: uploading }">
                <input type="file" accept="image/*" multiple class="file-input" @change="handleImageUpload" :disabled="uploading" />
                <span v-if="uploading" class="spinner spinner-dark"></span>
                <template v-else>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span>Subir imagen</span>
                </template>
              </label>
            </div>
          </section>

          <!-- Atributos y Variantes -->
          <section class="form-card">
            <h2 class="section-title">Atributos y variantes</h2>

            <!-- Atributos -->
            <div class="attrs-header">
              <p class="subsection-label">Atributos del producto</p>
              <button class="btn-ghost" @click="addAttribute">+ Agregar atributo</button>
            </div>
            <div v-for="(attr, aIdx) in form.attributes" :key="aIdx" class="attr-row">
              <input v-model="attr.name" class="field-input attr-name-input" placeholder="Nombre (ej: Talle)" />
              <div class="attr-options">
                <span
                  v-for="(opt, oIdx) in attr.options"
                  :key="oIdx"
                  class="option-chip"
                >
                  {{ opt }}
                  <button class="chip-remove" @click="removeOption(aIdx, oIdx)">×</button>
                </span>
                <input
                  class="option-input"
                  :placeholder="attr.options.length ? 'Agregar opción…' : 'Ej: S, M, L…'"
                  @keydown.enter.prevent="addOption(aIdx, $event)"
                  @keydown.comma.prevent="addOption(aIdx, $event)"
                />
              </div>
              <button class="btn-icon-remove" @click="removeAttribute(aIdx)" title="Eliminar atributo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <p class="field-hint" v-if="form.attributes.length">
              Presioná Enter o coma para agregar cada opción.
            </p>

            <!-- Botón generar variantes -->
            <button
              v-if="form.attributes.some(a => a.options.length)"
              class="btn-secondary mt-1"
              @click="generateVariants"
            >
              Regenerar combinaciones de variantes
            </button>
            <p v-if="form.variants.length" class="field-hint mt-small">
              {{ form.variants.length }} variante{{ form.variants.length !== 1 ? 's' : '' }}. Podés ajustar SKU, precio y stock individualmente.
            </p>

            <!-- Tabla de variantes -->
            <div v-if="form.variants.length" class="variants-table-wrap">
              <table class="variants-table">
                <thead>
                  <tr>
                    <th>Variante</th>
                    <th>SKU</th>
                    <th>Precio (vacío = hereda)</th>
                    <th>Stock</th>
                    <th>Activa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(v, vIdx) in form.variants" :key="vIdx">
                    <td class="variant-label">{{ formatVariantLabel(v.attributes) }}</td>
                    <td><input v-model="v.sku" class="variant-input" placeholder="SKU-001" /></td>
                    <td><input v-model.number="v.priceOverride" type="number" min="0" class="variant-input" placeholder="—" /></td>
                    <td><input v-model.number="v.stock" type="number" min="0" class="variant-input" /></td>
                    <td>
                      <div class="toggle small" :class="{ on: v.active }" @click="v.active = !v.active">
                        <div class="toggle-thumb"></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- Error global -->
          <div v-if="saveError" class="save-error">{{ saveError }}</div>

          <!-- Acciones -->
          <div class="form-actions">
            <RouterLink to="/admin/productos" class="btn-secondary">Cancelar</RouterLink>
            <button class="btn-primary" :disabled="saving" @click="submit">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear producto' }}
            </button>
          </div>

        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminProductService } from '@/services/api'

const USE_MOCK_IMAGES = true // TODO(cloudinary): cambiar a false cuando Generic-Ecommerce#1 esté listo

const route  = useRoute()
const router = useRouter()

const isEditing = computed(() => !!route.params.id)
const loading   = ref(isEditing.value)
const saving    = ref(false)
const uploading = ref(false)
const saveError = ref(null)
const errors    = ref({})

const MOCK_CATEGORIES = ['Remeras', 'Pantalones', 'Buzos', 'Calzas', 'Camperas', 'Accesorios']

const EMPTY_FORM = () => ({
  name: '', slug: '', description: '', category: '',
  price: null, originalPrice: null, weight: null, stock: 0,
  active: true,
  images: [], mainImageIndex: 0,
  attributes: [], variants: [],
})

const form = ref(EMPTY_FORM())

const MOCK_PRODUCT = {
  id: 'p1', name: 'Remera Oversize', slug: 'remera-oversize',
  description: 'Remera de algodón premium con corte oversized.',
  category: 'Remeras', price: 12500, originalPrice: 15000, weight: 200,
  active: true, images: [], mainImageIndex: 0,
  attributes: [
    { name: 'Talle', options: ['S','M','L','XL'] },
    { name: 'Color', options: ['Negro','Blanco','Gris'] },
  ],
  variants: [
    { attributes: { Talle: 'S', Color: 'Negro'  }, sku: 'REM-S-NEG', priceOverride: null, stock: 5,  active: true },
    { attributes: { Talle: 'M', Color: 'Negro'  }, sku: 'REM-M-NEG', priceOverride: null, stock: 10, active: true },
    { attributes: { Talle: 'L', Color: 'Blanco' }, sku: 'REM-L-BLA', priceOverride: null, stock: 0,  active: false },
  ],
}

onMounted(async () => {
  if (isEditing.value) {
    try {
      const data = await adminProductService.getById(route.params.id)
      form.value = { ...EMPTY_FORM(), ...data }
    } catch {
      saveError.value = 'No pudimos cargar el producto.'
    } finally {
      loading.value = false
    }
  }
})

// Auto-generate slug from name
function autoSlug() {
  if (isEditing.value) return
  form.value.slug = form.value.name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Images
function removeImage(idx) {
  form.value.images.splice(idx, 1)
  if (form.value.mainImageIndex >= form.value.images.length) {
    form.value.mainImageIndex = 0
  }
}

async function handleImageUpload(e) {
  const files = Array.from(e.target.files)
  if (!files.length) return
  uploading.value = true
  try {
    for (const file of files) {
      if (USE_MOCK_IMAGES) {
        await new Promise(r => setTimeout(r, 300))
        form.value.images.push({ url: URL.createObjectURL(file), publicId: 'mock_' + Date.now() })
      } else {
        const result = await adminProductService.uploadImage(file)
        form.value.images.push(result)
      }
    }
  } finally {
    uploading.value = false
    e.target.value = ''
  }
}

// Attributes
function addAttribute() {
  form.value.attributes.push({ name: '', options: [] })
}
function removeAttribute(idx) {
  form.value.attributes.splice(idx, 1)
  generateVariants()
}
function addOption(attrIdx, e) {
  const val = e.target.value.replace(',', '').trim()
  if (val && !form.value.attributes[attrIdx].options.includes(val)) {
    form.value.attributes[attrIdx].options.push(val)
    generateVariants()
  }
  e.target.value = ''
}
function removeOption(attrIdx, optIdx) {
  form.value.attributes[attrIdx].options.splice(optIdx, 1)
  generateVariants()
}

// Variants — cartesian product of attributes
function generateVariants() {
  const attrs = form.value.attributes.filter(a => a.name && a.options.length)
  if (!attrs.length) { form.value.variants = []; return }

  const combos = attrs.reduce((acc, attr) => {
    if (!acc.length) return attr.options.map(o => ({ [attr.name]: o }))
    return acc.flatMap(c => attr.options.map(o => ({ ...c, [attr.name]: o })))
  }, [])

  // Preserve existing variant data by matching attributes
  const existing = form.value.variants
  form.value.variants = combos.map(combo => {
    const key = JSON.stringify(combo)
    const found = existing.find(v => JSON.stringify(v.attributes) === key)
    return found ?? { attributes: combo, sku: '', priceOverride: null, stock: 0, active: true }
  })
}

function formatVariantLabel(attrs) {
  return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(' / ')
}

// Validation
function validate() {
  const e = {}
  if (!form.value.name.trim())     e.name  = 'Requerido'
  if (!form.value.slug.trim())     e.slug  = 'Requerido'
  if (!form.value.price || form.value.price <= 0) e.price = 'Ingresá un precio válido'
  errors.value = e
  return !Object.keys(e).length
}

async function submit() {
  if (!validate()) return
  saving.value = true
  saveError.value = null
  try {
    const payload = { ...form.value }
    if (isEditing.value) {
      await adminProductService.update(route.params.id, payload)
    } else {
      await adminProductService.create(payload)
    }
    router.push('/admin/productos')
  } catch {
    saveError.value = 'No pudimos guardar el producto. Intentá de nuevo.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-page { min-height: calc(100vh - 64px); background: #f9fafb; padding: 2rem 1rem; }
.admin-container { max-width: 800px; margin: 0 auto; }

.back-link { display: inline-flex; align-items: center; gap: .35rem; font-size: .85rem; color: #6b7280; text-decoration: none; margin-bottom: .5rem; }
.back-link svg { width: 16px; height: 16px; }
.back-link:hover { color: #111827; }
.page-title { font-size: 1.25rem; font-weight: 700; color: #111827; }
.page-header { margin-bottom: 1.5rem; }

.form-layout { display: flex; flex-direction: column; gap: 1.25rem; }
.form-card { background: #fff; border: 1px solid #e5e7eb; border-radius: .75rem; padding: 1.5rem; }
.section-title { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; margin-bottom: 1.25rem; display: flex; align-items: center; gap: .75rem; }
.section-note { font-size: .7rem; color: #d97706; font-weight: 500; text-transform: none; letter-spacing: 0; }
.subsection-label { font-size: .78rem; font-weight: 600; color: #374151; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .875rem; }
.field { display: flex; flex-direction: column; gap: .3rem; }
.field.full { grid-column: 1 / -1; }
.field-label { font-size: .78rem; font-weight: 600; color: #374151; }
.field-hint { font-size: .72rem; color: #9ca3af; }
.field-input { padding: .6rem .75rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; font-size: .875rem; color: #111827; }
.field-input:focus { outline: none; border-color: #2563eb; }
.field-input.error { border-color: #ef4444; }
.field-input.textarea { resize: vertical; font-family: inherit; line-height: 1.5; }
.field-error { font-size: .72rem; color: #ef4444; }

.toggle-row { display: flex; align-items: center; gap: .75rem; cursor: pointer; user-select: none; font-size: .875rem; color: #374151; }
.toggle { width: 40px; height: 22px; border-radius: 11px; background: #e5e7eb; position: relative; transition: background .2s; flex-shrink: 0; }
.toggle.on { background: #111827; }
.toggle.small { width: 34px; height: 18px; border-radius: 9px; }
.toggle-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.toggle.on .toggle-thumb { transform: translateX(18px); }
.toggle.small .toggle-thumb { width: 14px; height: 14px; }
.toggle.small.on .toggle-thumb { transform: translateX(16px); }

/* Images */
.images-grid { display: flex; flex-wrap: wrap; gap: .75rem; }
.image-slot { position: relative; width: 96px; height: 96px; border-radius: .5rem; overflow: hidden; border: 2px solid #e5e7eb; }
.image-slot.is-main { border-color: #111827; }
.image-slot img { width: 100%; height: 100%; object-fit: cover; }
.image-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; gap: .4rem; opacity: 0; transition: opacity .15s; }
.image-slot:hover .image-overlay { opacity: 1; }
.img-btn { background: rgba(255,255,255,.9); border: none; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #374151; }
.img-btn svg { width: 14px; height: 14px; }
.img-btn.danger { color: #ef4444; }
.main-badge { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,.7); color: #fff; font-size: .65rem; font-weight: 700; text-align: center; padding: .15rem; }
.image-upload-slot {
  width: 96px; height: 96px; border-radius: .5rem; border: 1.5px dashed #d1d5db;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: .35rem; cursor: pointer; color: #9ca3af; font-size: .72rem; transition: border-color .15s;
}
.image-upload-slot:hover { border-color: #6b7280; color: #374151; }
.image-upload-slot svg { width: 22px; height: 22px; }
.image-upload-slot.uploading { opacity: .6; cursor: not-allowed; }
.file-input { display: none; }

/* Attributes */
.attrs-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: .875rem; }
.attr-row { display: flex; align-items: flex-start; gap: .625rem; margin-bottom: .75rem; }
.attr-name-input { width: 150px; flex-shrink: 0; }
.attr-options { flex: 1; display: flex; flex-wrap: wrap; gap: .35rem; padding: .45rem .625rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; min-height: 38px; align-items: center; }
.option-chip { display: inline-flex; align-items: center; gap: .25rem; background: #f3f4f6; border-radius: .3rem; padding: .15rem .4rem; font-size: .78rem; color: #374151; }
.chip-remove { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: .85rem; line-height: 1; padding: 0; }
.chip-remove:hover { color: #ef4444; }
.option-input { border: none; outline: none; font-size: .8rem; min-width: 100px; background: transparent; color: #374151; }
.btn-icon-remove { background: none; border: none; cursor: pointer; color: #9ca3af; padding: .4rem; }
.btn-icon-remove:hover { color: #ef4444; }
.btn-icon-remove svg { width: 16px; height: 16px; }
.btn-ghost { background: none; border: none; color: #2563eb; font-size: .82rem; font-weight: 500; cursor: pointer; }
.btn-ghost:hover { text-decoration: underline; }

/* Variants table */
.variants-table-wrap { margin-top: 1rem; overflow: auto; }
.variants-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
.variants-table th { padding: .5rem .625rem; text-align: left; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #6b7280; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
.variants-table td { padding: .45rem .625rem; border-bottom: 1px solid #f3f4f6; }
.variants-table tbody tr:last-child td { border-bottom: none; }
.variant-label { font-weight: 500; color: #374151; white-space: nowrap; }
.variant-input { width: 100%; padding: .35rem .5rem; border: 1px solid #e5e7eb; border-radius: .375rem; font-size: .8rem; color: #111827; }
.variant-input:focus { outline: none; border-color: #2563eb; }

/* Form actions */
.save-error { padding: .75rem 1rem; background: #fef2f2; border: 1px solid #fecaca; border-radius: .5rem; font-size: .85rem; color: #991b1b; }
.form-actions { display: flex; justify-content: flex-end; gap: .75rem; }
.btn-primary { display: inline-flex; align-items: center; gap: .4rem; padding: .7rem 1.75rem; background: #111827; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .9rem; cursor: pointer; transition: background .15s; text-decoration: none; }
.btn-primary:hover:not(:disabled) { background: #2563eb; }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }
.btn-secondary { padding: .7rem 1.25rem; background: #fff; color: #374151; border: 1px solid #e5e7eb; border-radius: .6rem; font-weight: 600; font-size: .9rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; }
.btn-secondary:hover { border-color: #374151; }
.mt-1 { margin-top: 1rem; }
.mt-small { margin-top: .4rem; }

/* Skeleton */
.sk-block { background: #f3f4f6; border-radius: .375rem; animation: pulse 1.5s ease-in-out infinite; }
.sk-title { height: 28px; width: 220px; margin-bottom: 1.5rem; }
.sk-field { margin-bottom: 1rem; }
.sk-label { height: 12px; width: 90px; margin-bottom: .4rem; }
.sk-input { height: 38px; width: 100%; }
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .45 } }

/* Spinner */
.spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .6s linear infinite; }
.spinner-dark { border-color: #e5e7eb; border-top-color: #374151; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .admin-page { padding: 1.25rem .75rem; }
  .form-card { padding: 1.1rem; }
  .form-grid { grid-template-columns: 1fr; }
  .field.full { grid-column: auto; }
  .attr-row { flex-direction: column; }
  .attr-name-input { width: 100%; }
}
</style>
