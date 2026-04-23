import { NextRequest, NextResponse } from 'next/server'

// Server-side handler for GET /auth/confirm
// Some providers redirect to /auth/confirm; this ensures the server
// responds with a 307 redirect to the callback route and preserves
// the original query string so cookies can be set by the callback.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const qs = searchParams.toString()
  const dst = `/api/auth/callback${qs ? `?${qs}` : ''}`

  console.log('[auth/confirm route] forwarding to:', dst)

  return NextResponse.redirect(`${origin}${dst}`)
}
