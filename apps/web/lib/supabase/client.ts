import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  return url
}

let _supabase: ReturnType<typeof createClient<Database>> | null = null

export function getSupabase() {
  if (!_supabase) {
    const url = getSupabaseUrl()
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _supabase = createClient<Database>(url, anonKey)
  }
  return _supabase
}

/** @deprecated Use getSupabase() instead for lazy initialization */
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_, prop) {
    return (getSupabase() as Record<string | symbol, unknown>)[prop]
  },
})

export function createServerClient() {
  const url = getSupabaseUrl()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
