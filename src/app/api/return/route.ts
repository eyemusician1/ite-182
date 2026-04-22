import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/get-user'

export async function POST(req: NextRequest) {
  // Use cached getUser — no extra network call if already called this request
  const { user, error: authError } = await getUser()

  if (authError || !user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { itemId, logId } = body

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Atomic update — only succeeds if item is currently BORROWED
    const { data: updatedItem, error: itemError } = await supabase
      .from('items')
      .update({ status: 'AVAILABLE' })
      .eq('id', itemId)
      .eq('status', 'BORROWED')
      .select('id, name, status')  // only needed columns
      .single()

    if (itemError || !updatedItem) {
      return NextResponse.json(
        { error: 'Transaction failed: Item is not currently borrowed or does not exist.' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    let logQuery = supabase
      .from('borrow_logs')
      .update({ returned_at: now })
      .eq('item_id', itemId)
      .is('returned_at', null)

    if (logId) {
      logQuery = logQuery.eq('id', logId)
    }

    const { error: logError } = await logQuery

    if (logError) {
      console.error('Return log update failed:', logError.message)
      // Rollback item status
      await supabase.from('items').update({ status: 'BORROWED' }).eq('id', itemId)
      return NextResponse.json({ error: 'Failed to update borrow log. Item status reverted.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item successfully returned!', item: updatedItem }, { status: 200 })

  } catch (err) {
    console.error('Error in /api/return:', err)
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }
}