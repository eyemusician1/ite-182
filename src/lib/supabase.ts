import { createBrowserClient } from '@supabase/ssr'

/** Singleton browser client — created once and reused.
 *  Uses anon key and respects RLS.
 *  Safe to import on the server (returns null outside browser). */
export function getSupabaseBrowser() {
  if (typeof window === 'undefined') return null
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton instance for direct imports
export const supabase = getSupabaseBrowser()