import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('exchangeCodeForSession success, session:', !!data?.session)
      return NextResponse.redirect(`${origin}/dashboard`)
    }

    console.error('exchangeCodeForSession error:', error.message)
    // For debugging return a response showing the error message (temporary)
    return new NextResponse(`OAuth exchange error: ${error.message}`, { status: 400 })
  }

  return NextResponse.redirect(`${origin}/login`)
}