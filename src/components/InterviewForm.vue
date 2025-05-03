<template>
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    :style="{ width: '550px', maxWidth: '95vw' }"
    :header="editMode ? 'Edit Interview' : 'Add Interview'"
    :modal="true"
    class="interview-dialog p-dialog-custom"
  >
    <!-- Loading Overlay -->
    <LoadingSpinner v-if="uiStore.isLoading('loadInterview')" overlay message="Loading interview data..." />
    
    <div v-if="uiStore.getError('interviewForm')" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start">
      <i class="pi pi-exclamation-circle text-lg mr-3 mt-0.5"></i>
      <span>{{ uiStore.getError('interviewForm') }}</span>
    </div>
    
    <div class="flex flex-col space-y-5 p-2">
      <!-- Interview Type -->
      <div class="field">
        <label for="interview-type" class="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
        <Dropdown
          id="interview-type"
          v-model="form.interview_type"
          :options="interviewTypes"
          option-label="label"
          option-value="value"
          placeholder="Select Interview Type"
          class="w-full"
          :class="{'p-invalid': submitted && !form.interview_type}"
        />
        <small v-if="submitted && !form.interview_type" class="p-error mt-1 inline-block">Interview type is required</small>
      </div>

      <!-- Interview Date -->
      <div class="field">
        <label for="interview-date" class="block text-sm font-medium text-gray-700 mb-2">Interview Date</label>
        <Calendar
          id="interview-date"
          v-model="form.interview_date"
          :show-time="true"
          :show-icon="true"
          placeholder="Select Interview Date & Time"
          class="w-full"
          :class="{'p-invalid': submitted && !form.interview_date}"
          showButtonBar
          hourFormat="12"
        />
        <small v-if="submitted && !form.interview_date" class="p-error mt-1 inline-block">Interview date is required</small>
      </div>

      <!-- Interview Status -->
      <div class="field">
        <label for="interview-status" class="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <Dropdown
          id="interview-status"
          v-model="form.status"
          :options="interviewStatuses"
          option-label="label"
          option-value="value"
          placeholder="Select Status"
          class="w-full"
          :class="{'p-invalid': submitted && !form.status}"
        />
        <small v-if="submitted && !form.status" class="p-error mt-1 inline-block">Status is required</small>
      </div>

      <!-- Contact -->
      <div class="field">
        <label for="contact" class="block text-sm font-medium text-gray-700 mb-2">Contact <span class="text-gray-500 text-xs">(Optional)</span></label>
        <AutoComplete
          id="contact"
          v-model="selectedContact"
          :suggestions="filteredContacts"
          @complete="searchContacts"
          @item-select="onContactSelect"
          field="name"
          placeholder="Search for a contact"
          class="w-full"
          forceSelection
        >
          <template #empty>
            <div class="p-3 text-gray-500 text-sm">
              No contacts found. Try a different search.
            </div>
          </template>
        </AutoComplete>
      </div>

      <!-- Notes -->
      <div class="field">
        <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <Textarea
          id="notes"
          v-model="form.notes"
          rows="4"
          placeholder="Add any notes about the interview"
          class="w-full"
          autoResize
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2 pt-4 border-t border-gray-100 p-3 bg-gray-50">
        <Button
          label="Cancel"
          icon="pi pi-times"
          outlined
          class="px-3"
          @click="closeDialog"
        />
        <LoadingButton
          :label="editMode ? 'Update' : 'Create'"
          icon="pi pi-check"
          :loading="uiStore.isLoading('saveInterview')"
          loadingText="Saving..."
          class="px-3"
          @click="saveInterview"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import AutoComplete from 'primevue/autocomplete'
import Textarea from 'primevue/textarea'
import LoadingButton from './LoadingButton.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import { supabase } from '../lib/supabase'
import { useUIStore } from '../stores/ui'
import { useToastStore } from '../stores/toast'
import { useOfflineDataStore } from '../stores/offlineData'
import type { Interview, Contact } from '../types/database.types'

