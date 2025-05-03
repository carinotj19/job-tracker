<template>
  <div class="p-6">
    <!-- Breadcrumb navigation -->
    <div class="mb-4 flex items-center text-sm">
      <router-link to="/dashboard" class="text-blue-600 hover:text-blue-800">Dashboard</router-link>
      <i class="pi pi-angle-right mx-2 text-gray-500"></i>
      <span class="text-gray-700">Companies</span>
    </div>

    <div class="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
      <div class="border-b border-gray-100 p-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Companies</h2>
            <p class="text-sm text-gray-600 mt-1">Manage companies you're applying to</p>
          </div>
          <div class="flex gap-2">
            <Button label="Dashboard" icon="pi pi-home" outlined @click="router.push('/dashboard')" />
            <Button label="Applications" icon="pi pi-briefcase" outlined @click="router.push('/applications')" />
            <Button label="New Company" icon="pi pi-plus" @click="openNewCompanyDialog" />
          </div>
        </div>

        <DataTable :value="companies" :paginator="true" :rows="10" :loading="uiStore.isLoading('applicationList')"
          :globalFilterFields="['name', 'website', 'industry', 'location']" responsive-layout="stack"
          class="p-datatable-sm" v-model:filters="filters" filter-display="menu" rowHover stripedRows
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink">
          <template #header>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-2">
              <Button
                type="button"
                icon="pi pi-filter-slash"
                label="Clear Filters"
                outlined
                size="small"
                class="px-3 self-start"
                @click="clearFilters"
              />
              <span class="p-input-icon-left w-full sm:w-auto">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Search companies..." class="w-full sm:w-auto"/>
              </span>
            </div>
          </template>

          <Column field="name" header="Company Name" sortable>
            <template #body="{ data }">
              <div class="font-medium text-primary-600 cursor-pointer" @click="viewCompanyApplications(data)">
                {{ data.name }}
              </div>
            </template>
          </Column>
          <Column field="website" header="Website">
            <template #body="{ data }">
              <a v-if="data.website" :href="ensureHttps(data.website)" target="_blank" rel="noopener noreferrer"
                class="text-blue-600 hover:underline">
                {{ formatWebsiteUrl(data.website) }}
              </a>
              <span v-else>-</span>
            </template>
          </Column>
          <Column field="industry" header="Industry" sortable />
          <Column field="location" header="Location" sortable />
          <Column field="applications" header="Applications" sortable style="min-width:5rem"
          headerClass="text-center bg-gray-50" bodyClass="text-center whitespace-nowrap">
            <template #body="{ data }">
              <Button v-if="data.applications && data.applications.length > 0"
                :label="data.applications.length.toString()" size="small" severity="info" text outlined
                class="p-button-rounded" @click="viewCompanyApplications(data)" />
              <Tag v-else value="0" severity="info" />
            </template>
          </Column>
          <Column :exportable="false" style="min-width: 8rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-pencil" text rounded aria-label="Edit" @click="editCompany(data)" />
                <Button icon="pi pi-external-link" text rounded severity="success" aria-label="Visit Website"
                  v-if="data.website" @click="openWebsite(data.website)" />
                <Button icon="pi pi-plus" text rounded severity="warning" aria-label="Add Application"
                  @click="addApplicationForCompany(data)" />
                <Button icon="pi pi-trash" text rounded severity="danger" aria-label="Delete"
                  @click="confirmDelete(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Company Dialog -->
      <Dialog v-model:visible="companyDialog" :style="{ width: '500px' }"
        :header="dialogMode === 'new' ? 'New Company' : 'Edit Company'" :modal="true" class="p-fluid">
        <div class="flex flex-col space-y-4">
          <div class="field">
            <label for="name" class="block text-sm font-medium text-gray-700">Company Name *</label>
            <InputText id="name" v-model="companyForm.name" required autofocus
              :class="{ 'p-invalid': submitted && !companyForm.name }" />
            <small class="p-error" v-if="submitted && !companyForm.name">
              Company name is required.
            </small>
          </div>

          <div class="field">
            <label for="website" class="block text-sm font-medium text-gray-700">Website</label>
            <InputText id="website" v-model="companyForm.website" type="url" placeholder="https://example.com" />
          </div>

          <div class="field">
            <label for="industry" class="block text-sm font-medium text-gray-700">Industry</label>
            <InputText id="industry" v-model="companyForm.industry" placeholder="e.g. Technology, Healthcare, Finance" />
          </div>

          <div class="field">
            <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
            <InputText id="location" v-model="companyForm.location" placeholder="e.g. New York, Remote, San Francisco" />
          </div>

          <div class="field">
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <Textarea id="description" v-model="companyForm.description" rows="3"
              placeholder="Brief description of the company" />
          </div>

          <div class="field">
            <label for="company_size" class="block text-sm font-medium text-gray-700">Company Size</label>
            <Dropdown id="company_size" v-model="companyForm.company_size" :options="companySizeOptions"
              optionLabel="label" optionValue="value" placeholder="Select company size" />
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <Button label="Cancel" icon="pi pi-times" outlined @click="hideDialog" />
            <Button label="Save" icon="pi pi-check" @click="saveCompany" :loading="uiStore.isLoading('saveCompany')" />
          </div>
        </template>
      </Dialog>

      <!-- Delete Confirmation Dialog -->
      <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Confirm Delete" :modal="true">
        <div class="confirmation-content">
          <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
          <span>Are you sure you want to delete this company?</span>
          <p v-if="hasApplications" class="mt-2 text-yellow-600">
            <i class="pi pi-exclamation-circle mr-2"></i>
            This company has associated applications that will also be deleted.
          </p>
        </div>
        <template #footer>
          <Button label="No" icon="pi pi-times" outlined @click="deleteDialog = false" />
          <Button label="Yes" icon="pi pi-check" severity="danger" @click="deleteCompany" />
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FilterMatchMode } from 'primevue/api'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../stores/ui'
import { useToastStore } from '../../stores/toast'
import { useOfflineDataStore } from '../../stores/offlineData'
import type { Company } from '../../types/database.types'

