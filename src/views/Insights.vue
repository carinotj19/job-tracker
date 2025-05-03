<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-semibold text-gray-900">Job Market Insights</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Application Status Distribution</h3>
        <Chart type="doughnut" :data="statusChartData" :options="chartOptions" class="h-64" />
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Response Time Analysis</h3>
        <Chart type="bar" :data="responseTimeChartData" :options="barChartOptions" class="h-64" />
      </div>
    </div>

    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="p-4 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-900">Average Response Time</p>
          <p class="text-2xl font-bold text-blue-600">{{ averageResponseTime }} days</p>
        </div>
        <div class="p-4 bg-green-50 rounded-lg">
          <p class="text-sm text-green-900">Interview Rate</p>
          <p class="text-2xl font-bold text-green-600">{{ interviewRate }}%</p>
        </div>
        <div class="p-4 bg-purple-50 rounded-lg">
          <p class="text-sm text-purple-900">Offer Rate</p>
          <p class="text-2xl font-bold text-purple-600">{{ offerRate }}%</p>
        </div>
        <div class="p-4 bg-yellow-50 rounded-lg">
          <p class="text-sm text-yellow-900">Average Time to Offer</p>
          <p class="text-2xl font-bold text-yellow-600">{{ averageTimeToOffer }} days</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Chart from 'primevue/chart'
import { supabase } from '../lib/supabase'

const statusChartData = ref({
  labels: ['Applied', 'Interviewing', 'Offered', 'Rejected'],
  datasets: [{
    data: [0, 0, 0, 0],
    backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350']
  }]
})

const responseTimeChartData = ref({
  labels: ['< 1 week', '1-2 weeks', '2-4 weeks', '> 4 weeks'],
  datasets: [{
    label: 'Number of Applications',
    data: [0, 0, 0, 0],
    backgroundColor: '#42A5F5'
  }]
})

const averageResponseTime = ref(0)
const interviewRate = ref(0)
const offerRate = ref(0)
const averageTimeToOffer = ref(0)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
}

async function loadInsightsData() {
  try {
    // Get application status distribution
    const { data: applications } = await supabase
      .from('job_applications')
      .select('status, applied_date, interviews(*)')

    if (applications) {
      // Calculate status distribution
      const statusCounts = applications.reduce((acc: Record<string, number>, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
      }, {})

      statusChartData.value.datasets[0].data = [
        statusCounts['applied'] || 0,
        statusCounts['interviewing'] || 0,
        statusCounts['offered'] || 0,
        statusCounts['rejected'] || 0
      ]

      // Calculate response time distribution
      const responseTimeCounts = [0, 0, 0, 0] // < 1 week, 1-2 weeks, 2-4 weeks, > 4 weeks
      const now = new Date()

      applications.forEach(app => {
        if (app.interviews && app.interviews.length > 0) {
          const firstInterview = new Date(app.interviews[0].interview_date)
          const appliedDate = new Date(app.applied_date)
          const daysToResponse = Math.floor((firstInterview.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))

          if (daysToResponse <= 7) responseTimeCounts[0]++
          else if (daysToResponse <= 14) responseTimeCounts[1]++
          else if (daysToResponse <= 28) responseTimeCounts[2]++
          else responseTimeCounts[3]++
        }
      })

      responseTimeChartData.value.datasets[0].data = responseTimeCounts

      // Calculate key metrics
      const totalApplications = applications.length
      const applicationsWithInterviews = applications.filter(app => app.interviews && app.interviews.length > 0).length
      const applicationsWithOffers = applications.filter(app => app.status === 'offered').length

      // Calculate rates
      interviewRate.value = totalApplications > 0 ? Math.round((applicationsWithInterviews / totalApplications) * 100) : 0
      offerRate.value = totalApplications > 0 ? Math.round((applicationsWithOffers / totalApplications) * 100) : 0

      // Calculate average response time
      const applicationsWithResponse = applications.filter(app => app.interviews && app.interviews.length > 0)
      if (applicationsWithResponse.length > 0) {
        const totalResponseTime = applicationsWithResponse.reduce((sum, app) => {
          const firstInterview = new Date(app.interviews[0].interview_date)
          const appliedDate = new Date(app.applied_date)
          return sum + Math.floor((firstInterview.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
        }, 0)
        averageResponseTime.value = Math.round(totalResponseTime / applicationsWithResponse.length)
      }

      // Calculate average time to offer
      const applicationsWithOffersAndInterviews = applications.filter(app => 
        app.status === 'offered' && app.interviews && app.interviews.length > 0
      )
      if (applicationsWithOffersAndInterviews.length > 0) {
        const totalTimeToOffer = applicationsWithOffersAndInterviews.reduce((sum, app) => {
          const lastInterview = new Date(app.interviews[app.interviews.length - 1].interview_date)
          const appliedDate = new Date(app.applied_date)
          return sum + Math.floor((lastInterview.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24))
        }, 0)
        averageTimeToOffer.value = Math.round(totalTimeToOffer / applicationsWithOffersAndInterviews.length)
      }
    }
  } catch (error) {
    console.error('Error loading insights data:', error)
  }
}

onMounted(() => {
  loadInsightsData()
})
</script> 