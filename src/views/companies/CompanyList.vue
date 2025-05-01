<template>
  <div class="p-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">Companies</h2>
        <Button label="New Company" icon="pi pi-plus" @click="openNewCompanyDialog" />
      </div>

      <DataTable
        :value="companies"
        :paginator="true"
        :rows="10"
        :loading="loading"
        responsive-layout="stack"
        class="p-datatable-sm"
        v-model:filters="filters"
        filter-display="menu"
        :globalFilterFields="['name', 'website', 'industry']"
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

        <Column field="name" header="Company Name" sortable>
          <template #body="{ data }">
            <div class="font-medium">{{ data.name }}</div>
          </template>
        </Column>
        <Column field="website" header="Website">
          <template #body="{ data }">
            <a
              v-if="data.website"
              :href="data.website"
              target="_blank"
              rel="noopener noreferrer"
              class="text-primary-600 hover:text-primary-700"
            >
              {{ data.website }}
            </a>
          </template>
        </Column>
        <Column field="industry" header="Industry" sortable />
        <Column field="applications" header="Applications" sortable>
          <template #body="{ data }">
            <Tag :value="data.applications?.length || 0" severity="info" />
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                aria-label="Edit"
                @click="editCompany(data)"
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

    <!-- Company Dialog -->
    <Dialog
      v-model:visible="companyDialog"
      :style="{ width: '450px' }"
      :header="dialogMode === 'new' ? 'New Company' : 'Edit Company'"
      :modal="true"
      class="p-fluid"
    >
      <div class="space-y-4">
        <div class="field">
          <label for="name" class="font-medium">Company Name</label>
          <InputText
            id="name"
            v-model="companyForm.name"
            required
            autofocus
            :class="{ 'p-invalid': submitted && !companyForm.name }"
          />
          <small class="p-error" v-if="submitted && !companyForm.name">
            Company name is required.
          </small>
        </div>

        <div class="field">
          <label for="website" class="font-medium">Website</label>
          <InputText
            id="website"
            v-model="companyForm.website"
            type="url"
          />
        </div>

        <div class="field">
          <label for="industry" class="font-medium">Industry</label>
          <InputText
            id="industry"
            v-model="companyForm.industry"
          />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          outlined
          @click="hideDialog"
        />
        <Button
          label="Save"
          icon="pi pi-check"
          @click="saveCompany"
          :loading="saving"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Are you sure you want to delete this company?</span>
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
          @click="deleteCompany"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { Button } from 'primevue/button'
import { DataTable } from 'primevue/datatable'
import { Column } from 'primevue/column'
import { Dialog } from 'primevue/dialog'
import { InputText } from 'primevue/inputtext'
import { Tag } from 'primevue/tag'
import { supabase } from '../../lib/supabase'

const loading = ref(false)
const saving = ref(false)
const companies = ref([])
const companyDialog = ref(false)
const deleteDialog = ref(false)
const submitted = ref(false)
const dialogMode = ref<'new' | 'edit'>('new')

const companyForm = ref({
  id: null as number | null,
  name: '',
  website: '',
  industry: ''
})

const companyToDelete = ref(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  industry: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
})

function clearFilters() {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    industry: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  }
}

async function loadCompanies() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        applications:job_applications(id)
      `)
      .order('name')

    if (error) throw error
    companies.value = data || []
  } catch (error) {
    console.error('Error loading companies:', error)
  } finally {
    loading.value = false
  }
}

function openNewCompanyDialog() {
  companyForm.value = {
    id: null,
    name: '',
    website: '',
    industry: ''
  }
  submitted.value = false
  dialogMode.value = 'new'
  companyDialog.value = true
}

function editCompany(company: any) {
  companyForm.value = { ...company }
  dialogMode.value = 'edit'
  companyDialog.value = true
}

function hideDialog() {
  companyDialog.value = false
  submitted.value = false
}

async function saveCompany() {
  try {
    submitted.value = true

    if (!companyForm.value.name.trim()) {
      return
    }

    saving.value = true
    const companyData = {
      name: companyForm.value.name,
      website: companyForm.value.website,
      industry: companyForm.value.industry
    }

    if (dialogMode.value === 'edit') {
      const { error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', companyForm.value.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('companies')
        .insert(companyData)

      if (error) throw error
    }

    companyDialog.value = false
    await loadCompanies()
  } catch (error) {
    console.error('Error saving company:', error)
  } finally {
    saving.value = false
  }
}

function confirmDelete(company: any) {
  companyToDelete.value = company
  deleteDialog.value = true
}

async function deleteCompany() {
  if (!companyToDelete.value) return

  try {
    loading.value = true
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyToDelete.value.id)

    if (error) throw error
    
    deleteDialog.value = false
    companyToDelete.value = null
    await loadCompanies()
  } catch (error) {
    console.error('Error deleting company:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCompanies()
})
</script> 