const props = defineProps<{
  visible: boolean
  interviewData?: Interview | null
  applicationId: string
}>()

const emit = defineEmits(['update:visible', 'save-interview'])

const uiStore = useUIStore()
const toastStore = useToastStore()
const offlineStore = useOfflineDataStore()
const submitted = ref(false)
const editMode = ref(false)
const selectedContact = ref<Contact | null>(null)
const filteredContacts = ref<Contact[]>([])

// Form data
const form = ref({
  interview_type: '',
  interview_date: null as Date | null,
  status: 'scheduled',
  contact_id: null as string | null,
  notes: '',
  job_application_id: props.applicationId
})

// Options for dropdowns
const interviewTypes = [
  { label: 'Phone Screening', value: 'phone' },
  { label: 'Video Interview', value: 'video' },
  { label: 'Onsite Interview', value: 'onsite' },
  { label: 'Technical Assessment', value: 'technical' },
  { label: 'Other', value: 'other' }
]

const interviewStatuses = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

// Watch for changes in visible prop
watch(() => props.visible, (newValue) => {
  if (newValue && props.interviewData) {
    // Edit mode - populate form with existing data
    loadInterviewData();
  } else {
    // Add mode - reset form
    resetForm()
  }
})

// Watch for changes in applicationId
watch(() => props.applicationId, (newValue) => {
  form.value.job_application_id = newValue
})

