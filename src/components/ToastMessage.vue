<template>
  <Transition name="toast-fade">
    <div 
      v-if="visible" 
      class="toast-message" 
      :class="[`toast-${type}`, { 'with-action': action }]"
    >
      <div class="toast-icon">
        <i class="pi" :class="iconClass"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title" v-if="title">{{ title }}</div>
        <div class="toast-text">{{ message }}</div>
      </div>
      <button 
        v-if="action" 
        @click="onActionClick" 
        class="toast-action"
      >
        {{ actionText }}
      </button>
      <button 
        @click="onClose" 
        class="toast-close"
        aria-label="Close"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 5000
  },
  action: {
    type: Function,
    default: null
  },
  actionText: {
    type: String,
    default: 'Undo'
  }
});

const visible = ref(true);
const emit = defineEmits(['close', 'action']);

const iconClass = computed(() => {
  switch (props.type) {
    case 'success': return 'pi-check-circle';
    case 'error': return 'pi-times-circle';
    case 'warning': return 'pi-exclamation-triangle';
    default: return 'pi-info-circle';
  }
});

function onClose() {
  visible.value = false;
  setTimeout(() => {
    emit('close', props.id);
  }, 300); // wait for animation to finish
}

function onActionClick() {
  if (props.action) {
    props.action();
    emit('action', props.id);
    onClose();
  }
}

onMounted(() => {
  if (props.duration > 0) {
    setTimeout(() => {
      onClose();
    }, props.duration);
  }
});
</script>

<style scoped>
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
</style> 