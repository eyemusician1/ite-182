import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** Server Component / Route Handler Supabase client.
 * Reads session from the cookie store -- required for auth-aware SSR. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              // Setting cookies from a Server Component causes Next.js to throw.
              // Only route handlers or server actions should mutate cookies.
              // Guard against that by catching and ignoring the error here.
              // In route handlers, cookies().set will work as expected.
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              cookieStore.set(name, value, options)
            } catch (err) {
              // swallow the error to avoid unhandledRejection when
              // this helper is used from a Server Component.
              // Optionally log for debugging.
              // eslint-disable-next-line no-console
              console.warn(`Could not set cookie ${name} in this context:`, (err as Error).message)
            }
          })
        },
      },
    }
  )
}