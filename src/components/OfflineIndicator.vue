<template>
  <div 
    class="offline-indicator"
    :class="{ 'is-offline': !isOnline }"
    v-show="!isOnline || showIndicator"
  >
    <i class="pi" :class="isOnline ? 'pi-wifi' : 'pi-wifi-off'"></i>
    <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
    <div v-if="!isOnline" class="offline-message">
      Changes will be saved and synced when you're back online
    </div>
    <div v-if="isOnline && pendingOperations > 0" class="sync-message">
      Syncing {{ pendingOperations }} {{ pendingOperations === 1 ? 'change' : 'changes' }}...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useOfflineDataStore } from '../stores/offlineData';

const props = defineProps({
  showAlways: {
    type: Boolean,
    default: false
  }
});

const offlineStore = useOfflineDataStore();
const showIndicator = ref(false);

// Show the indicator for a few seconds when status changes
watch(() => offlineStore.isOnline, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    showIndicator.value = true;
    setTimeout(() => {
      showIndicator.value = props.showAlways;
    }, 3000);
  }
});

// Computed properties from the store
const isOnline = computed(() => offlineStore.isOnline);
const pendingOperations = computed(() => offlineStore.pendingOperations);

onMounted(() => {
  // Initially, show the indicator only if we're offline or showAlways is true
  showIndicator.value = !offlineStore.isOnline || props.showAlways;
});
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #f0f9ff;
  color: #0284c7;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease;
}

.offline-indicator.is-offline {
  background-color: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.offline-message, .sync-message {
  font-size: 12px;
  margin-left: 8px;
  opacity: 0.8;
}

.offline-indicator.is-offline i {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style> 