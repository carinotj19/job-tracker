<template>
  <Button
    :class="['loading-button', buttonClass]"
    :label="loading ? '' : label"
    :icon="icon"
    :disabled="disabled || loading"
    v-bind="$attrs"
    @click="handleClick"
  >
    <template v-if="loading">
      <div class="loading-indicator">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
      <span v-if="loadingText" class="loading-text">{{ loadingText }}</span>
    </template>
    <slot></slot>
  </Button>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import Button from 'primevue/button';

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  buttonClass: {
    type: String,
    default: ''
  },
  debounce: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['click']);
const { debounce } = toRefs(props);
const isClicked = ref(false);

function handleClick(event: Event) {
  if (debounce.value > 0 && !isClicked.value) {
    isClicked.value = true;
    setTimeout(() => {
      isClicked.value = false;
    }, debounce.value);
    
    emit('click', event);
  } else if (debounce.value === 0) {
    emit('click', event);
  }
}
</script>

<style scoped>
.loading-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  transition: all 0.2s ease;
}

.loading-button:not(:disabled) {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.loading-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.loading-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  animation: loading-bounce 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-text {
  margin-left: 8px;
  font-weight: 500;
}

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style> 