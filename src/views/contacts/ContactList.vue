<template>
  <div class="p-6">
    <!-- Breadcrumb navigation -->
    <div class="mb-4 flex items-center text-sm">
      <router-link to="/dashboard" class="text-blue-600 hover:text-blue-800">Dashboard</router-link>
      <i class="pi pi-angle-right mx-2 text-gray-500"></i>
      <span class="text-gray-700">Contacts</span>
    </div>

    <div class="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
      <div class="border-b border-gray-100 p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Contacts</h2>
            <p class="text-sm text-gray-600 mt-1">Manage company contacts and connections</p>
          </div>
          <Button label="New Contact" icon="pi pi-plus" @click="openNewContactDialog" />
        </div>
      </div>

      <DataTable :value="contacts" :paginator="true" :rows="10" :loading="uiStore.isLoading('contactList')"
        responsive-layout="stack" class="p-datatable-sm" v-model:filters="filters" filter-display="menu"
        :globalFilterFields="['name', 'title', 'email', 'phone', 'company.name']"
        stripedRows rowHover>
        <template #header>
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-2">
            <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined 
              class="px-3 self-start" size="small" @click="clearFilters" />
            <span class="p-input-icon-left w-full sm:w-auto">
              <i class="pi pi-search" />
              <InputText v-model="filters['global'].value" placeholder="Search contacts..." class="w-full sm:w-auto" />
            </span>
          </div>
        </template>

        <Column field="name" header="Name" sortable>
          <template #body="{ data }">
            <div class="font-medium text-blue-600">{{ data.name }}</div>
          </template>
        </Column>
        <Column field="title" header="Title" sortable />
        <Column field="company.name" header="Company" sortable />
        <Column field="email" header="Email">
          <template #body="{ data }">
            <a v-if="data.email" :href="`mailto:${data.email}`" class="text-blue-600 hover:text-blue-800 transition-colors">
              {{ data.email }}
            </a>
            <span v-else>-</span>
          </template>
        </Column>
        <Column field="phone" header="Phone">
          <template #body="{ data }">
            <a v-if="data.phone" :href="`tel:${data.phone}`" class="text-blue-600 hover:text-blue-800 transition-colors">
              {{ data.phone }}
            </a>
            <span v-else>-</span>
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-2 justify-center">
              <Button icon="pi pi-pencil" text rounded aria-label="Edit" 
                class="action-btn hover:bg-blue-50 transition-colors" @click="editContact(data)" />
              <Button icon="pi pi-trash" text rounded severity="danger" aria-label="Delete"
                class="action-btn hover:bg-red-50 transition-colors" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Contact Dialog -->
    <Dialog v-model:visible="contactDialog" :style="{ width: '450px' }"
      :header="dialogMode === 'new' ? 'New Contact' : 'Edit Contact'" :modal="true" class="p-fluid p-dialog-custom">
      <div class="space-y-4">
        <div class="field">
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <InputText id="name" v-model="contactForm.name" required autofocus
            :class="{ 'p-invalid': submitted && !contactForm.name }" />
          <small class="p-error" v-if="submitted && !contactForm.name">
            Name is required.
          </small>
        </div>

        <div class="field">
          <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
          <InputText id="title" v-model="contactForm.title" />
        </div>

        <div class="field">
          <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
          <AutoComplete id="company" v-model="contactForm.company" :suggestions="companySuggestions"
            @complete="searchCompanies" @item-select="onCompanySelect" field="name"
            :class="{ 'p-invalid': submitted && !contactForm.company }" forceSelection />
          <small class="p-error" v-if="submitted && !contactForm.company">
            Company is required.
          </small>
        </div>

        <div class="field">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <InputText id="email" v-model="contactForm.email" type="email" />
        </div>

        <div class="field">
          <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
          <InputText id="phone" v-model="contactForm.phone" type="tel" />
        </div>

        <div class="field">
          <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
          <Textarea id="notes" v-model="contactForm.notes" rows="3" autoResize />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2 p-3 bg-gray-50">
          <Button label="Cancel" icon="pi pi-times" outlined @click="hideDialog" />
          <Button label="Save" icon="pi pi-check" @click="saveContact" :loading="saving" />
        </div>
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true" class="p-dialog-custom">
      <div class="confirmation-content p-4 flex items-start gap-4">
        <i class="pi pi-exclamation-triangle text-amber-500" style="font-size: 2rem" />
        <div>
          <h4 class="text-lg font-medium mb-2">Delete Contact</h4>
          <p class="text-gray-600">Are you sure you want to delete this contact? This action cannot be undone.</p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 p-3 bg-gray-50">
          <Button label="No" icon="pi pi-times" outlined @click="deleteDialog = false" />
          <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteContact" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import Textarea from 'primevue/textarea'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../stores/ui'
