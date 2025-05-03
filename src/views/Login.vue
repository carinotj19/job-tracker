<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <div>
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
            <i class="pi pi-briefcase text-blue-600 text-3xl"></i>
          </div>
        </div>
        <h1 class="text-center text-3xl font-bold tracking-tight text-gray-900">
          Smart Job-Tracker
        </h1>
        <h2 class="mt-4 text-center text-xl font-semibold text-gray-800">
          {{ isLogin ? 'Sign in to your account' : 'Create a new account' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <a
            href="#"
            class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            @click.prevent="isLogin = !isLogin"
          >
            {{ isLogin ? 'Sign up' : 'Sign in' }}
          </a>
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-5">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-envelope text-gray-400"></i>
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="pi pi-lock text-gray-400"></i>
              </div>
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>
        </div>

        <div v-if="authStore.error" class="text-sm text-center text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 shadow-sm">
          <div class="flex items-center justify-center mb-1">
            <i class="pi pi-times-circle text-lg mr-2"></i>
            <span class="font-medium">Authentication Error</span>
          </div>
          <p>{{ authStore.error }}</p>
        </div>

        <div>
          <LoadingButton
            type="submit"
            :loading="authStore.loading"
            :label="isLogin ? 'Sign in' : 'Create account'"
            :loadingText="isLogin ? 'Signing in...' : 'Creating account...'"
            class="w-full py-3 rounded-lg text-base font-medium shadow-sm"
          >
            <template #icon>
              <svg
                class="h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clip-rule="evenodd"
                />
              </svg>
            </template>
          </LoadingButton>
        </div>
        
        <div class="text-center text-sm text-gray-500 mt-4">
          <p>By logging in, you agree to our <a href="#" class="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import LoadingButton from '../components/LoadingButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastStore = useToastStore()
const isLogin = ref(true)

const form = reactive({
  email: '',
  password: ''
})

async function handleSubmit() {
  try {
    if (isLogin.value) {
      await authStore.signIn(form.email, form.password)
      if (authStore.user) {
        toastStore.success('Successfully signed in')
        router.push('/')
      }
    } else {
      await authStore.signUp(form.email, form.password)
      if (authStore.user) {
        toastStore.success('Account created successfully')
        router.push('/')
      } else {
        toastStore.info('Please check your email to verify your account')
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
    toastStore.error(errorMessage)
  }
}
</script>

<style scoped>
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

.from-blue-50 {
  --tw-gradient-from: #eff6ff;
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(239, 246, 255, 0));
}

.to-indigo-50 {
  --tw-gradient-to: #eef2ff;
}

:deep(.p-button) {
  background-color: #3b82f6;
  border-color: #3b82f6;
  transition: all 0.2s ease;
}

:deep(.p-button:enabled:hover) {
  background-color: #2563eb;
  border-color: #2563eb;
}

:deep(.p-button:focus) {
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px rgba(59, 130, 246, 0.5);
}
</style> 