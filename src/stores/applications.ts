import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { JobApplication, ApplicationStats } from '../types'

export const useApplicationsStore = defineStore('applications', () => {
  const applications = ref<JobApplication[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const stats = computed<ApplicationStats>(() => {
    const total = applications.value.length
    const active = applications.value.filter(app => app.status !== 'rejected').length
    const interviews = applications.value.filter(app => app.status === 'interview').length
    const offers = applications.value.filter(app => app.status === 'offer').length

    return {
      total_applications: total,
      active_applications: active,
      interview_rate: total > 0 ? (interviews / total) * 100 : 0,
      offer_rate: total > 0 ? (offers / total) * 100 : 0,
      average_response_time: 0 // TODO: Calculate based on application dates
    }
  })

  async function fetchApplications() {
    loading.value = true
    error.value = null
    try {
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .select('*')
        .order('applied_date', { ascending: false })

      if (supabaseError) throw supabaseError
      applications.value = data || []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch applications'
    } finally {
      loading.value = false
    }
  }

  async function addApplication(application: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>) {
    loading.value = true
    error.value = null
    try {
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .insert([application])
        .select()
        .single()

      if (supabaseError) throw supabaseError
      if (data) applications.value.unshift(data)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to add application'
    } finally {
      loading.value = false
    }
  }

  async function updateApplication(id: string, updates: Partial<JobApplication>) {
    loading.value = true
    error.value = null
    try {
      const { data, error: supabaseError } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (supabaseError) throw supabaseError
      if (data) {
        const index = applications.value.findIndex(app => app.id === id)
        if (index !== -1) applications.value[index] = data
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to update application'
    } finally {
      loading.value = false
    }
  }

  async function deleteApplication(id: string) {
    loading.value = true
    error.value = null
    try {
      const { error: supabaseError } = await supabase
        .from('applications')
        .delete()
        .eq('id', id)

      if (supabaseError) throw supabaseError
      applications.value = applications.value.filter(app => app.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to delete application'
    } finally {
      loading.value = false
    }
  }

  return {
    applications,
    loading,
    error,
    stats,
    fetchApplications,
    addApplication,
    updateApplication,
    deleteApplication
  }
}) 