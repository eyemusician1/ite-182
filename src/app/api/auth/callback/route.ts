import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

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
            // Ensure cookies set during OAuth callback are sent on the
            // first post-redirect navigation. In production (HTTPS) we
            // require SameSite=None and Secure so cross-site redirects
            // include the cookie. For local dev keep Lax to avoid
            // Secure requirement.
            const secure = typeof options?.secure === 'boolean' ? options.secure : (process.env.NODE_ENV === 'production')
            const sameSite = options?.sameSite ?? (secure ? 'none' : 'lax')
            const path = options?.path ?? '/'

            response.cookies.set(name, value, {
              ...options,
              sameSite,
              httpOnly: options?.httpOnly ?? true,
              secure,
              path,
            })
          })
        },
      },
    }
  )

  const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('exchangeCodeForSession error:', exchangeError.message)
    return NextResponse.redirect(`${origin}/login`)
  }

  console.log('[auth/callback] exchangeData:', JSON.stringify(exchangeData))

  // Prefer the user returned in the exchange response (no cookie needed).
  let user: User | null = exchangeData?.session?.user ?? null

  // Fallback: try reading via getUser() if exchange didn't return a user.
  if (!user) {
    const { data } = await supabase.auth.getUser()
    user = data.user ?? null
  }

  console.log('[auth/callback] resolved user id:', user?.id)

  if (user?.app_metadata?.role !== 'admin') {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('signOut failed:', (err as Error).message)
    }
    return NextResponse.redirect(`${origin}/login?error=unauthorized`)
  }

  return response
}