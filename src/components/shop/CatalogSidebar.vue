<template>
  <aside class="sidebar">

    <!-- Categorías -->
    <section class="sidebar-section">
      <h3 class="sidebar-title">Categorías</h3>
      <ul class="sidebar-list">
        <li>
          <button
            class="sidebar-item"
            :class="{ active: !modelValue.category }"
            @click="emit('update:modelValue', { ...modelValue, category: null })"
          >
            Todas <span class="sidebar-count">{{ totalCount }}</span>
          </button>
        </li>
        <li v-for="cat in categories" :key="cat.slug">
          <button
            class="sidebar-item"
            :class="{ active: modelValue.category === cat.slug }"
            @click="emit('update:modelValue', { ...modelValue, category: cat.slug })"
          >
            {{ cat.name }} <span class="sidebar-count">{{ cat.count }}</span>
          </button>
        </li>
      </ul>
    </section>

    <!-- Precio -->
    <section class="sidebar-section">
      <h3 class="sidebar-title">Precio</h3>
      <div class="price-inputs">
        <div class="price-field">
          <label class="price-label">Mínimo</label>
          <input
            type="number"
            class="price-input"
            placeholder="$ 0"
            :value="modelValue.priceMin"
            @input="emit('update:modelValue', { ...modelValue, priceMin: +$event.target.value || null })"
          />
        </div>
        <div class="price-field">
          <label class="price-label">Máximo</label>
          <input
            type="number"
            class="price-input"
            placeholder="$ ∞"
            :value="modelValue.priceMax"
            @input="emit('update:modelValue', { ...modelValue, priceMax: +$event.target.value || null })"
          />
        </div>
      </div>
    </section>

    <!-- Stock -->
    <section class="sidebar-section">
      <h3 class="sidebar-title">Disponibilidad</h3>
      <label class="checkbox-item">
        <input
          type="checkbox"
          :checked="modelValue.inStock"
          @change="emit('update:modelValue', { ...modelValue, inStock: $event.target.checked })"
        />
        Solo con stock
      </label>
    </section>

    <!-- Reset -->
    <button v-if="hasActiveFilters" class="btn-reset" @click="resetFilters">
      Limpiar filtros
    </button>

  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  totalCount: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue'])

const hasActiveFilters = computed(() =>
  props.modelValue.category || props.modelValue.priceMin || props.modelValue.priceMax || props.modelValue.inStock
)

function resetFilters() {
  emit('update:modelValue', { category: null, priceMin: null, priceMax: null, inStock: false })
}
</script>

<style scoped>
.sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

.sidebar-section {}
.sidebar-title {
  font-size: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #6b7280;
  margin-bottom: .75rem;
}

.sidebar-list { list-style: none; display: flex; flex-direction: column; gap: .1rem; }
.sidebar-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: .4rem .5rem;
  background: none;
  border: none;
  border-radius: .375rem;
  font-size: .875rem;
  color: #374151;
  cursor: pointer;
  text-align: left;
  transition: background .1s, color .1s;
}
.sidebar-item:hover { background: #f3f4f6; }
.sidebar-item.active { background: #eff6ff; color: #2563eb; font-weight: 600; }

.sidebar-count {
  font-size: .75rem;
  color: #9ca3af;
  font-weight: 400;
}
.sidebar-item.active .sidebar-count { color: #93c5fd; }

/* Precio */
.price-inputs { display: flex; gap: .5rem; }
.price-field { flex: 1; display: flex; flex-direction: column; gap: .25rem; }
.price-label { font-size: .7rem; color: #9ca3af; }
.price-input {
  width: 100%;
  padding: .4rem .5rem;
  border: 1px solid #e5e7eb;
  border-radius: .375rem;
  font-size: .8rem;
  color: #111827;
}
.price-input:focus { outline: none; border-color: #2563eb; }

/* Checkbox */
.checkbox-item {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .875rem;
  color: #374151;
  cursor: pointer;
}
.checkbox-item input { accent-color: #2563eb; width: 15px; height: 15px; }

/* Reset */
.btn-reset {
  padding: .5rem;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: .5rem;
  font-size: .8rem;
  color: #6b7280;
  cursor: pointer;
  transition: border-color .15s, color .15s;
}
.btn-reset:hover { border-color: #dc2626; color: #dc2626; }
</style>
