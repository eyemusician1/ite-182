import { createClient } from '@supabase/supabase-js'

/** Returns an admin Supabase client (service role).
 *  Use this inside server code where env vars are available. Creating
 *  the client at module-eval time can break Next's build worker when
 *  env vars are not present; use this factory to defer creation. */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}