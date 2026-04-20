import { createClient } from '@supabase/supabase-js'

/** Admin client -- uses service-role key, bypasses RLS.
 * Only use in API routes or Server Actions. Never expose to the browser. */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)