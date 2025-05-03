import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface LoadingState {
  [key: string]: boolean;
}

interface ErrorState {
  [key: string]: string | null;
}

export const useUIStore = defineStore('ui', () => {
  // Loading states for different operations
  const loadingStates = ref<LoadingState>({});
  
  // Error states for different operations
  const errorStates = ref<ErrorState>({});
  
  // Last updated timestamp to force reactivity updates
  const lastUpdated = ref(Date.now());
  
  // A list of delayed loading operations
  const delayedOperations = ref<{[key: string]: number}>({});
  
  // Computed property to check if any operation is loading
  const isAnyLoading = computed(() => {
    return Object.values(loadingStates.value).some(state => state === true);
  });
  
  // Get specific loading state
  function isLoading(operationKey: string): boolean {
    return !!loadingStates.value[operationKey];
  }
  
  // Get error for specific operation
  function getError(operationKey: string): string | null {
    return errorStates.value[operationKey] || null;
  }
  
  // Set loading state with optional delay
  function setLoading(operationKey: string, isLoading: boolean, delay: number = 0): void {
    if (isLoading && delay > 0) {
      // Clear any existing delayed operation
      if (delayedOperations.value[operationKey]) {
        clearTimeout(delayedOperations.value[operationKey]);
      }
      
      // Set up a new delayed operation
      delayedOperations.value[operationKey] = window.setTimeout(() => {
        loadingStates.value[operationKey] = true;
        lastUpdated.value = Date.now();
        delete delayedOperations.value[operationKey];
      }, delay);
    } else if (isLoading) {
      loadingStates.value[operationKey] = true;
      lastUpdated.value = Date.now();
    } else {
      // If turning off loading, clear any pending delayed operation
      if (delayedOperations.value[operationKey]) {
        clearTimeout(delayedOperations.value[operationKey]);
        delete delayedOperations.value[operationKey];
      }
      loadingStates.value[operationKey] = false;
      lastUpdated.value = Date.now();
    }
  }
  
  // Set error state
  function setError(operationKey: string, error: string | null): void {
    errorStates.value[operationKey] = error;
    lastUpdated.value = Date.now();
  }
  
  // Clear error for specific operation
  function clearError(operationKey: string): void {
    if (errorStates.value[operationKey]) {
      errorStates.value[operationKey] = null;
      lastUpdated.value = Date.now();
    }
  }
  
  // Clear all errors
  function clearAllErrors(): void {
    Object.keys(errorStates.value).forEach(key => {
      errorStates.value[key] = null;
    });
    lastUpdated.value = Date.now();
  }
  
  // Helper to wrap async operations with loading and error handling
  async function withLoading<T>(
    operationKey: string, 
    operation: () => Promise<T>, 
    options: { 
      delay?: number,
      errorMessage?: string 
    } = {}
  ): Promise<T> {
    const { delay = 400, errorMessage = 'An error occurred' } = options;
    
    try {
      clearError(operationKey);
      setLoading(operationKey, true, delay);
      
      return await operation();
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      setError(operationKey, message);
      throw error;
    } finally {
      setLoading(operationKey, false);
    }
  }
  
  return {
    loadingStates,
    errorStates,
    isAnyLoading,
    isLoading,
    getError,
    setLoading,
    setError,
    clearError,
    clearAllErrors,
    withLoading
  };
}); 