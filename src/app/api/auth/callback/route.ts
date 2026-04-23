import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const safePath = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
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
            const secure = process.env.NODE_ENV === 'production'
            const sameSite = secure ? 'none' : 'lax'
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure,
              sameSite,
              path: '/',
            })
          })
        },
      },
    }
  )

  const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('exchangeCodeForSession error:', exchangeError.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  let user: User | null = exchangeData?.session?.user ?? null
  if (!user) {
    const { data } = await supabase.auth.getUser()
    user = data.user ?? null
  }

  if (user?.app_metadata?.role !== 'admin') {
    try { await supabase.auth.signOut() } catch {}
    return NextResponse.redirect(`${origin}/login?error=unauthorized`)
  }

  return response
}