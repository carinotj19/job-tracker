<template>
  <div class="p-6">
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-6">
        {{ isEdit ? 'Edit Contact' : 'New Contact' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Name -->
          <div class="field">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <InputText
              id="name"
              v-model="form.name"
              :class="getValidationState(v$, 'name')"
              class="w-full"
            />
            <small v-if="v$.name.$error" class="p-error">{{ getValidationMessage(v$, 'name') }}</small>
          </div>

          <!-- Email -->
          <div class="field">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <InputText
              id="email"
              v-model="form.email"
              :class="getValidationState(v$, 'email')"
              class="w-full"
              type="email"
            />
            <small v-if="v$.email.$error" class="p-error">{{ getValidationMessage(v$, 'email') }}</small>
          </div>

          <!-- Phone -->
          <div class="field">
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <InputText
              id="phone"
              v-model="form.phone"
              :class="getValidationState(v$, 'phone')"
              class="w-full"
            />
            <small v-if="v$.phone.$error" class="p-error">{{ getValidationMessage(v$, 'phone') }}</small>
          </div>

          <!-- Title -->
          <div class="field">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <InputText
              id="title"
              v-model="form.title"
              :class="getValidationState(v$, 'title')"
              class="w-full"
            />
            <small v-if="v$.title.$error" class="p-error">{{ getValidationMessage(v$, 'title') }}</small>
          </div>

          <!-- Company -->
          <div class="field">
            <label for="company_id" class="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <Dropdown
              id="company_id"
              v-model="form.company_id"
              :options="companies"
              optionLabel="name"
              optionValue="id"
              :class="getValidationState(v$, 'company_id')"
              class="w-full"
              placeholder="Select a company"
            />
            <small v-if="v$.company_id.$error" class="p-error">{{ getValidationMessage(v$, 'company_id') }}</small>
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
            @click="router.push('/contacts')"
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
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { supabase } from '../../lib/supabase'
import { contactRules, getValidationState, getValidationMessage } from '../../utils/validations'
import type { Company } from '../../types/database.types'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const companies = ref<Company[]>([])

const form = ref({
  name: '',
  email: '',
  phone: '',
  title: '',
  company_id: '',
  notes: ''
})

const isEdit = computed(() => route.params.id !== undefined)

const v$ = useVuelidate(contactRules, form)

async function loadCompanies() {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name')

    if (error) throw error
    if (data) {
      companies.value = data
    }
  } catch (error) {
    console.error('Error loading companies:', error)
  }
}

async function loadContact() {
  if (!isEdit.value) return

  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (error) throw error
    if (data) {
      form.value = data
    }
  } catch (error) {
    console.error('Error loading contact:', error)
  }
}

async function handleSubmit() {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  loading.value = true
  try {
    if (isEdit.value) {
      const { error } = await supabase
        .from('contacts')
        .update(form.value)
        .eq('id', route.params.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('contacts')
        .insert([{ ...form.value, user_id: (await supabase.auth.getUser()).data.user?.id }])

      if (error) throw error
    }

    router.push('/contacts')
  } catch (error) {
    console.error('Error saving contact:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCompanies()
  loadContact()
})
</script> 
