<template>
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <!-- Statistics Cards -->
      <div class="p-4 bg-white rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Total Applications</h3>
        <p class="text-3xl font-bold text-primary mt-2">{{ totalApplications }}</p>
      </div>
      <div class="p-4 bg-white rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Upcoming Interviews</h3>
        <p class="text-3xl font-bold text-primary mt-2">{{ upcomingInterviews }}</p>
      </div>
      <div class="p-4 bg-white rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Total Companies</h3>
        <p class="text-3xl font-bold text-primary mt-2">{{ totalCompanies }}</p>
      </div>
      <div class="p-4 bg-white rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Application Status</h3>
        <Chart type="doughnut" :data="chartData" :options="chartOptions" class="h-48" />
      </div>
    </div>

    <!-- Quick Access Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div 
        class="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        @click="router.push('/applications')"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-700">Applications</h3>
          <i class="pi pi-briefcase text-2xl text-primary"></i>
        </div>
        <p class="text-gray-600 mt-2">View and manage all your job applications</p>
        <div class="mt-4">
          <Button 
            label="View All" 
            outlined 
            icon="pi pi-arrow-right" 
            class="p-button-sm" 
            @click.stop="router.push('/applications')" 
          />
        </div>
      </div>

      <div 
        class="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        @click="router.push('/companies')"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-700">Companies</h3>
          <i class="pi pi-building text-2xl text-primary"></i>
        </div>
        <p class="text-gray-600 mt-2">Manage companies you're applying to</p>
        <div class="mt-4">
          <Button 
            label="View All" 
            outlined 
            icon="pi pi-arrow-right" 
            class="p-button-sm" 
            @click.stop="router.push('/companies')" 
          />
        </div>
      </div>

      <div 
        class="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        @click="router.push('/contacts')"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-700">Contacts</h3>
          <i class="pi pi-users text-2xl text-primary"></i>
        </div>
        <p class="text-gray-600 mt-2">Manage your professional contacts</p>
        <div class="mt-4">
          <Button 
            label="View All" 
            outlined 
            icon="pi pi-arrow-right" 
            class="p-button-sm" 
            @click.stop="router.push('/contacts')" 
          />
        </div>
      </div>

      <div 
        class="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
        @click="router.push('/applications/new')"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-700">New Application</h3>
          <i class="pi pi-plus-circle text-2xl text-primary"></i>
        </div>
        <p class="text-gray-600 mt-2">Add a new job application to track</p>
        <div class="mt-4">
          <Button 
            label="Create New" 
            outlined 
            icon="pi pi-plus" 
            class="p-button-sm" 
            @click.stop="navigateToNewApplication" 
          />
        </div>
      </div>
    </div>

    <!-- Recent Applications -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">Recent Applications</h2>
        <div class="flex gap-2">
          <Button label="All Applications" icon="pi pi-list" outlined @click="router.push('/applications')" />
          <Button label="New Application" icon="pi pi-plus" @click="navigateToNewApplication" />
        </div>
      </div>
      
      <DataTable :value="recentApplications" :paginator="true" :rows="5" responsive-layout="stack">
        <Column field="title" header="Job Title">
          <template #body="{ data }">
            <a 
              @click="viewApplication(data)" 
              class="text-primary hover:underline cursor-pointer font-medium"
            >
              {{ data.title }}
            </a>
          </template>
        </Column>
        <Column field="company.name" header="Company" />
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="getStatusSeverity(data.status)" class="px-4 py-1 text-xs uppercase font-semibold"/>
          </template>
        </Column>
        <Column field="applied_date" header="Applied Date">
          <template #body="{ data }">
            {{ new Date(data.applied_date).toLocaleDateString() }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-1">
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
                v-if="data.status === 'interviewing'" 
                icon="pi pi-calendar" 
                text 
                rounded 
                severity="info" 
                aria-label="Interviews" 
                @click="viewInterviews(data)" 
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'primevue/chart'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { supabase } from '../lib/supabase'
import type { JobApplication } from '../types/database.types'

const router = useRouter()
const totalApplications = ref(0)
const upcomingInterviews = ref(0)
const totalCompanies = ref(0)
const recentApplications = ref<JobApplication[]>([])

const chartData = ref({
  labels: ['Applied', 'Interviewing', 'Offered', 'Rejected'],
  datasets: [{
    data: [0, 0, 0, 0],
    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350']
  }]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}

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

async function loadDashboardData() {
  try {
    // Get total applications
    const { count: applicationsCount } = await supabase
      .from('job_applications')
      .select('*', { count: 'exact', head: true })

    totalApplications.value = applicationsCount || 0

    // Get upcoming interviews
    const { count: interviewsCount } = await supabase
      .from('interviews')
      .select('*', { count: 'exact', head: true })
      .gte('interview_date', new Date().toISOString())
      .eq('status', 'scheduled')

    upcomingInterviews.value = interviewsCount || 0

    // Get total companies
    const { count: companiesCount } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })

    totalCompanies.value = companiesCount || 0

    // Get recent applications with company info
    const { data: applications } = await supabase
      .from('job_applications')
      .select(`
        *,
        company:companies(name)
      `)
      .order('applied_date', { ascending: false })
      .limit(5)

    if (applications) {
      recentApplications.value = applications
    }

    // Get application status counts for chart
    const { data: statusCounts } = await supabase
      .from('job_applications')
      .select('status')

    if (statusCounts) {
      const counts = statusCounts.reduce((acc: Record<string, number>, curr: { status: string }) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
      }, {})

      chartData.value.datasets[0].data = [
        counts['applied'] || 0,
        counts['interviewing'] || 0,
        counts['offered'] || 0,
        counts['rejected'] || 0
      ]
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

function navigateToNewApplication() {
  router.push({ name: 'new-application' })
}

function viewApplication(application: JobApplication) {
  router.push({ name: 'application-details', params: { id: application.id } })
}

function editApplication(application: JobApplication) {
  router.push({ name: 'edit-application', params: { id: application.id } })
}

function viewInterviews(application: JobApplication) {
  router.push({ name: 'application-details', params: { id: application.id }, hash: '#interviews' })
}

onMounted(() => {
  loadDashboardData()
})
</script> 
