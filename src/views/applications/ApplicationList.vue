<template>
  <div class="p-6 sm:p-8">
    <!-- Breadcrumb navigation -->
    <div class="mb-6 flex items-center text-sm bg-gray-50 p-3 rounded-lg shadow-sm">
      <router-link to="/dashboard" class="text-blue-600 hover:text-blue-800 transition-colors">
        <i class="pi pi-home mr-1"></i>Dashboard
      </router-link>
      <i class="pi pi-angle-right mx-2 text-gray-500"></i>
      <span class="text-gray-700 font-medium">Applications</span>
      <template v-if="selectedCompany">
        <i class="pi pi-angle-right mx-2 text-gray-500"></i>
        <span class="text-blue-600 font-medium">{{ selectedCompany.name }}</span>
      </template>
    </div>

    <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
      <div class="border-b border-gray-100 p-6">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800 mb-1">
              <template v-if="selectedCompany">
                Applications for {{ selectedCompany.name }}
              </template>
              <template v-else>
                Job Applications
              </template>
            </h2>
            <p class="text-sm text-gray-600">Track and manage your job applications</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button 
              label="Dashboard" 
              icon="pi pi-home" 
              outlined 
              class="px-3"
              @click="router.push('/dashboard')" 
            />
            <Button 
              v-if="selectedCompany"
              label="All Applications" 
              icon="pi pi-list" 
              outlined 
              class="px-3"
              @click="router.push('/applications')" 
            />
            <Button 
              label="Contacts" 
              icon="pi pi-users" 
              outlined 
              class="px-3"
              @click="router.push('/contacts')" 
            />
            <Button 
              label="New Application" 
              icon="pi pi-plus" 
              class="px-3"
              @click="navigateToNewApplication" 
            />
          </div>
        </div>
      </div>

      <DataTable
        :value="applications"
        :paginator="true"
        :rows="10"
        :loading="uiStore.isLoading('applicationList')"
        responsive-layout="stack"
        class="p-datatable-sm"
        v-model:filters="filters"
        filter-display="menu"
        :globalFilterFields="['title', 'companies.name', 'status']"
        stripedRows
        :rowHover="true"
      >
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
              <InputText v-model="filters['global'].value" placeholder="Search applications..." class="w-full sm:w-auto" />
            </span>
          </div>
        </template>

        <Column field="title" header="Job Title" sortable>
          <template #body="{ data }">
            <router-link
              :to="`/applications/${data.id}`"
              class="text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              {{ data.title }}
            </router-link>
          </template>
        </Column>
        <Column field="companies.name" header="Company" sortable>
          <template #body="{ data }">
            {{ data.companies ? data.companies.name : '' }}
          </template>
        </Column>
        <Column field="status" header="Status" sortable>
          <template #body="{ data }">
            <Tag 
              :value="data.status" 
              :severity="getStatusSeverity(data.status)" 
              class="status-tag capitalize" 
            />
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
            <div class="flex gap-2 justify-center">
              <Button
                icon="pi pi-eye"
                text
                rounded
                aria-label="View"
                class="action-btn hover:bg-blue-50 transition-colors"
                @click="viewApplication(data)"
              />
              <Button
                icon="pi pi-pencil"
                text
                rounded
                aria-label="Edit"
                class="action-btn hover:bg-blue-50 transition-colors"
                @click="editApplication(data)"
              />
              <Button
                v-if="data.status === 'interviewing'"
                icon="pi pi-calendar"
                text
                rounded
                severity="info"
                aria-label="Interviews"
                class="action-btn hover:bg-blue-50 transition-colors"
                @click="viewInterviews(data)"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                aria-label="Delete"
                class="action-btn hover:bg-red-50 transition-colors"
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
      header="Confirm Delete"
      :modal="true"
      class="p-dialog-custom"
    >
      <div class="confirmation-content p-4 flex items-start gap-4">
        <i class="pi pi-exclamation-triangle text-amber-500" style="font-size: 2rem" />
        <div>
          <h4 class="text-lg font-medium mb-2">Delete Application</h4>
          <p class="text-gray-600">Are you sure you want to delete this application? This action cannot be undone.</p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 p-3 bg-gray-50">
          <Button
            label="Cancel"
            icon="pi pi-times"
            outlined
            @click="deleteDialog = false"
          />
          <LoadingButton
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            :loading="uiStore.isLoading('deleteApplication')"
            @click="deleteApplication"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FilterMatchMode } from 'primevue/api'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../stores/ui'
