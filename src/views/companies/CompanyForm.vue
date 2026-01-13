<template>
  <div class="p-6 sm:p-8">
    <!-- Breadcrumb navigation -->
    <div class="mb-6 flex items-center text-sm bg-gray-50 p-3 rounded-lg shadow-sm">
      <router-link to="/dashboard" class="text-blue-600 hover:text-blue-800 transition-colors">
        <i class="pi pi-home mr-1"></i>Dashboard
      </router-link>
      <i class="pi pi-angle-right mx-2 text-gray-500"></i>
      <router-link to="/companies" class="text-blue-600 hover:text-blue-800 transition-colors">Companies</router-link>
      <i class="pi pi-angle-right mx-2 text-gray-500"></i>
      <span class="text-gray-700 font-medium">{{ isEdit ? 'Edit Company' : 'New Company' }}</span>
    </div>

    <!-- Loading Overlay -->
    <LoadingSpinner :loading="uiStore.isLoading('loadCompany')" overlay fullscreen message="Loading company data..." />
    
    <div class="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
      <div class="border-b border-gray-100 p-6">
        <h2 class="text-xl font-bold text-gray-800">
          {{ isEdit ? 'Edit Company' : 'New Company' }}
        </h2>
      </div>

      <div class="p-6">
        <!-- Error Alert -->
        <div v-if="uiStore.getError('companyForm')" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start">
          <i class="pi pi-exclamation-circle text-lg mr-3 mt-0.5"></i>
          <span>{{ uiStore.getError('companyForm') }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <!-- Company Name -->
            <div class="field">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <InputText
                id="name"
                v-model="form.name"
                :class="[getValidationState(v$, 'name'), 'w-full transition-shadow focus:shadow-md']"
                placeholder="Enter company name"
              />
              <small v-if="v$.name.$error" class="p-error mt-1 inline-block">{{ getValidationMessage(v$, 'name') }}</small>
            </div>

            <!-- Website -->
            <div class="field">
              <label for="website" class="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <InputText
                id="website"
                v-model="form.website"
                :class="[getValidationState(v$, 'website'), 'w-full transition-shadow focus:shadow-md']"
                placeholder="https://example.com"
              />
              <small v-if="v$.website.$error" class="p-error mt-1 inline-block">{{ getValidationMessage(v$, 'website') }}</small>
            </div>

            <!-- Industry -->
            <div class="field">
              <label for="industry" class="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <InputText
                id="industry"
                v-model="form.industry"
                :class="[getValidationState(v$, 'industry'), 'w-full transition-shadow focus:shadow-md']"
                placeholder="e.g. Technology, Healthcare"
              />
              <small v-if="v$.industry.$error" class="p-error mt-1 inline-block">{{ getValidationMessage(v$, 'industry') }}</small>
            </div>

            <!-- Location -->
            <div class="field">
              <label for="location" class="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <InputText
                id="location"
                v-model="form.location"
                :class="[getValidationState(v$, 'location'), 'w-full transition-shadow focus:shadow-md']"
                placeholder="e.g. New York, Remote"
              />
              <small v-if="v$.location.$error" class="p-error mt-1 inline-block">{{ getValidationMessage(v$, 'location') }}</small>
            </div>

            <!-- Company Size -->
            <div class="field">
              <label for="company_size" class="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
              <Dropdown
                id="company_size"
                v-model="form.company_size"
                :options="companySizeOptions"
                :class="[getValidationState(v$, 'company_size'), 'w-full transition-shadow focus:shadow-md']"
                placeholder="Select company size"
                optionLabel="label"
                optionValue="value"
              />
              <small v-if="v$.company_size.$error" class="p-error mt-1 inline-block">{{ getValidationMessage(v$, 'company_size') }}</small>
            </div>
          </div>

          <!-- Description -->
          <div class="field col-span-full">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <Textarea
              id="description"
              v-model="form.description"
              class="w-full transition-shadow focus:shadow-md"
              rows="5"
              placeholder="Describe the company, its mission, and values"
              autoResize
            />
          </div>

          <!-- Form Actions -->
          <div class="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              outlined
              class="px-4"
              @click="router.push('/companies')"
            />
            <LoadingButton
              type="submit"
              :label="isEdit ? 'Update Company' : 'Create Company'"
              icon="pi pi-check"
              :loading="uiStore.isLoading('saveCompany')"
              loadingText="Saving..."
              class="px-4"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { supabase } from '../../lib/supabase'
import { companyRules, getValidationState, getValidationMessage } from '../../utils/validations'
import { useUIStore } from '../../stores/ui'
import { useToastStore } from '../../stores/toast'
import { useOfflineDataStore } from '../../stores/offlineData'
import LoadingButton from '../../components/LoadingButton.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()
const toastStore = useToastStore()
const offlineStore = useOfflineDataStore()

const form = ref({
  name: '',
  website: '',
  industry: '',
  location: '',
  company_size: '',
  description: ''
})

const companySizeOptions = [
  { label: '1-10', value: '1-10' },
  { label: '11-50', value: '11-50' },
  { label: '51-200', value: '51-200' },
  { label: '201-500', value: '201-500' },
  { label: '501-1000', value: '501-1000' },
  { label: '1001-5000', value: '1001-5000' },
  { label: '5000+', value: '5000+' }
]

const isEdit = computed(() => route.params.id !== undefined)

const v$ = useVuelidate(companyRules, form)

async function loadCompany() {
  if (!isEdit.value) return

  await uiStore.withLoading(
    'loadCompany',
    async () => {
      try {
        // Try to get from offline store first
        const offlineData = await offlineStore.getById('companies', route.params.id as string);
        
        if (offlineData) {
          form.value = offlineData;
          return;
        }
        
        // If not in offline store, fetch from server
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', route.params.id)
          .single()

        if (error) throw error
        if (data) {
          form.value = data;
          // Cache the data
          await offlineStore.saveData('companies', data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load company';
        uiStore.setError('companyForm', errorMessage);
        toastStore.error('Could not load company data');
      }
    },
    { delay: 300 }
  );
}

async function handleSubmit() {
  const isValid = await v$.value.$validate()
  if (!isValid) {
    toastStore.warning('Please correct the validation errors');
    return;
  }

  await uiStore.withLoading(
    'saveCompany',
    async () => {
      try {
        await offlineStore.saveData('companies', form.value);
        
        toastStore.success(isEdit.value ? 'Company updated successfully' : 'Company created successfully');
        router.push('/companies');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save company';
        uiStore.setError('companyForm', errorMessage);
        toastStore.error(errorMessage);
      }
    }
  );
}

onMounted(() => {
  loadCompany()
})
</script>

<style scoped>
:deep(.p-inputtext),
:deep(.p-dropdown) {
  padding: 0.75rem;
  border-radius: 0.375rem;
  border-color: #e5e7eb;
  transition: all 0.2s ease;
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-dropdown:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
  padding: 0.75rem 1rem;
  transition: background-color 0.2s ease;
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item:hover) {
  background-color: #f1f5f9;
}

:deep(.p-button) {
  transition: all 0.2s ease;
}

:deep(.p-button.p-button-outlined:enabled:hover) {
  background-color: rgba(59, 130, 246, 0.04);
}

:deep(.p-dropdown-panel) {
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}
</style> 
