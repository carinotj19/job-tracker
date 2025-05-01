<template>
  <div class="p-6">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
    </div>

    <div v-else-if="application" class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ application.title }}</h1>
          <p class="text-lg text-gray-600">{{ application.company?.name }}</p>
        </div>
        <div class="flex gap-2">
          <Button
            icon="pi pi-pencil"
            label="Edit"
            @click="editApplication"
          />
          <Button
            icon="pi pi-trash"
            label="Delete"
            severity="danger"
            @click="confirmDelete"
          />
        </div>
      </div>

      <!-- Application Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Application Details</h2>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-600">Status</label>
              <div class="mt-1">
                <Tag :value="application.status" :severity="getStatusSeverity(application.status)" />
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Applied Date</label>
              <p class="mt-1">{{ new Date(application.applied_date).toLocaleDateString() }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Salary Range</label>
              <p class="mt-1">{{ application.salary_range || 'Not specified' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Job Posting URL</label>
              <p class="mt-1">
                <a
                  v-if="application.job_posting_url"
                  :href="application.job_posting_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-primary-600 hover:text-primary-700"
                >
                  View Job Posting
                </a>
                <span v-else>Not specified</span>
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Job Description</h2>
          <p class="whitespace-pre-wrap">{{ application.description || 'No description provided' }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Notes</h2>
          <p class="whitespace-pre-wrap">{{ application.notes || 'No notes added' }}</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">Interviews</h2>
            <Button
              icon="pi pi-plus"
              label="Add Interview"
              size="small"
              @click="addInterview"
            />
          </div>
          <div v-if="interviews.length > 0" class="space-y-4">
            <div
              v-for="interview in interviews"
              :key="interview.id"
              class="p-3 border rounded-lg"
            >
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium">{{ interview.type }}</p>
                  <p class="text-sm text-gray-600">
                    {{ new Date(interview.interview_date).toLocaleString() }}
                  </p>
                </div>
                <Tag :value="interview.status" :severity="getInterviewStatusSeverity(interview.status)" />
              </div>
              <p class="mt-2 text-sm">{{ interview.notes }}</p>
            </div>
          </div>
          <p v-else class="text-gray-500">No interviews scheduled</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-gray-500">
      Application not found
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Are you sure you want to delete this application?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          outlined
          @click="deleteDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          @click="deleteApplication"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button } from 'primevue/button'
import { Tag } from 'primevue/tag'
import { Dialog } from 'primevue/dialog'
import { supabase } from '../../lib/supabase'
import type { JobApplication, Interview } from '../../types/database.types'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const application = ref<JobApplication | null>(null)
const interviews = ref<Interview[]>([])
const deleteDialog = ref(false)

function getStatusSeverity(status: string) {
  const severityMap: Record<string, string> = {
    applied: 'info',
    interviewing: 'warning',
    offered: 'success',
    rejected: 'danger',
    accepted: 'success',
    withdrawn: 'danger'
  }
  return severityMap[status] || 'info'
}

function getInterviewStatusSeverity(status: string) {
  const severityMap: Record<string, string> = {
    scheduled: 'info',
    completed: 'success',
    cancelled: 'danger'
  }
  return severityMap[status] || 'info'
}

async function loadApplication() {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        company:companies(name)
      `)
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    application.value = data

    // Load interviews
    const { data: interviewsData, error: interviewsError } = await supabase
      .from('interviews')
      .select('*')
      .eq('job_application_id', route.params.id)
      .order('interview_date', { ascending: true })

    if (interviewsError) throw interviewsError
    interviews.value = interviewsData || []
  } catch (error) {
    console.error('Error loading application:', error)
  } finally {
    loading.value = false
  }
}

function editApplication() {
  router.push(`/applications/${route.params.id}/edit`)
}

function addInterview() {
  // TODO: Implement interview creation
  console.log('Add interview')
}

function confirmDelete() {
  deleteDialog.value = true
}

async function deleteApplication() {
  try {
    loading.value = true
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', route.params.id)

    if (error) throw error
    
    router.push('/applications')
  } catch (error) {
    console.error('Error deleting application:', error)
  } finally {
    loading.value = false
    deleteDialog.value = false
  }
}

onMounted(() => {
  loadApplication()
})
</script> 