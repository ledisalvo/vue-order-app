<template>
  <div class="step-billing">
    <h2 class="step-title">Facturación</h2>

    <label class="toggle-row">
      <div class="toggle" :class="{ on: needs }" @click="needs = !needs">
        <div class="toggle-thumb"></div>
      </div>
      <span>Necesito factura</span>
    </label>

    <Transition name="slide">
      <div v-if="needs" class="invoice-fields">
        <div class="field">
          <label class="field-label">CUIT *</label>
          <input
            v-model="form.cuit"
            class="field-input"
            :class="{ error: errors.cuit }"
            placeholder="20-12345678-9"
            maxlength="13"
          />
          <span v-if="errors.cuit" class="field-error">{{ errors.cuit }}</span>
        </div>
        <div class="field">
          <label class="field-label">Razón social *</label>
          <input
            v-model="form.razonSocial"
            class="field-input"
            :class="{ error: errors.razonSocial }"
            placeholder="Empresa S.A."
          />
          <span v-if="errors.razonSocial" class="field-error">{{ errors.razonSocial }}</span>
        </div>
      </div>
    </Transition>

    <p v-if="!needs" class="no-invoice-note">
      Se emitirá ticket de consumidor final.
    </p>

    <div class="step-actions">
      <button class="btn-secondary" @click="emit('back')">Volver</button>
      <button class="btn-primary" @click="handleContinue">Continuar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['next', 'back'])

const needs  = ref(false)
const form   = ref({ cuit: '', razonSocial: '' })
const errors = ref({ cuit: '', razonSocial: '' })

function handleContinue() {
  errors.value = { cuit: '', razonSocial: '' }
  if (needs.value) {
    let ok = true
    if (!form.value.cuit.trim())        { errors.value.cuit = 'El CUIT es requerido'; ok = false }
    if (!form.value.razonSocial.trim()) { errors.value.razonSocial = 'La razón social es requerida'; ok = false }
    if (!ok) return
  }
  emit('next', { needs: needs.value, data: { ...form.value } })
}
</script>

<style scoped>
.step-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin-bottom: 1.5rem; }

.toggle-row { display: flex; align-items: center; gap: .875rem; cursor: pointer; user-select: none; margin-bottom: 1.25rem; font-size: .95rem; color: #374151; font-weight: 500; }
.toggle { width: 44px; height: 24px; border-radius: 12px; background: #e5e7eb; position: relative; transition: background .2s; flex-shrink: 0; }
.toggle.on { background: #111827; }
.toggle-thumb { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2); }
.toggle.on .toggle-thumb { transform: translateX(20px); }

.invoice-fields { display: flex; flex-direction: column; gap: .875rem; }
.field { display: flex; flex-direction: column; gap: .3rem; }
.field-label { font-size: .78rem; font-weight: 600; color: #374151; }
.field-input { padding: .6rem .75rem; border: 1.5px solid #e5e7eb; border-radius: .5rem; font-size: .875rem; color: #111827; }
.field-input:focus { outline: none; border-color: #2563eb; }
.field-input.error { border-color: #ef4444; }
.field-error { font-size: .72rem; color: #ef4444; }

.no-invoice-note { font-size: .85rem; color: #9ca3af; padding: .75rem 1rem; background: #f9fafb; border-radius: .5rem; }

.slide-enter-active, .slide-leave-active { transition: all .25s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; }
.slide-enter-to, .slide-leave-from { opacity: 1; max-height: 300px; }

.step-actions { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.75rem; }
.btn-primary { padding: .7rem 2rem; background: #111827; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .9rem; cursor: pointer; transition: background .15s; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { padding: .7rem 1.25rem; background: #fff; color: #374151; border: 1px solid #e5e7eb; border-radius: .6rem; font-weight: 600; font-size: .9rem; cursor: pointer; transition: border-color .15s; }
.btn-secondary:hover { border-color: #374151; }
</style>