import { useToastStore } from '../../stores/toast'
import { useOfflineDataStore } from '../../stores/offlineData'
import LoadingButton from '../../components/LoadingButton.vue'
import type { JobApplication } from '../../types/database.types'

interface ApplicationWithCompany extends JobApplication {
  companies?: {
    name: string;
    id: string;
  };
}

const router = useRouter()
const route = useRoute()
const uiStore = useUIStore()
const toastStore = useToastStore()
const offlineStore = useOfflineDataStore()
const applications = ref<ApplicationWithCompany[]>([])
const deleteDialog = ref(false)
const applicationToDelete = ref<ApplicationWithCompany | null>(null)
const selectedCompany = ref<{name: string; id: string} | null>(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  title: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  'companies.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
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
    'companies.name': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
  }
}

async function loadApplications() {
  await uiStore.withLoading(
    'applicationList',
    async () => {
      try {
        // Try to get from offline store first
        if (!navigator.onLine) {
          try {
            const offlineData = await offlineStore.fetchData('job_applications');
            applications.value = offlineData || [];
          } catch (error) {
            console.error('Error fetching from offline store:', error);
            applications.value = [];
            toastStore.error('Failed to load offline data. Please try again or restart the application.', {
              title: 'Offline Data Error',
              duration: 5000
            });
          }
          return;
        }
        
        let query = supabase
          .from('job_applications')
          .select(`
            *,
            companies(name, id)
          `)
        
        // Check if filtering by company
        const companyId = route.query.company
        if (companyId) {
          query = query.eq('company_id', companyId)
          
          // Get company details
          try {
            const { data, error } = await supabase
              .from('companies')
              .select('name, id')
              .eq('id', companyId)
              .single();
              
            if (error) throw error;
            
            if (data) {
              selectedCompany.value = {
                name: data.name,
                id: data.id
              };
            }
          } catch (companyError) {
            console.error('Error fetching company details:', companyError);
          }
        }
        
        // Apply sorting
        const { data, error } = await query.order('applied_date', { ascending: false })

        if (error) throw error
        applications.value = data || []
        
        // Cache the data for offline use
        if (data) {
          try {
            for (const app of data) {
              await offlineStore.saveData('job_applications', app);
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to load applications';
        toastStore.error(errorMessage);
      }
    },
    { delay: 300 }
  );
}

function navigateToNewApplication() {
  // If company selected, pass it as a query parameter
  if (selectedCompany.value) {
    router.push({
      path: '/applications/new',
      query: { company: selectedCompany.value.id }
    });
  } else {
    router.push('/applications/new');
  }
}

function viewApplication(application: ApplicationWithCompany) {
  router.push(`/applications/${application.id}`);
}

function editApplication(application: ApplicationWithCompany) {
  router.push(`/applications/${application.id}/edit`);
}

function viewInterviews(application: ApplicationWithCompany) {
  router.push({
    path: '/interviews',
    query: { application: application.id }
  });
}

function confirmDelete(application: ApplicationWithCompany) {
  applicationToDelete.value = application;
  deleteDialog.value = true;
}

async function deleteApplication() {
  if (!applicationToDelete.value) return;
  
  deleteDialog.value = false;
  
  await uiStore.withLoading(
    'deleteApplication',
    async () => {
      try {
        await offlineStore.deleteData('job_applications', applicationToDelete.value!.id);
        
        // Remove from the local list
        applications.value = applications.value.filter(
          a => a.id !== applicationToDelete.value!.id
        );
        
        toastStore.success('Application deleted successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete application';
        toastStore.error(errorMessage);
      } finally {
        applicationToDelete.value = null;
      }
    }
  );
}

onMounted(() => {
  loadApplications();
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
  min-width: 6rem;
  justify-content: center;
}

:deep(.p-tag.status-tag) {
  text-transform: capitalize;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.p-tag.p-tag-info) {
  background: #e0f2fe;
  color: #0369a1;
}

:deep(.p-tag.p-tag-success) {
  background: #dcfce7;
  color: #15803d;
}

:deep(.p-tag.p-tag-warning) {
  background: #fef3c7;
  color: #92400e;
}

:deep(.p-tag.p-tag-danger) {
  background: #fee2e2;
  color: #b91c1c;
}

:deep(.p-dialog-custom .p-dialog-header) {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.p-dialog-custom .p-dialog-content) {
  padding: 0;
}

:deep(.p-dialog-custom .p-dialog-footer) {
  padding: 0;
  border-top: none;
}

.capitalize {
  text-transform: capitalize;
}

:deep(.action-btn) {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

:deep(.action-btn:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.action-btn .p-button-icon) {
  font-size: 1rem;
}
</style> 
