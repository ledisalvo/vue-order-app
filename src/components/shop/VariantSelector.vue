<template>
  <div class="variant-selector">
    <div v-for="attr in attributes" :key="attr.name" class="attr-group">
      <div class="attr-label">
        {{ attr.name }}
        <span v-if="modelValue[attr.name]" class="attr-selected">: {{ modelValue[attr.name] }}</span>
      </div>
      <div class="attr-options">
        <button
          v-for="value in attr.values"
          :key="value"
          class="attr-btn"
          :class="{
            active: modelValue[attr.name] === value,
            disabled: isOptionUnavailable(attr.name, value),
          }"
          :disabled="isOptionUnavailable(attr.name, value)"
          :title="isOptionUnavailable(attr.name, value) ? 'Sin stock' : ''"
          @click="selectOption(attr.name, value)"
        >
          {{ value }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  attributes: { type: Array, default: () => [] }, // [{name, values[]}]
  variants:   { type: Array, default: () => [] },  // [{id, attributes{}, stock, priceOverride}]
  modelValue: { type: Object, default: () => ({}) }, // {AttrName: selectedValue}
})

const emit = defineEmits(['update:modelValue'])

function selectOption(attrName, value) {
  emit('update:modelValue', { ...props.modelValue, [attrName]: value })
}

// Una opción está no disponible si no existe ninguna variante con stock
// que incluya esa combinación (manteniendo las selecciones actuales de otros atributos)
function isOptionUnavailable(attrName, value) {
  return !props.variants.some(v => {
    if (v.stock === 0) return false
    if (v.attributes[attrName] !== value) return false
    // Verificar que las demás selecciones actuales son compatibles
    for (const [key, selected] of Object.entries(props.modelValue)) {
      if (key === attrName) continue
      if (selected && v.attributes[key] !== selected) return false
    }
    return true
  })
}
</script>

<style scoped>
.variant-selector { display: flex; flex-direction: column; gap: 1.25rem; }

.attr-group {}
.attr-label {
  font-size: .875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: .6rem;
}
.attr-selected { font-weight: 400; color: #6b7280; }

.attr-options { display: flex; flex-wrap: wrap; gap: .5rem; }

.attr-btn {
  padding: .4rem .85rem;
  border: 1.5px solid #e5e7eb;
  border-radius: .4rem;
  background: #fff;
  font-size: .85rem;
  color: #374151;
  cursor: pointer;
  transition: border-color .15s, background .15s, color .15s;
  position: relative;
}
.attr-btn:hover:not(.disabled) {
  border-color: #111827;
  background: #f9fafb;
}
.attr-btn.active {
  border-color: #111827;
  background: #111827;
  color: #fff;
}
.attr-btn.disabled {
  opacity: .4;
  cursor: not-allowed;
  text-decoration: line-through;
}
</style>
