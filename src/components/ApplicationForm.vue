<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ isEditing ? 'Edit Application' : 'Add New Application' }}</h3>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
        <input
          type="text"
          id="company"
          v-model="form.company"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="position" class="block text-sm font-medium text-gray-700">Position</label>
        <input
          type="text"
          id="position"
          v-model="form.position"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
        <select
          id="status"
          v-model="form.status"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="applied">Applied</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div>
        <label for="applied_date" class="block text-sm font-medium text-gray-700">Applied Date</label>
        <input
          type="date"
          id="applied_date"
          v-model="form.applied_date"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          id="location"
          v-model="form.location"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="salary" class="block text-sm font-medium text-gray-700">Salary</label>
        <input
          type="number"
          id="salary"
          v-model="form.salary"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="job_url" class="block text-sm font-medium text-gray-700">Job URL</label>
        <input
          type="url"
          id="job_url"
          v-model="form.job_url"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          id="notes"
          v-model="form.notes"
          rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        ></textarea>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {{ isEditing ? 'Update' : 'Add' }} Application
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useApplicationsStore } from '../stores/applications'
import type { JobApplication } from '../types'

const props = defineProps<{
  application?: JobApplication
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'success'): void
}>()

const store = useApplicationsStore()
const loading = ref(false)

const form = reactive({
  company: '',
  position: '',
  status: 'applied' as const,
  applied_date: new Date().toISOString().split('T')[0],
  location: '',
  salary: undefined as number | undefined,
  job_url: '',
  notes: ''
})

watch(() => props.application, (newApp) => {
  if (newApp) {
    Object.assign(form, {
      company: newApp.company,
      position: newApp.position,
      status: newApp.status,
      applied_date: newApp.applied_date,
      location: newApp.location || '',
      salary: newApp.salary,
      job_url: newApp.job_url || '',
      notes: newApp.notes || ''
    })
  }
}, { immediate: true })

const isEditing = computed(() => !!props.application)

async function handleSubmit() {
  loading.value = true
  try {
    if (isEditing.value && props.application) {
      await store.updateApplication(props.application.id, form)
    } else {
      await store.addApplication(form)
    }
    emit('success')
  } finally {
    loading.value = false
  }
}
</script> 