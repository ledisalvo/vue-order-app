<template>
  <div class="gallery">
    <!-- Imagen principal -->
    <div class="gallery-main">
      <div v-if="images.length === 0" class="gallery-placeholder">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span>Sin imagen</span>
      </div>
      <img v-else :src="images[activeIndex]" :alt="alt" class="gallery-img" />
    </div>

    <!-- Miniaturas -->
    <div v-if="images.length > 1" class="gallery-thumbs">
      <button
        v-for="(img, i) in images"
        :key="i"
        class="thumb-btn"
        :class="{ active: activeIndex === i }"
        @click="activeIndex = i"
      >
        <img :src="img" :alt="`${alt} ${i + 1}`" class="thumb-img" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  images: { type: Array, default: () => [] },
  alt:    { type: String, default: 'Producto' },
})

const activeIndex = ref(0)
</script>

<style scoped>
.gallery { display: flex; flex-direction: column; gap: .75rem; }

.gallery-main {
  aspect-ratio: 1 / 1;
  border-radius: .75rem;
  overflow: hidden;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}
.gallery-img { width: 100%; height: 100%; object-fit: cover; }

.gallery-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .75rem;
  color: #d1d5db;
}
.gallery-placeholder svg { width: 64px; height: 64px; }
.gallery-placeholder span { font-size: .8rem; color: #9ca3af; }

.gallery-thumbs {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}
.thumb-btn {
  width: 64px;
  height: 64px;
  border-radius: .5rem;
  overflow: hidden;
  border: 2px solid transparent;
  background: #f3f4f6;
  cursor: pointer;
  padding: 0;
  transition: border-color .15s;
}
.thumb-btn.active { border-color: #2563eb; }
.thumb-img { width: 100%; height: 100%; object-fit: cover; }
</style>
