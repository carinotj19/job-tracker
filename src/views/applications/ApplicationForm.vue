<template>
  <div class="p-6">
    <!-- Loading Overlay -->
    <LoadingSpinner :loading="uiStore.isLoading('applicationForm')" overlay fullscreen message="Loading application data..." />
    
    <!-- Breadcrumb navigation -->
    <div class="mb-4 flex items-center text-sm">
      <router-link to="/dashboard" class="text-blue-600 hover:text-blue-800">Dashboard</router-link>
      <i class="pi pi-angle-right mx-2 text-gray-500"></i>
      <router-link to="/applications" class="text-blue-600 hover:text-blue-800">Applications</router-link>
      <i class="pi pi-angle-right mx-2 text-gray-500"></i>
      <span class="text-gray-700">{{ isEditing ? 'Edit Application' : 'New Application' }}</span>
    </div>

    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">
        {{ isEditing ? 'Edit Application' : 'New Application' }}
      </h1>

      <!-- Error Alert -->
      <div v-if="uiStore.getError('applicationForm')" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        <i class="pi pi-exclamation-circle mr-2"></i>
        {{ uiStore.getError('applicationForm') }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="title" class="block text-sm font-medium text-gray-700">Job Title</label>
              <InputText id="title" v-model="form.title" :class="getValidationState(v$, 'title')" class="w-full" />
              <small v-if="v$.title.$error" class="p-error">{{ getValidationMessage(v$, 'title') }}</small>
            </div>

            <div class="space-y-2">
              <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
              <AutoComplete id="company" v-model="form.company" :suggestions="companySuggestions"
                @complete="searchCompanies" @item-select="onCompanySelect" field="name" :class="[
                  getValidationState(v$, 'company'),
                  'w-full',
                  { 'p-invalid': v$.company.$error }
                ]" forceSelection />
              <small v-if="v$.company.$error" class="p-error">{{ getValidationMessage(v$, 'company') }}</small>
              <div v-if="!form.company || !form.company.id" class="text-xs text-blue-600 mt-1">
                <a href="#" @click.prevent="openAddCompanyDialog" class="flex items-center">
                  <i class="pi pi-plus mr-1"></i> Add detailed company info
                </a>
              </div>
            </div>

            <div class="space-y-2">
              <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
              <Dropdown id="status" v-model="form.status" :options="statusOptions" optionLabel="label"
                optionValue="value" class="w-full" :class="getValidationState(v$, 'status')" />
              <small v-if="v$.status.$error" class="p-error">{{ getValidationMessage(v$, 'status') }}</small>
            </div>

            <div class="space-y-2">
              <label for="applied_date" class="block text-sm font-medium text-gray-700">Applied Date</label>
              <Calendar id="applied_date" v-model="form.applied_date" :class="getValidationState(v$, 'applied_date')"
                class="w-full" dateFormat="yy-mm-dd" />
              <small v-if="v$.applied_date.$error" class="p-error">{{ getValidationMessage(v$, 'applied_date')
                }}</small>
            </div>

            <div class="space-y-2">
              <label for="salary_range" class="block text-sm font-medium text-gray-700">Salary Range</label>
              <InputText id="salary_range" v-model="form.salary_range" :class="getValidationState(v$, 'salary_range')"
                class="w-full" />
              <small v-if="v$.salary_range.$error" class="p-error">{{ getValidationMessage(v$, 'salary_range')
                }}</small>
            </div>

            <div class="space-y-2">
              <label for="job_posting_url" class="block text-sm font-medium text-gray-700">Job Posting URL</label>
              <InputText id="job_posting_url" v-model="form.job_posting_url"
                :class="getValidationState(v$, 'job_posting_url')" class="w-full" />
              <small v-if="v$.job_posting_url.$error" class="p-error">{{ getValidationMessage(v$, 'job_posting_url')
                }}</small>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Job Description</h2>
          <Textarea v-model="form.description" rows="6" :class="getValidationState(v$, 'description')" class="w-full"
            autoResize />
          <small v-if="v$.description.$error" class="p-error">{{ getValidationMessage(v$, 'description') }}</small>
        </div>

        <!-- Notes -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Notes</h2>
          <Textarea v-model="form.notes" rows="4" :class="getValidationState(v$, 'notes')" class="w-full" autoResize />
          <small v-if="v$.notes.$error" class="p-error">{{ getValidationMessage(v$, 'notes') }}</small>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3">
          <Button type="button" label="Cancel" outlined @click="router.back()" />
          <LoadingButton 
            type="submit" 
            label="Save" 
            :loading="uiStore.isLoading('saveApplication')" 
            loadingText="Saving..."
          />
        </div>
      </form>
    </div>

    <!-- Company Dialog -->
    <Dialog v-model:visible="companyDialog" :style="{ width: '500px' }" header="Add Company Details" :modal="true"
      class="p-fluid">
      <div class="flex flex-col space-y-4">
        <div class="field">
          <label for="company-name" class="block text-sm font-medium text-gray-700">Company Name *</label>
          <InputText id="company-name" v-model="companyForm.name" required autofocus
            :class="{ 'p-invalid': companySubmitted && !companyForm.name }" />
          <small class="p-error" v-if="companySubmitted && !companyForm.name">
            Company name is required.
          </small>
        </div>

        <div class="field">
          <label for="company-website" class="block text-sm font-medium text-gray-700">Website</label>
          <InputText id="company-website" v-model="companyForm.website" type="url" placeholder="https://example.com" />
        </div>

        <div class="field">
          <label for="company-industry" class="block text-sm font-medium text-gray-700">Industry</label>
          <InputText id="company-industry" v-model="companyForm.industry"
            placeholder="e.g. Technology, Healthcare, Finance" />
        </div>

        <div class="field">
          <label for="company-location" class="block text-sm font-medium text-gray-700">Location</label>
          <InputText id="company-location" v-model="companyForm.location"
            placeholder="e.g. New York, Remote, San Francisco" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" icon="pi pi-times" outlined @click="companyDialog = false" />
          <Button label="Save" icon="pi pi-check" @click="saveCompanyDetails" :loading="companySaving" />
        </div>
      </template>
    </Dialog>

    <Button 
      severity="danger" 
      label="Reset Local Database" 
      @click="confirmResetDatabase" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import InputText from 'primevue/inputtext'
