import { NextRequest, NextResponse } from 'next/server'

// POST /api/auth -- staff login
// Body: { email, password }
// Uses Supabase Auth signInWithPassword
export async function POST(_req: NextRequest) {
  return NextResponse.json({ message: 'TODO' }, { status: 501 })
}