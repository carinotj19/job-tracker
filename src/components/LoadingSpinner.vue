<template>
  <div 
    v-if="loading" 
    class="loading-container"
    :class="{ 'loading-overlay': overlay, 'loading-fullscreen': fullscreen }"
  >
    <div class="loading-spinner">
      <div class="spinner-animation">
        <svg class="loading-circle" viewBox="25 25 50 50">
          <circle class="loading-path" cx="50" cy="50" r="20" fill="none" stroke-width="4" />
        </svg>
      </div>
      <div v-if="message" class="loading-message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  loading: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: ''
  },
  overlay: {
    type: Boolean,
    default: false
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.85);
  z-index: 20;
  backdrop-filter: blur(2px);
  border-radius: 0.5rem;
}

.loading-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 9999;
  backdrop-filter: blur(3px);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner-animation {
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 50%;
  padding: 1rem;
  margin-bottom: 1rem;
}

.loading-circle {
  width: 48px;
  height: 48px;
  animation: loading-rotate 2s linear infinite;
}

.loading-path {
  stroke: #3b82f6;
  stroke-linecap: round;
  animation: loading-dash 1.5s ease-in-out infinite;
}

.loading-message {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  background-color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  text-align: center;
  max-width: 250px;
}

@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style> 