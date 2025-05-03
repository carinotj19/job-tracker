import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

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

export const useToastStore = defineStore('toast', () => {
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
  function removeToast(id: string) {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
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
  
  // Clear all toasts
  function clearAll() {
    toasts.value = [];
  }
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAll
  };
}); 