import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export const getUser = cache(async () => {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
})