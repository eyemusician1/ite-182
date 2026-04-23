import { NextRequest, NextResponse } from 'next/server'

// GET /api/auth/confirm
// Forwards the provider's redirect (query string intact) to /api/auth/callback
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const qs = searchParams.toString()
  const dst = `/api/auth/callback${qs ? `?${qs}` : ''}`

  console.log('[api/auth/confirm] forwarding to:', dst)

  return NextResponse.redirect(`${origin}${dst}`)
}
