import { createClient } from '@supabase/supabase-js'
import { createDemoClient } from './demoSupabase'

const isDemoMode =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  import.meta.env.VITE_DEMO_MODE === '1'

let supabase: ReturnType<typeof createClient> | ReturnType<typeof createDemoClient>

if (isDemoMode) {
  supabase = createDemoClient()
} else {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase, isDemoMode }
