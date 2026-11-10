import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://wqulwwuegtffolsnhshe.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Re3EVRgU24eP_ouRrk_EeA_aXZcUVx4'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // We manage our own auth so disable Supabase auth prompts
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export default supabase
