import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function getCookieValue(req: NextRequest, names: string[]) {
  for (const n of names) {
    const c = req.cookies.get(n)
    if (c) return c.value
  }
  return null
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // skip static files and public assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth') || pathname.includes('.')) {
    return
  }

  // Protect dashboard pages and API routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api')) {
    // Common Supabase cookie names (fallbacks included)
    const token = getCookieValue(req, [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'sb:token'
    ])

    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
