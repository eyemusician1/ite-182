import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // The `/auth/confirm` page (app/auth/confirm/page.tsx) performs a
  // server-side redirect to `/api/auth/callback`. Avoid rewriting here
  // so the page can run and set the proper cookies via the callback.

  // Skip static assets, auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Use getUser() — makes a network call but is the only truly reliable
  // way to verify the session is valid, especially right after OAuth callback
  const { data: { user } } = await supabase.auth.getUser()

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
    if (!user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/auth/:path*'],
}