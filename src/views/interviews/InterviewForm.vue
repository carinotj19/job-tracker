<template>
  <div class="p-6">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">
        {{ isEdit ? 'Edit Interview' : 'New Interview' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Job Application -->
          <div class="field">
            <label for="job_application_id" class="block text-sm font-medium text-gray-700 mb-2">Job Application</label>
            <Dropdown
              id="job_application_id"
              v-model="form.job_application_id"
              :options="jobApplications"
              optionLabel="title"
              optionValue="id"
              :class="getValidationState(v$, 'job_application_id')"
              class="w-full"
              placeholder="Select a job application"
            />
            <small v-if="v$.job_application_id.$error" class="p-error">{{ getValidationMessage(v$, 'job_application_id') }}</small>
          </div>

          <!-- Interview Date -->
          <div class="field">
            <label for="interview_date" class="block text-sm font-medium text-gray-700 mb-2">Interview Date</label>
            <Calendar
              id="interview_date"
              v-model="form.interview_date"
              :class="getValidationState(v$, 'interview_date')"
              class="w-full"
              :minDate="new Date()"
              showTime
              hourFormat="12"
            />
            <small v-if="v$.interview_date.$error" class="p-error">{{ getValidationMessage(v$, 'interview_date') }}</small>
          </div>

          <!-- Interview Type -->
          <div class="field">
            <label for="interview_type" class="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
            <Dropdown
              id="interview_type"
              v-model="form.interview_type"
              :options="interviewTypeOptions"
              :class="getValidationState(v$, 'interview_type')"
              class="w-full"
            />
            <small v-if="v$.interview_type.$error" class="p-error">{{ getValidationMessage(v$, 'interview_type') }}</small>
          </div>

          <!-- Status -->
          <div class="field">
            <label for="status" class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Dropdown
              id="status"
              v-model="form.status"
              :options="statusOptions"
              :class="getValidationState(v$, 'status')"
              class="w-full"
            />
            <small v-if="v$.status.$error" class="p-error">{{ getValidationMessage(v$, 'status') }}</small>
          </div>
        </div>

        <!-- Notes -->
        <div class="field">
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <Textarea
            id="notes"
            v-model="form.notes"
            class="w-full"
            rows="5"
          />
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3">
          <Button
            type="button"
            label="Cancel"
            class="p-button-outlined"
            @click="router.push('/interviews')"
          />
          <Button
            type="submit"
            :label="isEdit ? 'Update' : 'Create'"
            :loading="loading"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { supabase } from '../../lib/supabase'
import { interviewRules, getValidationState, getValidationMessage } from '../../utils/validations'
import type { Interview, JobApplication } from '../../types/database.types'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const jobApplications = ref<JobApplication[]>([])

const form = ref({
  job_application_id: '',
  interview_date: new Date(),
  interview_type: '',
  status: '',
  notes: ''
})

const interviewTypeOptions = [
  { label: 'Phone Screen', value: 'phone_screen' },
  { label: 'Technical', value: 'technical' },
  { label: 'Behavioral', value: 'behavioral' },
  { label: 'On-site', value: 'on_site' },
  { label: 'Take-home', value: 'take_home' }
]

const statusOptions = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No-show', value: 'no_show' }
]

const isEdit = computed(() => route.params.id !== undefined)

const v$ = useVuelidate(interviewRules, form)

async function loadJobApplications() {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('title')

    if (error) throw error
    if (data) {
      jobApplications.value = data
    }
  } catch (error) {
    console.error('Error loading job applications:', error)
  }
}

async function loadInterview() {
  if (!isEdit.value) return

  try {
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    if (data) {
      form.value = {
        ...data,
        interview_date: new Date(data.interview_date)
      }
    }
  } catch (error) {
    console.error('Error loading interview:', error)
  }
}

async function handleSubmit() {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  loading.value = true
  try {
    if (isEdit.value) {
      const { error } = await supabase
        .from('interviews')
        .update(form.value)
        .eq('id', route.params.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('interviews')
        .insert([{ ...form.value, user_id: (await supabase.auth.getUser()).data.user?.id }])

      if (error) throw error
    }

    router.push('/interviews')
  } catch (error) {
    console.error('Error saving interview:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadJobApplications()
  loadInterview()
})
</script> 