import AutoComplete from 'primevue/autocomplete'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import LoadingButton from '../../components/LoadingButton.vue'
import { supabase } from '../../lib/supabase'
import type { JobApplication, Company } from '../../types/database.types'
import { applicationRules, getValidationState, getValidationMessage } from '../../utils/validations'
import { useUIStore } from '../../stores/ui'
import { useToastStore } from '../../stores/toast'
import { useOfflineDataStore } from '../../stores/offlineData'

const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()
const toastStore = useToastStore()
const offlineStore = useOfflineDataStore()

const companySuggestions = ref<Company[]>([])
const companyDialog = ref(false)
const companySubmitted = ref(false)
const companySaving = ref(false)

const isEditing = computed(() => route.params.id !== undefined)

const form = reactive({
  title: '',
  company: null as Company | null,
  status: 'applied',
  applied_date: new Date(),
  salary_range: '',
  job_posting_url: '',
  description: '',
  notes: ''
})

const companyForm = reactive({
  name: '',
  website: '',
  industry: '',
  location: '',
  description: '',
  company_size: null as string | null
})

const statusOptions = [
  { label: 'Applied', value: 'applied' },
  { label: 'Interviewing', value: 'interviewing' },
  { label: 'Offered', value: 'offered' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Withdrawn', value: 'withdrawn' }
]

const v$ = useVuelidate(applicationRules, form)

async function loadApplication() {
  if (isEditing.value) {
    await uiStore.withLoading(
      'applicationForm',
      async () => {
        try {
          // Try to get from offline store first
          const offlineData = await offlineStore.getById('job_applications', route.params.id as string);
          
          if (offlineData) {
            // Format the data for the form
            Object.assign(form, {
              title: offlineData.title,
              company: offlineData.company,
              status: offlineData.status,
              applied_date: new Date(offlineData.applied_date),
              salary_range: offlineData.salary_range || '',
              job_posting_url: offlineData.job_posting_url || '',
              description: offlineData.description || '',
              notes: offlineData.notes || ''
            });
            return;
          }
          
          // If not in offline store, fetch from server
          const { data, error } = await supabase
            .from('job_applications')
            .select(`
              *,
              company:companies(*)
            `)
            .eq('id', route.params.id)
            .single();

          if (error) throw error;

          // Format the data for the form
          Object.assign(form, {
            title: data.title,
            company: data.company,
            status: data.status,
            applied_date: new Date(data.applied_date),
            salary_range: data.salary_range || '',
            job_posting_url: data.job_posting_url || '',
            description: data.description || '',
            notes: data.notes || ''
          });
          
          // Cache the data
          await offlineStore.saveData('job_applications', data);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load application';
          uiStore.setError('applicationForm', errorMessage);
          toastStore.error('Could not load application data');
        }
      },
      { errorMessage: 'Failed to load application data' }
    );
  } else {
    // Check if company ID is provided in query parameters
    const companyId = route.query.company as string;
    if (companyId) {
      loadCompanyById(companyId);
    }
  }
}

async function loadCompanyById(companyId: string) {
  await uiStore.withLoading(
    'loadCompany',
    async () => {
      try {
        // Try to get from offline store first
        const offlineData = await offlineStore.getById('companies', companyId);
        
        if (offlineData) {
          form.company = offlineData;
          return;
        }
        
        // If not in offline store, fetch from server
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyId)
          .single();

        if (error) throw error;

        if (data) {
          form.company = data;
          // Cache the data
          await offlineStore.saveData('companies', data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load company';
        toastStore.error(errorMessage);
      }
    }
  );
}

async function searchCompanies(event: { query: string }) {
  try {
    const searchTerm = event.query.toLowerCase();
    
    // If offline, search locally
    if (!navigator.onLine) {
      const allCompanies = await offlineStore.fetchData('companies');
      companySuggestions.value = allCompanies.filter((company: any) => 
        company.name.toLowerCase().includes(searchTerm)
      );
      return;
    }
    
    // Otherwise search on server
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .limit(10);

    if (error) throw error;
    companySuggestions.value = data || [];
    
    // Cache results
    if (data && data.length > 0) {
      for (const company of data) {
        await offlineStore.saveData('companies', company);
      }
    }
  } catch (error) {
    console.error('Error searching companies:', error);
    toastStore.error('Failed to search companies');
  }
}

async function handleSubmit() {
  const isValid = await v$.value.$validate();
  if (!isValid) {
    toastStore.warning('Please correct the validation errors');
    return;
  }
  
  await uiStore.withLoading(
    'saveApplication',
    async () => {
      try {
        const applicationData: {
          title: string;
          company_id: string | undefined;
          status: string;
          applied_date: Date;
          salary_range: string;
          job_posting_url: string;
          description: string;
          notes: string;
          id?: string;
        } = {
          title: form.title,
          company_id: form.company?.id,
          status: form.status,
          applied_date: form.applied_date,
          salary_range: form.salary_range,
          job_posting_url: form.job_posting_url,
          description: form.description,
          notes: form.notes
        };

        let result;
        
        // Use the offline store to handle saving, which will automatically handle
        // online/offline scenarios and synchronization
        if (isEditing.value) {
          applicationData.id = route.params.id as string;
          result = await offlineStore.saveData('job_applications', applicationData);
        } else {
          result = await offlineStore.saveData('job_applications', applicationData);
        }
        
        if (result) {
          const message = isEditing.value 
            ? 'Application updated successfully' 
            : 'Application created successfully';
          
          toastStore.success(message);
          router.push('/applications');
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to save application';
        
        uiStore.setError('saveApplication', errorMessage);
        toastStore.error(errorMessage);
      }
    }
  );
}

async function saveCompanyDetails() {
  companySubmitted.value = true;
  
  if (!companyForm.name) return;
  
  await uiStore.withLoading(
    'saveCompany',
    async () => {
      try {
        // Use offline store to handle saving
        const newCompany = await offlineStore.saveData('companies', companyForm);
        
        if (newCompany) {
          form.company = newCompany;
          companyDialog.value = false;
          companySubmitted.value = false;
          resetCompanyForm();
          toastStore.success('Company added successfully');
        }
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to save company details';
        
        toastStore.error(errorMessage);
      }
    }
  );
}

onMounted(() => {
  loadApplication();
});

function onCompanySelect(event: { value: Company }) {
  form.company = event.value;
}

function openAddCompanyDialog() {
  if (form.company && form.company.name && !form.company.id) {
    companyForm.name = form.company.name;
  }
  companyDialog.value = true;
}

function resetCompanyForm() {
  companyForm.name = '';
  companyForm.website = '';
  companyForm.industry = '';
  companyForm.location = '';
  companyForm.description = '';
  companyForm.company_size = null;
}

function confirmResetDatabase() {
  // Implement the logic to confirm and reset the local database
  console.log('Reset local database');
}
</script>

<style scoped></style>