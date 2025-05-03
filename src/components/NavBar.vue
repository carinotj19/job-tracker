<template>
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold text-gray-800">Smart Job-Tracker</h1>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              v-if="authStore.user"
              to="/dashboard"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-blue-500 text-gray-900': route.path === '/dashboard' }"
            >
              Dashboard
            </router-link>
            <router-link
              v-if="authStore.user"
              to="/applications"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-blue-500 text-gray-900': route.path.startsWith('/applications') }"
            >
              Applications
            </router-link>
            <router-link
              v-if="authStore.user"
              to="/companies"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-blue-500 text-gray-900': route.path === '/companies' }"
            >
              Companies
            </router-link>
            <router-link
              v-if="authStore.user"
              to="/contacts"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-blue-500 text-gray-900': route.path === '/contacts' }"
            >
              Contacts
            </router-link>
            <router-link
              v-if="authStore.user"
              to="/insights"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-blue-500 text-gray-900': route.path === '/insights' }"
            >
              Insights
            </router-link>
            <router-link
              v-if="isAdmin"
              to="/admin"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              :class="{ 'border-blue-500 text-gray-900': route.path === '/admin' }"
            >
              Admin Panel
            </router-link>
          </div>
        </div>
        
        <!-- Mobile menu button -->
        <div class="flex items-center">
          <div class="sm:hidden">
            <button
              type="button"
              @click="toggleMobileMenu"
              :aria-expanded="isMobileMenuOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span class="sr-only">Open main menu</span>
              <!-- Icon when menu is closed -->
              <svg 
                v-show="!isMobileMenuOpen" 
                class="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <!-- Icon when menu is open -->
              <svg 
                v-show="isMobileMenuOpen" 
                class="block h-6 w-6" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="hidden sm:flex sm:items-center">
            <div v-if="authStore.user" class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">{{ authStore.user.email }}</span>
              <button
                @click="handleLogout"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                :disabled="authStore.loading"
              >
                {{ authStore.loading ? 'Logging out...' : 'Logout' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Mobile menu, show/hide based on menu state -->
    <div v-show="isMobileMenuOpen" class="sm:hidden">
      <div class="pt-2 pb-3 flex flex-col gap-1">
        <router-link
          v-if="authStore.user"
          to="/dashboard"
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          :class="route.path === '/dashboard'
            ? 'border-blue-500 text-blue-700 bg-blue-50'
            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'"
          @click="closeMobileMenu"
        >
          Dashboard
        </router-link>
        <router-link
          v-if="authStore.user"
          to="/applications"
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          :class="[
            route.path.startsWith('/applications')
              ? 'border-blue-500 text-blue-700 bg-blue-50'
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
          ]"
          @click="closeMobileMenu"
        >
          Applications
        </router-link>
        <router-link
          v-if="authStore.user"
          to="/companies"
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          :class="[
            route.path === '/companies'
              ? 'border-blue-500 text-blue-700 bg-blue-50'
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
          ]"
          @click="closeMobileMenu"
        >
          Companies
        </router-link>
        <router-link
          v-if="authStore.user"
          to="/contacts"
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          :class="[
            route.path === '/contacts'
              ? 'border-blue-500 text-blue-700 bg-blue-50'
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
          ]"
          @click="closeMobileMenu"
        >
          Contacts
        </router-link>
        <router-link
          v-if="authStore.user"
          to="/insights"
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          :class="[
            route.path === '/insights'
              ? 'border-blue-500 text-blue-700 bg-blue-50'
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
          ]"
          @click="closeMobileMenu"
        >
          Insights
        </router-link>
        <router-link
          v-if="isAdmin"
          to="/admin"
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
          :class="[
            route.path === '/admin'
              ? 'border-blue-500 text-blue-700 bg-blue-50'
              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
          ]"
          @click="closeMobileMenu"
        >
          Admin Panel
        </router-link>
      </div>
      <div class="pt-4 pb-3 border-t border-gray-200">
        <div v-if="authStore.user" class="flex items-center px-4">
          <div class="ml-3">
            <div class="text-base font-medium text-gray-800">{{ authStore.user.email }}</div>
          </div>
        </div>
        <div class="mt-3 flex flex-col gap-1">
          <button
            @click="handleLogoutMobile"
            class="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-100"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

// Check if user is admin - we'll implement this properly later
const isAdmin = computed(() => {
  return authStore.user?.email === 'admin@example.com' // This is temporary, we'll make it better
})

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  console.log('Mobile menu toggled:', isMobileMenuOpen.value)
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

async function handleLogout() {
  await authStore.signOut()
  router.push('/login')
}

async function handleLogoutMobile() {
  closeMobileMenu()
  await handleLogout()
}

// Close mobile menu when route changes
watch(route, () => {
  closeMobileMenu()
})

onMounted(() => {
  isMobileMenuOpen.value = false;
  if (!authStore.user) authStore.initialize();
})
</script> 