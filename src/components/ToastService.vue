<template>
  <div class="toast-container">
    <TransitionGroup name="toast-fade">
      <div 
        v-for="toast in toastStore.toasts" 
        :key="toast.id"
        class="toast-message"
        :class="[`toast-${toast.type}`, { 'with-action': toast.action }]"
      >
        <div class="toast-icon">
          <i class="pi" :class="getIconClass(toast.type)"></i>
        </div>
        <div class="toast-content">
          <div class="toast-title" v-if="toast.title">{{ toast.title }}</div>
          <div class="toast-text">{{ toast.message }}</div>
        </div>
        <button 
          v-if="toast.action" 
          @click="handleAction(toast)"
          class="toast-action"
        >
          {{ toast.actionText || 'Undo' }}
        </button>
        <button 
          @click="closeToast(toast.id)"
          class="toast-close"
          aria-label="Close"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useToastStore, Toast } from '../stores/toast';

// Get the toast store
const toastStore = useToastStore();

// Mapping for toast type to icon class
function getIconClass(type: string): string {
  switch (type) {
    case 'success': return 'pi-check-circle';
    case 'error': return 'pi-times-circle';
    case 'warning': return 'pi-exclamation-triangle';
    default: return 'pi-info-circle';
  }
}

// Close a toast
function closeToast(id: string): void {
  toastStore.removeToast(id);
}

// Handle toast action
function handleAction(toast: Toast): void {
  if (toast.action && typeof toast.action === 'function') {
    toast.action();
  }
  closeToast(toast.id);
}

// Set up auto-close timers for toasts
const toastTimers = new Map<string, number>();

// Watch for new toasts to set timers
onMounted(() => {
  // Set up a watcher for the toasts array
  const stopWatch = watch(
    () => [...toastStore.toasts],
    (newToasts: Toast[], oldToasts: Toast[]) => {
      // Find new toasts
      const newIds = new Set(newToasts.map((t: Toast) => t.id));
      const oldIds = new Set(oldToasts.map((t: Toast) => t.id));
      
      // For each new toast, set a timer to close it
      newToasts.forEach((toast: Toast) => {
        if (!oldIds.has(toast.id) && toast.duration !== 0) {
          const duration = toast.duration || 5000;
          toastTimers.set(toast.id, window.setTimeout(() => {
            closeToast(toast.id);
          }, duration));
        }
      });
      
      // Clear timers for removed toasts
      oldToasts.forEach((toast: Toast) => {
        if (!newIds.has(toast.id) && toastTimers.has(toast.id)) {
          clearTimeout(toastTimers.get(toast.id));
          toastTimers.delete(toast.id);
        }
      });
    },
    { deep: true }
  );
  
  // Clean up the watcher when component is unmounted
  onUnmounted(() => {
    stopWatch();
    // Clear all timers
    toastTimers.forEach(timerId => clearTimeout(timerId));
    toastTimers.clear();
  });
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

.toast-message {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 300px;
  max-width: 450px;
  margin-bottom: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s ease;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.toast-text {
  font-size: 0.875rem;
  color: #4b5563;
}

.toast-action {
  margin-left: 0.75rem;
  padding: 0.25rem 0.75rem;
  background-color: transparent;
  border: 1px solid currentColor;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  height: 1.5rem;
  width: 1.5rem;
  border: none;
  background: transparent;
  border-radius: 50%;
  opacity: 0.6;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-close:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
}

/* Type styles */
.toast-success {
  border-left: 4px solid #10b981;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

/* Animations */
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-fade-move {
  transition: transform 0.3s ease;
}
</style> 