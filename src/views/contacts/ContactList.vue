<template>
  <div class="p-6">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-gray-800">Contacts</h2>
        <Button label="New Contact" icon="pi pi-plus" @click="openNewContactDialog" />
      </div>

      <DataTable
        :value="contacts"
        :paginator="true"
        :rows="10"
        :loading="loading"
        responsive-layout="stack"
        class="p-datatable-sm"
        v-model:filters="filters"
        filter-display="menu"
        :globalFilterFields="['name', 'title', 'email', 'phone', 'company.name']"
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

        <Column field="name" header="Name" sortable>
          <template #body="{ data }">
            <div class="font-medium">{{ data.name }}</div>
          </template>
        </Column>
        <Column field="title" header="Title" sortable />
        <Column field="company.name" header="Company" sortable />
        <Column field="email" header="Email">
          <template #body="{ data }">
            <a
              v-if="data.email"
              :href="`mailto:${data.email}`"
              class="text-primary-600 hover:text-primary-700"
            >
              {{ data.email }}
            </a>
          </template>
        </Column>
        <Column field="phone" header="Phone">
          <template #body="{ data }">
            <a
              v-if="data.phone"
              :href="`tel:${data.phone}`"
              class="text-primary-600 hover:text-primary-700"
            >
              {{ data.phone }}
            </a>
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
                @click="editContact(data)"
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

    <!-- Contact Dialog -->
    <Dialog
      v-model:visible="contactDialog"
      :style="{ width: '450px' }"
      :header="dialogMode === 'new' ? 'New Contact' : 'Edit Contact'"
      :modal="true"
      class="p-fluid"
    >
      <div class="space-y-4">
        <div class="field">
          <label for="name" class="font-medium">Name</label>
          <InputText
            id="name"
            v-model="contactForm.name"
            required
            autofocus
            :class="{ 'p-invalid': submitted && !contactForm.name }"
          />
          <small class="p-error" v-if="submitted && !contactForm.name">
            Name is required.
          </small>
        </div>

        <div class="field">
          <label for="title" class="font-medium">Title</label>
          <InputText
            id="title"
            v-model="contactForm.title"
          />
        </div>

        <div class="field">
          <label for="company" class="font-medium">Company</label>
          <AutoComplete
            id="company"
            v-model="contactForm.company"
            :suggestions="companySuggestions"
            @complete="searchCompanies"
            @item-select="onCompanySelect"
            field="name"
            :class="{ 'p-invalid': submitted && !contactForm.company }"
            forceSelection
          />
          <small class="p-error" v-if="submitted && !contactForm.company">
            Company is required.
          </small>
        </div>

        <div class="field">
          <label for="email" class="font-medium">Email</label>
          <InputText
            id="email"
            v-model="contactForm.email"
            type="email"
          />
        </div>

        <div class="field">
          <label for="phone" class="font-medium">Phone</label>
          <InputText
            id="phone"
            v-model="contactForm.phone"
            type="tel"
          />
        </div>

        <div class="field">
          <label for="notes" class="font-medium">Notes</label>
          <Textarea
            id="notes"
            v-model="contactForm.notes"
            rows="3"
            autoResize
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
          @click="saveContact"
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
        <span>Are you sure you want to delete this contact?</span>
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
          @click="deleteContact"
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
import { AutoComplete } from 'primevue/autocomplete'
import { Textarea } from 'primevue/textarea'
import { supabase } from '../../lib/supabase'

const loading = ref(false)
const saving = ref(false)
const contacts = ref([])
const contactDialog = ref(false)
const deleteDialog = ref(false)
const submitted = ref(false)
const dialogMode = ref<'new' | 'edit'>('new')
const companySuggestions = ref([])

const contactForm = ref({
  id: null as number | null,
  name: '',
  title: '',
  company: null,
  email: '',
  phone: '',
  notes: ''
})

const contactToDelete = ref(null)

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
    loading.value = true
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        company:companies(*)
      `)
      .order('name')

    if (error) throw error
    contacts.value = data || []
  } catch (error) {
    console.error('Error loading contacts:', error)
  } finally {
    loading.value = false
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