import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function initialize() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null
    } catch (err) {
      console.error('Error initializing auth:', err)
      error.value = 'Failed to initialize authentication'
    }
  }

  async function signIn(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (err) throw err
      user.value = data.user
    } catch (err) {
      console.error('Error signing in:', err)
      error.value = 'Failed to sign in'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signUp(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
      })
      if (err) throw err
      user.value = data.user
    } catch (err) {
      console.error('Error signing up:', err)
      error.value = 'Failed to sign up'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    try {
      loading.value = true
      error.value = null
      const { error: err } = await supabase.auth.signOut()
      if (err) throw err
      user.value = null
    } catch (err) {
      console.error('Error signing out:', err)
      error.value = 'Failed to sign out'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    initialize,
    signIn,
    signUp,
    signOut,
  }
}) 