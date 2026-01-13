<template>
  <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="border-4 border-dashed border-gray-200 rounded-lg p-4">
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h1 class="text-xl font-semibold text-gray-900">Users</h1>
            <p class="mt-2 text-sm text-gray-700">
              A list of all users in your application including their name, email, and status.
            </p>
          </div>
        </div>
        
        <div class="mt-8 flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Email
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created At
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Last Sign In
                      </th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-if="loading" class="animate-pulse">
                      <td colspan="4" class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        Loading users...
                      </td>
                    </tr>
                    <tr v-else-if="error" class="bg-red-50">
                      <td colspan="4" class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-red-900 sm:pl-6">
                        {{ error }}
                      </td>
                    </tr>
                    <tr v-else v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {{ user.email }}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {{ new Date(user.created_at).toLocaleDateString() }}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {{ user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never' }}
                      </td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          @click="deleteUser(user.id)"
                          class="text-red-600 hover:text-red-900"
                          :disabled="loading"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

interface AdminUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at?: string | null
}

const router = useRouter()
const authStore = useAuthStore()
const users = ref<AdminUser[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Check if user is admin
const checkAdmin = async () => {
  if (!authStore.user || authStore.user.email !== 'admin@example.com') {
    router.push('/')
  }
}

// Fetch all users
const fetchUsers = async () => {
  try {
    loading.value = true
    const { data, error: err } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) throw err
    users.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load users'
  } finally {
    loading.value = false
  }
}

// Delete a user
const deleteUser = async (userId: string) => {
  if (!confirm('Are you sure you want to delete this user?')) return
  
  try {
    loading.value = true
    const { error: err } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (err) throw err
    await fetchUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete user'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await checkAdmin()
  await fetchUsers()
})
</script> 