interface CompanyWithApplications extends Company {
  applications?: Array<{ id: string }>;
}

const router = useRouter()
const uiStore = useUIStore()
const toastStore = useToastStore()
const offlineStore = useOfflineDataStore()
const companies = ref<CompanyWithApplications[]>([])
const companyDialog = ref(false)
const deleteDialog = ref(false)
const submitted = ref(false)
const dialogMode = ref<'new' | 'edit'>('new')
const saving = ref(false)

const companyForm = ref({
  id: null as string | null,
  name: '',
  website: '',
  industry: '',
  location: '',
  description: '',
  company_size: null as string | null
})

const companyToDelete = ref<CompanyWithApplications | null>(null)

const hasApplications = computed(() => {
  return companyToDelete.value?.applications && companyToDelete.value.applications.length > 0;
})

const companySizeOptions = [
  { label: '1-10 employees', value: '1-10' },
  { label: '11-50 employees', value: '11-50' },
  { label: '51-200 employees', value: '51-200' },
  { label: '201-500 employees', value: '201-500' },
  { label: '501-1000 employees', value: '501-1000' },
  { label: '1001-5000 employees', value: '1001-5000' },
  { label: '5001-10000 employees', value: '5001-10000' },
  { label: '10000+ employees', value: '10000+' }
]

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  industry: { value: null, matchMode: FilterMatchMode.CONTAINS },
  location: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

function clearFilters() {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    industry: { value: null, matchMode: FilterMatchMode.CONTAINS },
    location: { value: null, matchMode: FilterMatchMode.CONTAINS }
  }
}

function ensureHttps(url: string): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
}

function formatWebsiteUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

function openWebsite(url: string) {
  const fullUrl = ensureHttps(url);
  window.open(fullUrl, '_blank');
}

