<template>
  <div class="p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        <h3 class="text-lg font-semibold text-gray-700">Application Status</h3>
        <Chart type="doughnut" :data="chartData" :options="chartOptions" class="h-48" />
      </div>
    </div>

    <!-- Recent Applications -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">Recent Applications</h2>
        <Button label="New Application" icon="pi pi-plus" @click="navigateToNewApplication" />
      </div>
      
      <DataTable :value="recentApplications" :paginator="true" :rows="5" responsive-layout="stack">
        <Column field="title" header="Job Title" />
        <Column field="company.name" header="Company" />
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
          </template>
        </Column>
        <Column field="applied_date" header="Applied Date">
          <template #body="{ data }">
            {{ new Date(data.applied_date).toLocaleDateString() }}
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <Button icon="pi pi-eye" text rounded aria-label="View" @click="viewApplication(data)" />
            <Button icon="pi pi-pencil" text rounded aria-label="Edit" @click="editApplication(data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Chart } from 'vue-chartjs'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { supabase } from '../lib/supabase'
import type { JobApplication } from '../types/database.types'

const router = useRouter()
const totalApplications = ref(0)
const upcomingInterviews = ref(0)
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
      const counts = statusCounts.reduce((acc: Record<string, number>, curr) => {
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
  router.push('/applications/new')
}

function viewApplication(application: JobApplication) {
  router.push(`/applications/${application.id}`)
}

function editApplication(application: JobApplication) {
  router.push(`/applications/${application.id}/edit`)
}

onMounted(() => {
  loadDashboardData()
})
</script> 