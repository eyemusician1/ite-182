import { createBrowserClient } from '@supabase/ssr'

/** Browser client -- uses anon key, respects RLS.
 *  Guard creation so the module can be imported during server-side
 *  builds without requiring browser-only env values at eval time. */
let _supabase: ReturnType<typeof createBrowserClient> | null = null
if (typeof window !== 'undefined') {
  _supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const supabase = _supabase