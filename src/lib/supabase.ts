import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface ScoreRow {
  id?:     number
  name:    string
  score:   number
  stage:   number
  caught:  number
  erased:  number
  mode:    string
  date?:   string
}

// Lazy singleton — createClient is called only when first needed,
// not at module evaluation time (which would fail during Vercel build
// if env vars are not yet available).
let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set.')
  }
  _client = createClient(url, key)
  return _client
}
