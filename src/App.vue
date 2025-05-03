<template>
  <NavBar />
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="bg-white border-t border-gray-200 mt-10">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center">
          <p class="text-sm text-gray-600">© 2025 Smart Job-Tracker. All rights reserved.</p>
          <div class="flex items-center mt-3 sm:mt-0">
            <span class="text-sm text-gray-500 mr-2">Network Status:</span>
            <span 
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                offlineStore.isOnline ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              ]"
            >
              {{ offlineStore.networkStatus }}
            </span>
            <button 
              v-if="offlineStore.pendingOperations > 0" 
              @click="offlineStore.syncPendingData" 
              class="ml-3 inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-300 shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <i class="pi pi-sync mr-1 text-blue-600"></i>
              Sync ({{ offlineStore.pendingOperations }})
            </button>
            <button 
              @click="resetDatabase" 
              class="ml-3 inline-flex items-center px-2 py-1 text-xs font-medium rounded border border-gray-300 shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <i class="pi pi-database mr-1 text-blue-600"></i>
              Reset Database
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
  <OfflineIndicator />
  <ToastService />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './components/NavBar.vue'
import OfflineIndicator from './components/OfflineIndicator.vue'
import ToastService from './components/ToastService.vue'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/auth'
import { useOfflineDataStore } from './stores/offlineData'
import { useToastStore } from './stores/toast'

const router = useRouter()
const authStore = useAuthStore()
const offlineStore = useOfflineDataStore()
const toastStore = useToastStore()

// Listen for online/offline events
function handleOnline() {
  toastStore.success('Your connection has been restored', { title: 'Back Online' });
  offlineStore.syncPendingData();
}

function handleOffline() {
  toastStore.warning('You are now working offline. Changes will be synchronized when your connection is restored.', 
    { title: 'Offline Mode' });
}

onMounted(async () => {
  // Initialize the auth store
  await authStore.initialize()
  
  // Try to initialize offline data store
  try {
    await offlineStore.initializeOfflineData()
  } catch (error) {
    console.error('Error initializing offline data:', error)
    // If there's an IndexedDB error, try to reset the database
    if (error instanceof DOMException && 
        error.name === 'NotFoundError' && 
        error.message.includes('object store')) {
      toastStore.warning('Resetting database due to schema changes...', {
        title: 'Database Reset',
        duration: 5000
      })
      const success = await offlineStore.resetDatabase()
      if (success) {
        toastStore.success('Database reset successful', {
          title: 'Database Reset',
          duration: 3000
        })
        // Try to initialize again
        await offlineStore.initializeOfflineData()
      }
    }
  }
  
  // Setup online/offline event listeners
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Setup auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      authStore.user = session.user
      // When user signs in, fetch and cache data for offline use
      offlineStore.initializeOfflineData()
      toastStore.success('Signed in successfully')
      router.push({ name: 'dashboard' })
    } else if (event === 'SIGNED_OUT') {
      authStore.user = null
      toastStore.info('Signed out')
      router.push('/login')
    }
  })

  // Watch for sync operations
  watch(() => offlineStore.pendingOperations, (newCount) => {
    if (newCount > 0) {
      toastStore.info(`Syncing ${newCount} pending ${newCount === 1 ? 'change' : 'changes'}...`);
    }
  });

  // Show toast when sync is completed
  watch(() => offlineStore.lastSyncTime, (newTime, oldTime) => {
    if (newTime && (!oldTime || newTime > oldTime)) {
      toastStore.success('All changes synchronized', { 
        title: 'Sync Complete',
        duration: 3000
      });
    }
  });
})

onBeforeUnmount(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
})

// Reset database function
async function resetDatabase() {
  if (confirm('Are you sure you want to reset the local database? This will clear all offline data.')) {
    toastStore.warning('Resetting database...', {
      title: 'Database Reset',
      duration: 5000
    });
    const success = await offlineStore.resetDatabase();
    if (success) {
      toastStore.success('Database reset successful. Refreshing page...', {
        title: 'Database Reset',
        duration: 3000
      });
      // Refresh the page after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  }
}
</script>

<style>
body {
  font-family: 'Inter var', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Global styles for PrimeVue components */
:root {
  --primary-color: #3b82f6;
  --primary-color-hover: #2563eb;
  --surface-ground: #f3f4f6;
  --surface-card: #ffffff;
  --surface-border: #e5e7eb;
  --text-color: #1f2937;
  --text-color-secondary: #6b7280;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>