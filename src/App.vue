<template>
  <NavBar />
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  // Initialize the auth store
  await authStore.initialize()
  
  // Setup auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      authStore.user = session.user
      router.push({ name: 'dashboard' })
    } else if (event === 'SIGNED_OUT') {
      authStore.user = null
      router.push('/login')
    }
  })
})
</script>