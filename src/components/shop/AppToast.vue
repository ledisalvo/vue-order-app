<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          @click="dismiss(toast.id)"
        >
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts, dismiss } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .75rem 1.1rem;
  border-radius: .6rem;
  font-size: .875rem;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
  pointer-events: all;
  cursor: pointer;
  max-width: 320px;
}
.toast svg { width: 18px; height: 18px; flex-shrink: 0; }

.toast--success { background: #111827; color: #fff; }
.toast--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
.toast--info    { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

.toast-enter-active { transition: all .25s ease-out; }
.toast-leave-active { transition: all .2s ease-in; }
.toast-enter-from   { opacity: 0; transform: translateY(12px); }
.toast-leave-to     { opacity: 0; transform: translateX(16px); }
</style>
