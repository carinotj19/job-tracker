<template>
  <div class="toast-container">
    <ToastMessage
      v-for="toast in toasts"
      :key="toast.id"
      v-bind="toast"
      @close="closeToast"
      @action="onAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import ToastMessage from './ToastMessage.vue';

// Define toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Define toast interface
export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: Function;
  actionText?: string;
}

// Create toasts array to hold all current toasts
const toasts = ref<Toast[]>([]);

// Add a toast to the array
function addToast(toast: Omit<Toast, 'id'>) {
  const id = uuidv4();
  toasts.value.push({
    id,
    ...toast
  });
  return id;
}

// Remove a toast from the array
function closeToast(id: string) {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
}

// Handle toast action
function onAction(id: string) {
  closeToast(id);
}

// Helper functions to add specific types of toasts
function success(message: string, options = {}) {
  return addToast({ message, type: 'success', ...options });
}

function error(message: string, options = {}) {
  return addToast({ message, type: 'error', ...options });
}

function warning(message: string, options = {}) {
  return addToast({ message, type: 'warning', ...options });
}

function info(message: string, options = {}) {
  return addToast({ message, type: 'info', ...options });
}

// Clear all toasts - useful when navigating or on signout
function clearAll() {
  toasts.value = [];
}

// Expose methods to parent components
defineExpose({
  addToast,
  success,
  error,
  warning,
  info,
  closeToast,
  clearAll
});

// Clean up when component is unmounted
onUnmounted(() => {
  clearAll();
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  max-width: 450px;
}
</style> 