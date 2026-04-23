import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const safePath = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'

  console.log('[auth/callback] incoming URL:', request.url)
  console.log('[auth/callback] code:', code, 'next:', next)

  if (!code) {
    return NextResponse.redirect(`${origin}/login`)
  }

  const response = NextResponse.redirect(`${origin}${safePath}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Write cookies only to the redirect response so the browser
            // receives the session on the first redirect.
            response.cookies.set(name, value, {
              ...options,
              sameSite: options?.sameSite ?? 'lax',
              httpOnly: options?.httpOnly ?? true,
              secure: typeof options?.secure === 'boolean' ? options.secure : (process.env.NODE_ENV === 'production'),
            })
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(`${origin}/login`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (user?.app_metadata?.role !== 'admin') {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login?error=unauthorized`)
  }

  return response
}