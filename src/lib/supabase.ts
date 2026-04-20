import { createBrowserClient } from '@supabase/ssr'

/** Browser client -- uses anon key, respects RLS. Safe in Client Components. */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)