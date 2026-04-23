import { NextResponse, NextRequest } from 'next/server'
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { itemId, borrowerName, department, expectedReturn } = body

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 })
    }
    if (!borrowerName || !borrowerName.trim()) {
      return NextResponse.json({ error: 'Borrower name is required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const supabase = await createSupabaseServerClient()

    // Try to mark the item as BORROWED only if it is currently AVAILABLE
    const { data: updatedItem, error: itemError } = await supabase
      .from('items')
      .update({ status: 'BORROWED', updated_at: now })
      .eq('id', itemId)
      .eq('status', 'AVAILABLE')
      .select('id, name, status')
      .maybeSingle()

    if (itemError || !updatedItem) {
      return NextResponse.json({ error: 'Item is not available for borrowing' }, { status: 400 })
    }

    // Insert borrow log
    const { data: log, error: logError } = await supabase
      .from('borrow_logs')
      .insert([{ id: crypto.randomUUID(), item_id: itemId, borrower_name: borrowerName.trim(), department: department ?? null, expected_return: expectedReturn ?? null, borrowed_at: now, returned_at: null }])
      .select()
      .maybeSingle()

    if (logError) {
      // Rollback item status
      await supabase.from('items').update({ status: 'AVAILABLE' }).eq('id', itemId)
      console.error('POST /api/borrow insert log error:', logError.message)
      return NextResponse.json({ error: 'Failed to record borrow. Try again.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Borrow recorded', item: updatedItem, log }, { status: 200 })
  } catch (err) {
    console.error('Error in POST /api/borrow:', err)
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }
}