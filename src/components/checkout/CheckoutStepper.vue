<template>
  <nav class="stepper" aria-label="Progreso del checkout">
    <div
      v-for="(s, i) in steps"
      :key="s.n"
      class="stepper-item"
      :class="{
        completed: current > s.n,
        active:    current === s.n,
      }"
    >
      <button
        class="stepper-circle"
        :disabled="s.n > current"
        :aria-current="current === s.n ? 'step' : undefined"
        @click="s.n < current && emit('go', s.n)"
      >
        <svg v-if="current > s.n" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span v-else>{{ s.n }}</span>
      </button>
      <span class="stepper-label">{{ s.label }}</span>
      <div v-if="i < steps.length - 1" class="stepper-line" :class="{ done: current > s.n }"></div>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  steps:   { type: Array,  required: true },
  current: { type: Number, required: true },
})
const emit = defineEmits(['go'])
</script>

<style scoped>
.stepper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  margin-bottom: 2.5rem;
  overflow-x: auto;
  padding: .25rem 0;
}

.stepper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .4rem;
  position: relative;
  flex: 1;
}

.stepper-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .8rem;
  font-weight: 700;
  color: #9ca3af;
  cursor: default;
  transition: all .2s;
  position: relative;
  z-index: 1;
}
.stepper-circle svg { width: 14px; height: 14px; }

.stepper-item.completed .stepper-circle {
  background: #111827;
  border-color: #111827;
  color: #fff;
  cursor: pointer;
}
.stepper-item.completed .stepper-circle:hover { background: #2563eb; border-color: #2563eb; }
.stepper-item.active .stepper-circle {
  border-color: #111827;
  color: #111827;
  box-shadow: 0 0 0 4px rgba(17,24,39,.1);
}

.stepper-label {
  font-size: .72rem;
  font-weight: 500;
  color: #9ca3af;
  white-space: nowrap;
  text-align: center;
}
.stepper-item.active .stepper-label    { color: #111827; font-weight: 700; }
.stepper-item.completed .stepper-label { color: #374151; }

.stepper-line {
  position: absolute;
  top: 18px;
  left: calc(50% + 18px);
  right: calc(-50% + 18px);
  height: 2px;
  background: #e5e7eb;
  transition: background .3s;
  z-index: 0;
}
.stepper-line.done { background: #111827; }

@media (max-width: 480px) {
  .stepper-label { display: none; }
  .stepper-circle { width: 30px; height: 30px; font-size: .75rem; }
}
</style>
