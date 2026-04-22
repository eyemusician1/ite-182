import { NextResponse } from 'next/server'
import { getUser } from '@/lib/get-user'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const { user, error: authError } = await getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('borrow_logs')
    .select(`
      id, item_id, borrower_name, department,
      borrowed_at, expected_return, returned_at, returned_by_staff,
      items ( name, category )
    `)
    .order('borrowed_at', { ascending: false })

  if (error) {
    console.error('GET /api/borrow error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=10',
    },
  })
}