import { useToastStore } from '../../stores/toast'
import { useOfflineDataStore } from '../../stores/offlineData'

interface Contact {
  id: string;
  name: string;
  title?: string;
  company?: any;
  company_id?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

interface Company {
  id: string;
  name: string;
  [key: string]: any;
}

const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()
const toastStore = useToastStore()
const offlineStore = useOfflineDataStore()
const loading = ref(false)
const saving = ref(false)
const contacts = ref<Contact[]>([])
const contactDialog = ref(false)
const deleteDialog = ref(false)
const submitted = ref(false)
const dialogMode = ref<'new' | 'edit'>('new')
const companySuggestions = ref<Company[]>([])

const contactForm = ref({
  id: null as string | null,
  name: '',
  title: '',
  company: null as Company | null,
  email: '',
  phone: '',
  notes: ''
})

const contactToDelete = ref<Contact | null>(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'company.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH }
})

function clearFilters() {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    'company.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  }
}

async function loadContacts() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select(`*, company:companies(*)`)
      .order('name')

    if (error) throw error
    contacts.value = data || []
  } catch (e) {
    console.error(e)
    toastStore.error('Failed to load contacts')
    contacts.value = []
  }
}

async function searchCompanies(event: { query: string }) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', `%${event.query}%`)
      .limit(10)

    if (error) throw error
    companySuggestions.value = data
  } catch (error) {
    console.error('Error searching companies:', error)
    companySuggestions.value = []
  }
}

function onCompanySelect(event: { value: any }) {
  contactForm.value.company = event.value
}

function openNewContactDialog() {
  contactForm.value = {
    id: null,
    name: '',
    title: '',
    company: null,
    email: '',
    phone: '',
    notes: ''
  }
  submitted.value = false
  dialogMode.value = 'new'
  contactDialog.value = true
}

function editContact(contact: any) {
  contactForm.value = { ...contact }
  dialogMode.value = 'edit'
  contactDialog.value = true
}

function hideDialog() {
  contactDialog.value = false
  submitted.value = false
}

async function saveContact() {
  try {
    submitted.value = true

    if (!contactForm.value.name.trim() || !contactForm.value.company) {
      return
    }

    saving.value = true
    const contactData = {
      name: contactForm.value.name,
      title: contactForm.value.title,
      company_id: contactForm.value.company.id,
      email: contactForm.value.email,
      phone: contactForm.value.phone,
      notes: contactForm.value.notes
    }

    if (dialogMode.value === 'edit') {
      const { error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', contactForm.value.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('contacts')
        .insert(contactData)

      if (error) throw error
    }

    contactDialog.value = false
    await loadContacts()
  } catch (error) {
    console.error('Error saving contact:', error)
  } finally {
    saving.value = false
  }
}

function confirmDelete(contact: any) {
  contactToDelete.value = contact
  deleteDialog.value = true
}

async function deleteContact() {
  if (!contactToDelete.value) return

  try {
    loading.value = true
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contactToDelete.value.id)

    if (error) throw error

    deleteDialog.value = false
    contactToDelete.value = null
    await loadContacts()
  } catch (error) {
    console.error('Error deleting contact:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadContacts()
})
</script>

<style scoped>
:deep(.p-datatable .p-datatable-header) {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-color: #e5e7eb;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s ease;
}

:deep(.p-datatable.p-datatable-hoverable-rows .p-datatable-tbody > tr:not(.p-highlight):hover) {
  background-color: #f1f5f9;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
  border-color: #e5e7eb;
}

:deep(.p-dialog-custom .p-dialog-header) {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-dialog-custom .p-dialog-content) {
  padding: 1.25rem;
}

:deep(.p-dialog-custom .p-dialog-footer) {
  padding: 0;
  border-top: none;
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.action-btn .p-button-icon) {
  font-size: 1rem;
}
</style>