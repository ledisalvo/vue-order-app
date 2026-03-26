<template>
  <div class="step-notes">
    <h2 class="step-title">Notas para el vendedor</h2>
    <p class="step-desc">Opcional. Podés dejarle un mensaje al vendedor sobre tu pedido.</p>

    <div class="field">
      <textarea
        v-model="notes"
        class="notes-input"
        rows="5"
        maxlength="500"
        placeholder="Ej: Por favor envolver para regalo, dejar en portería si no hay nadie..."
      ></textarea>
      <p class="char-count">{{ notes.length }} / 500</p>
    </div>

    <div class="step-actions">
      <button class="btn-secondary" @click="emit('back')">Volver</button>
      <button class="btn-primary" @click="emit('next', notes)">Continuar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['next', 'back'])
const notes = ref('')
</script>

<style scoped>
.step-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin-bottom: .35rem; }
.step-desc  { font-size: .875rem; color: #6b7280; margin-bottom: 1.25rem; }
.field { display: flex; flex-direction: column; gap: .4rem; }
.notes-input { padding: .75rem; border: 1.5px solid #e5e7eb; border-radius: .6rem; font-size: .875rem; color: #111827; resize: vertical; font-family: inherit; line-height: 1.5; transition: border-color .15s; }
.notes-input:focus { outline: none; border-color: #2563eb; }
.char-count { font-size: .75rem; color: #9ca3af; text-align: right; }
.step-actions { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.75rem; }
.btn-primary { padding: .7rem 2rem; background: #111827; color: #fff; border: none; border-radius: .6rem; font-weight: 700; font-size: .9rem; cursor: pointer; transition: background .15s; }
.btn-primary:hover { background: #2563eb; }
.btn-secondary { padding: .7rem 1.25rem; background: #fff; color: #374151; border: 1px solid #e5e7eb; border-radius: .6rem; font-weight: 600; font-size: .9rem; cursor: pointer; }
.btn-secondary:hover { border-color: #374151; }
</style>
