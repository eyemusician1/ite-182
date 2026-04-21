import { NextResponse } from 'next/server'

// POST /api/auth -- staff login
// Body: { email, password }
// Uses Supabase Auth signInWithPassword
export async function POST() {
  return NextResponse.json({ message: 'TODO' }, { status: 501 })
}