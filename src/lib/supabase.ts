import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

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
