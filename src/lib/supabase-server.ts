import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** Server Component / Route Handler Supabase client.
 * Reads session from the cookie store -- required for auth-aware SSR. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  // Use the service role key on the server for privileged operations
  // (exchangeCodeForSession, admin actions). Never expose this to the browser.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}