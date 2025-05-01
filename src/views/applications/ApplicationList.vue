<template>
  <div class="p-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">Job Applications</h2>
        <Button label="New Application" icon="pi pi-plus" @click="navigateToNewApplication" />
      </div>

      <DataTable
        :value="applications"
        :paginator="true"
        :rows="10"
        :loading="loading"
        responsive-layout="stack"
        class="p-datatable-sm"
        v-model:filters="filters"
        filter-display="menu"
        :globalFilterFields="['title', 'company.name', 'status']"
      >
        <template #header>
          <div class="flex justify-between">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear"
              outlined
              @click="clearFilters"
            />
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Search..." />
            </span>
          </div>
        </template>

        <Column field="title" header="Job Title" sortable>
          <template #body="{ data }">
            <router-link
              :to="`/applications/${data.id}`"
              class="text-primary-600 hover:text-primary-700"
            >
              {{ data.title }}
            </router-link>
          </template>
        </Column>
        <Column field="company.name" header="Company" sortable />
        <Column field="status" header="Status" sortable>
          <template #body="{ data }">
            <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
          </template>
        </Column>
        <Column field="applied_date" header="Applied Date" sortable>
          <template #body="{ data }">
            {{ new Date(data.applied_date).toLocaleDateString() }}
          </template>
        </Column>
        <Column field="salary_range" header="Salary Range" sortable />
        <Column :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                icon="pi pi-eye"
                text
                rounded
                aria-label="View"
                @click="viewApplication(data)"
              />
              <Button
                icon="pi pi-pencil"
                text
                rounded
                aria-label="Edit"
                @click="editApplication(data)"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                aria-label="Delete"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
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
import { useRouter } from 'vue-router'
import { FilterMatchMode } from 'primevue/api'
import { Button } from 'primevue/button'
import { DataTable } from 'primevue/datatable'
import { Column } from 'primevue/column'
import { Tag } from 'primevue/tag'
import { Dialog } from 'primevue/dialog'
import { InputText } from 'primevue/inputtext'
import { supabase } from '../../lib/supabase'
import type { JobApplication } from '../../types/database.types'

const router = useRouter()
const loading = ref(false)
const applications = ref<JobApplication[]>([])
const deleteDialog = ref(false)
const applicationToDelete = ref<JobApplication | null>(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'company.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  status: { value: null, matchMode: FilterMatchMode.EQUALS }
})

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

function clearFilters() {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'company.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
  }
}

async function loadApplications() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        company:companies(name)
      `)
      .order('applied_date', { ascending: false })

    if (error) throw error
    applications.value = data || []
  } catch (error) {
    console.error('Error loading applications:', error)
  } finally {
    loading.value = false
  }
}

function navigateToNewApplication() {
  router.push('/applications/new')
}

function viewApplication(application: JobApplication) {
  router.push(`/applications/${application.id}`)
}

function editApplication(application: JobApplication) {
  router.push(`/applications/${application.id}/edit`)
}

function confirmDelete(application: JobApplication) {
  applicationToDelete.value = application
  deleteDialog.value = true
}

async function deleteApplication() {
  if (!applicationToDelete.value) return

  try {
    loading.value = true
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', applicationToDelete.value.id)

    if (error) throw error
    
    deleteDialog.value = false
    applicationToDelete.value = null
    await loadApplications()
  } catch (error) {
    console.error('Error deleting application:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadApplications()
})
</script> 