async function loadInterviewData() {
  editMode.value = true;
  
  if (!props.interviewData) return;
  
  await uiStore.withLoading(
    'loadInterview',
    async () => {
      try {
        form.value.interview_type = props.interviewData!.interview_type;
        form.value.interview_date = new Date(props.interviewData!.interview_date);
        form.value.status = props.interviewData!.status;
        form.value.contact_id = props.interviewData!.contact_id || null;
        form.value.notes = props.interviewData!.notes || '';
        
        // Load contact data if available
        if (props.interviewData!.contact_id) {
          await loadContact(props.interviewData!.contact_id);
        } else {
          selectedContact.value = null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load interview data';
        uiStore.setError('interviewForm', errorMessage);
        toastStore.error(errorMessage);
      }
    },
    { delay: 300 }
  );
}

// Search contacts
async function searchContacts(event: { query: string }) {
  try {
    // First check offline data
    if (!navigator.onLine) {
      const allContacts = await offlineStore.fetchData('contacts');
      filteredContacts.value = allContacts.filter((contact: any) => 
        contact.name.toLowerCase().includes(event.query.toLowerCase())
      );
      return;
    }
    
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .ilike('name', `%${event.query}%`)
      .limit(10)

    if (error) throw error
    filteredContacts.value = data || []
    
    // Cache contacts for offline use
    if (data && data.length > 0) {
      for (const contact of data) {
        await offlineStore.saveData('contacts', contact);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search contacts';
    toastStore.error(errorMessage);
  }
}

// Handle contact selection
function onContactSelect(event: { value: Contact }) {
  selectedContact.value = event.value;
  form.value.contact_id = event.value.id;
}

// Load contact data
async function loadContact(contactId: string) {
  try {
    // Try to get from offline store first
    const offlineData = await offlineStore.getById('contacts', contactId);
    
    if (offlineData) {
      selectedContact.value = offlineData;
      return;
    }
    
    // If not in offline store, fetch from server
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single()

    if (error) throw error
    selectedContact.value = data
    
    // Cache the contact
    if (data) {
      await offlineStore.saveData('contacts', data);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load contact';
    toastStore.error(errorMessage);
  }
}

// Save interview
async function saveInterview() {
  submitted.value = true

  // Form validation
  if (!form.value.interview_type || !form.value.interview_date || !form.value.status) {
    toastStore.warning('Please fill in all required fields');
    return
  }

  await uiStore.withLoading(
    'saveInterview',
    async () => {
      try {
        const formData: {
          interview_type: string;
          interview_date: Date | null;
          status: string;
          contact_id: string | null;
          notes: string;
          job_application_id: string;
          id?: string;
        } = {
          interview_type: form.value.interview_type,
          interview_date: form.value.interview_date,
          status: form.value.status,
          contact_id: form.value.contact_id,
          notes: form.value.notes,
          job_application_id: form.value.job_application_id
        }
        
        let result;
        
        if (editMode.value && props.interviewData) {
          // Update
          formData.id = props.interviewData.id;
          result = await offlineStore.saveData('interviews', formData);
        } else {
          // Create
          result = await offlineStore.saveData('interviews', formData);
        }
        
        if (result) {
          const successMessage = editMode.value 
            ? 'Interview updated successfully' 
            : 'Interview scheduled successfully';
            
          toastStore.success(successMessage);
          emit('save-interview', result);
          closeDialog();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save interview';
        uiStore.setError('interviewForm', errorMessage);
        toastStore.error(errorMessage);
      }
    }
  );
}

// Reset form
function resetForm() {
  editMode.value = false
  submitted.value = false
  form.value = {
    interview_type: '',
    interview_date: null,
    status: 'scheduled',
    contact_id: null,
    notes: '',
    job_application_id: props.applicationId
  }
  selectedContact.value = null
  uiStore.clearError('interviewForm');
}

// Close dialog
function closeDialog() {
  resetForm()
  emit('update:visible', false)
}
</script>

<style scoped>
:deep(.interview-dialog) {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.interview-dialog .p-dialog-header) {
  padding: 1.25rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.interview-dialog .p-dialog-title) {
  font-weight: 600;
  font-size: 1.125rem;
  color: #111827;
}

:deep(.interview-dialog .p-dialog-content) {
  padding: 1.5rem;
}

:deep(.interview-dialog .p-dropdown) {
  border-radius: 0.375rem;
  border-color: #d1d5db;
  transition: all 0.2s ease;
}

:deep(.interview-dialog .p-dropdown:hover) {
  border-color: #9ca3af;
}

:deep(.interview-dialog .p-dropdown:focus) {
  box-shadow: 0 0 0 2px #e1f5fe;
  border-color: #3b82f6;
}

:deep(.interview-dialog .p-calendar) {
  width: 100%;
}

:deep(.interview-dialog .p-calendar .p-inputtext) {
  border-radius: 0.375rem;
  border-color: #d1d5db;
  transition: all 0.2s ease;
  width: 100%;
}

:deep(.interview-dialog .p-calendar .p-inputtext:hover) {
  border-color: #9ca3af;
}

:deep(.interview-dialog .p-calendar .p-inputtext:focus) {
  box-shadow: 0 0 0 2px #e1f5fe;
  border-color: #3b82f6;
}

:deep(.interview-dialog .p-autocomplete) {
  width: 100%;
}

:deep(.interview-dialog .p-autocomplete .p-inputtext) {
  border-radius: 0.375rem;
  border-color: #d1d5db;
  transition: all 0.2s ease;
  width: 100%;
}

:deep(.interview-dialog .p-autocomplete .p-inputtext:hover) {
  border-color: #9ca3af;
}

:deep(.interview-dialog .p-autocomplete .p-inputtext:focus) {
  box-shadow: 0 0 0 2px #e1f5fe;
  border-color: #3b82f6;
}

:deep(.interview-dialog .p-inputtextarea) {
  border-radius: 0.375rem;
  border-color: #d1d5db;
  transition: all 0.2s ease;
}

:deep(.interview-dialog .p-inputtextarea:hover) {
  border-color: #9ca3af;
}

:deep(.interview-dialog .p-inputtextarea:focus) {
  box-shadow: 0 0 0 2px #e1f5fe;
  border-color: #3b82f6;
}

:deep(.interview-dialog .p-button) {
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

:deep(.interview-dialog .p-button:hover) {
  transform: translateY(-1px);
}

:deep(.p-dialog-mask) {
  backdrop-filter: blur(2px);
}
</style> 