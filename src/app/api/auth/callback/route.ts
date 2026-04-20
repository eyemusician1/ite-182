import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Allows us to redirect them to a specific page after login, defaults to dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createSupabaseServerClient()
    // This exchanges the Google code for a secure Supabase session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 1. Grab the user data that Supabase just created/verified
      const { data: { user } } = await supabase.auth.getUser()

      // 2. Check the secure app_metadata for the admin role!
      const role = user?.app_metadata?.role

      // 3. If they do NOT have the admin tag, kick them out immediately
      if (role !== 'admin') {
        // Destroy the session so they aren't technically logged in anymore
        await supabase.auth.signOut()
        // Send them back to the login page with a specific error flag in the URL
        return NextResponse.redirect(`${origin}/login?error=unauthorized`)
      }

      // 4. Authorized Admin! Send them securely to the dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('exchangeCodeForSession error:', error.message)
  }

  // If there's no code or something went wrong, send them back to login
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}