function viewCompanyApplications(company: Company) {
  router.push({
    path: '/applications',
    query: { company: company.id }
  });
}

function addApplicationForCompany(company: Company) {
  router.push({
    name: 'new-application',
    query: { company: company.id }
  });
}

async function loadCompanies() {
  await uiStore.withLoading(
    'applicationList',
    async () => {
      try {
        // Try to get from offline store first
        if (!navigator.onLine) {
          try {
            const offlineData = await offlineStore.fetchData('companies');
            companies.value = offlineData || [];
          } catch (error) {
            console.error('Error fetching from offline store:', error);
            companies.value = [];
            toastStore.error('Failed to load offline data. Please try again or restart the application.', {
              title: 'Offline Data Error',
              duration: 5000
            });
          }
          return;
        }

        const { data, error } = await supabase
          .from('companies')
          .select(`
            *,
            applications:job_applications(id)
          `)
          .order('name');

        if (error) throw error;
        companies.value = data || [];

        // Cache the data for offline use
        if (data) {
          try {
            for (const company of data) {
              const { applications, ...rawCompany } = company
              await offlineStore.saveData('companies', rawCompany)
            }
          } catch (error) {
            console.error('Error caching data for offline use:', error);
            toastStore.warning('Could not cache data for offline use', {
              title: 'Sync Warning',
              duration: 3000
            });
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load companies';
        toastStore.error(errorMessage);
      }
    },
    { delay: 300 }
  );
}

function openNewCompanyDialog() {
  companyForm.value = {
    id: null,
    name: '',
    website: '',
    industry: '',
    location: '',
    description: '',
    company_size: null
  };
  submitted.value = false;
  dialogMode.value = 'new';
  companyDialog.value = true;
}

function editCompany(company: CompanyWithApplications) {
  companyForm.value = {
    id: company.id,
    name: company.name || '',
    website: company.website || '',
    industry: company.industry || '',
    location: company.location || '',
    description: company.description || '',
    company_size: company.company_size || null
  };
  dialogMode.value = 'edit';
  companyDialog.value = true;
}

function hideDialog() {
  companyDialog.value = false;
  submitted.value = false;
}

async function saveCompany() {
  try {
    submitted.value = true;

    if (!companyForm.value.name.trim()) {
      return;
    }

    saving.value = true;
    const companyData = {
      name: companyForm.value.name,
      website: companyForm.value.website,
      industry: companyForm.value.industry,
      location: companyForm.value.location,
      description: companyForm.value.description,
      company_size: companyForm.value.company_size
    };

    if (dialogMode.value === 'edit' && companyForm.value.id) {
      const { error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', companyForm.value.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('companies')
        .insert(companyData);

      if (error) throw error;
    }

    companyDialog.value = false;
    await loadCompanies();
  } catch (error) {
    console.error('Error saving company:', error);
  } finally {
    saving.value = false;
  }
}

function confirmDelete(company: CompanyWithApplications) {
  companyToDelete.value = company;
  deleteDialog.value = true;
}

async function deleteCompany() {
  if (!companyToDelete.value) return;

  deleteDialog.value = false;

  await uiStore.withLoading(
    'deleteCompany',
    async () => {
      try {
        await offlineStore.deleteData('companies', companyToDelete.value!.id);

        // Remove from the local list
        companies.value = companies.value.filter(
          a => a.id !== companyToDelete.value!.id
        );

        toastStore.success('Company deleted successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete application';
        toastStore.error(errorMessage);
      } finally {
        companyToDelete.value = null;
      }
    }
  );
}

onMounted(() => {
  loadCompanies();
});
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

:deep(.p-tag) {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  min-width: 3rem;
  justify-content: center;
}

:deep(.p-button.p-button-rounded) {
  min-width: 3rem;
  font-weight: 600;
}

:deep(.p-button-text) {
  transition: all 0.2s ease;
}

:deep(.p-button-text:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.confirmation-content) {
  display: flex;
  align-items: center;
  padding: 1rem;
}
</style>