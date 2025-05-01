<template>
  <div class="p-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">
        {{ isEditing ? 'Edit Application' : 'New Application' }}
      </h1>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="title" class="block text-sm font-medium text-gray-700">Job Title</label>
              <InputText
                id="title"
                v-model="form.title"
                class="w-full"
                :class="{ 'p-invalid': v$.title.$error }"
              />
              <small class="p-error" v-if="v$.title.$error">
                {{ v$.title.$errors[0].$message }}
              </small>
            </div>

            <div class="space-y-2">
              <label for="company" class="block text-sm font-medium text-gray-700">Company</label>
              <AutoComplete
                id="company"
                v-model="form.company"
                :suggestions="companySuggestions"
                @complete="searchCompanies"
                @item-select="onCompanySelect"
                field="name"
                class="w-full"
                :class="{ 'p-invalid': v$.company.$error }"
                forceSelection
              />
              <small class="p-error" v-if="v$.company.$error">
                {{ v$.company.$errors[0].$message }}
              </small>
            </div>

            <div class="space-y-2">
              <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
              <Dropdown
                id="status"
                v-model="form.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                :class="{ 'p-invalid': v$.status.$error }"
              />
              <small class="p-error" v-if="v$.status.$error">
                {{ v$.status.$errors[0].$message }}
              </small>
            </div>

            <div class="space-y-2">
              <label for="applied_date" class="block text-sm font-medium text-gray-700">Applied Date</label>
              <Calendar
                id="applied_date"
                v-model="form.applied_date"
                dateFormat="yy-mm-dd"
                class="w-full"
                :class="{ 'p-invalid': v$.applied_date.$error }"
                :maxDate="new Date()"
              />
              <small class="p-error" v-if="v$.applied_date.$error">
                {{ v$.applied_date.$errors[0].$message }}
              </small>
            </div>

            <div class="space-y-2">
              <label for="salary_range" class="block text-sm font-medium text-gray-700">Salary Range</label>
              <InputText
                id="salary_range"
                v-model="form.salary_range"
                class="w-full"
              />
            </div>

            <div class="space-y-2">
              <label for="job_posting_url" class="block text-sm font-medium text-gray-700">Job Posting URL</label>
              <InputText
                id="job_posting_url"
                v-model="form.job_posting_url"
                class="w-full"
                type="url"
              />
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Job Description</h2>
          <Textarea
            v-model="form.description"
            rows="6"
            class="w-full"
            autoResize
          />
        </div>

        <!-- Notes -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Notes</h2>
          <Textarea
            v-model="form.notes"
            rows="4"
            class="w-full"
            autoResize
          />
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3">
          <Button
            type="button"
            label="Cancel"
            outlined
            @click="router.back()"
          />
          <Button
            type="submit"
            label="Save"
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
import { required } from '@vuelidate/validators'
import { InputText } from 'primevue/inputtext'
import { AutoComplete } from 'primevue/autocomplete'
import { Dropdown } from 'primevue/dropdown'
import { Calendar } from 'primevue/calendar'
import { Textarea } from 'primevue/textarea'
import { Button } from 'primevue/button'
import { supabase } from '../../lib/supabase'
import type { JobApplication } from '../../types/database.types'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const companySuggestions = ref([])

const isEditing = computed(() => route.params.id !== undefined)

const form = ref({
  title: '',
  company: null,
  status: 'applied',
  applied_date: new Date(),
  salary_range: '',
  job_posting_url: '',
  description: '',
  notes: ''
})

const statusOptions = [
  { label: 'Applied', value: 'applied' },
  { label: 'Interviewing', value: 'interviewing' },
  { label: 'Offered', value: 'offered' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Withdrawn', value: 'withdrawn' }
]

const rules = {
  title: { required },
  company: { required },
  status: { required },
  applied_date: { required }
}

const v$ = useVuelidate(rules, form)

async function loadApplication() {
  if (!isEditing.value) return

  try {
    loading.value = true
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('id', route.params.id)
      .single()

    if (error) throw error

    // Format the data for the form
    form.value = {
      title: data.title,
      company: data.company,
      status: data.status,
      applied_date: new Date(data.applied_date),
      salary_range: data.salary_range || '',
      job_posting_url: data.job_posting_url || '',
      description: data.description || '',
      notes: data.notes || ''
    }
  } catch (error) {
    console.error('Error loading application:', error)
  } finally {
    loading.value = false
  }
}

async function searchCompanies(event: { query: string }) {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', `%${event.query}%`)
      .limit(10)

    if (error) throw error
    companySuggestions.value = data
  } catch (error) {
    console.error('Error searching companies:', error)
    companySuggestions.value = []
  }
}

async function onCompanySelect(event: { value: any }) {
  form.value.company = event.value
}

async function handleSubmit() {
  try {
    const isValid = await v$.value.$validate()
    if (!isValid) return

    loading.value = true

    // Ensure company exists or create it
    let companyId = form.value.company.id
    if (!companyId) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: form.value.company.name })
        .select()
        .single()

      if (companyError) throw companyError
      companyId = company.id
    }

    const applicationData = {
      title: form.value.title,
      company_id: companyId,
      status: form.value.status,
      applied_date: form.value.applied_date.toISOString(),
      salary_range: form.value.salary_range,
      job_posting_url: form.value.job_posting_url,
      description: form.value.description,
      notes: form.value.notes
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('job_applications')
        .update(applicationData)
        .eq('id', route.params.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('job_applications')
        .insert(applicationData)

      if (error) throw error
    }

    router.push('/applications')
  } catch (error) {
    console.error('Error saving application:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadApplication()
})
</script>

<style scoped>
.form-field {
  @apply space-y-1;
}
</style> 