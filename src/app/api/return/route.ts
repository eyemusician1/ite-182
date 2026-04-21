import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()

  // 1. Security Check (Admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 })
  }

  try {
    const body = await req.json()
    // We accept logId if the frontend has it, but we can safely process with just itemId
    const { itemId, logId } = body

    if (!itemId) {
      return NextResponse.json({ error: 'Missing itemId' }, { status: 400 })
    }

    // 2. Atomic Update: Change status back to AVAILABLE ONLY if it is currently BORROWED.
    const { data: updatedItem, error: itemError } = await supabase
      .from('items')
      .update({ status: 'AVAILABLE' })
      .eq('id', itemId)
      .eq('status', 'BORROWED')
      .select()
      .single()

    // If it returns no data, the item is already available, under maintenance, or invalid
    if (itemError || !updatedItem) {
      return NextResponse.json(
        { error: 'Transaction failed: Item is not currently borrowed or does not exist.' },
        { status: 400 }
      )
    }

    // 3. Mark the active borrow log as returned
    const now = new Date().toISOString()

    // We target the log for this item that hasn't been returned yet
    let logQuery = supabase
      .from('borrow_logs')
      .update({ returned_at: now }) // Using the native snake_case column
      .eq('item_id', itemId)
      .is('returned_at', null)

    // If your frontend explicitly passes the specific log ID, we use it for maximum precision
    if (logId) {
      logQuery = logQuery.eq('id', logId)
    }

    const { error: logError } = await logQuery

    // 4. Manual Rollback (Safety Net)
    if (logError) {
      console.error('Return log update failed:', logError.message)
      // Revert the item back to BORROWED so the database stays in perfect sync
      await supabase.from('items').update({ status: 'BORROWED' }).eq('id', itemId)
      return NextResponse.json({ error: 'Failed to update borrow log. Item status reverted.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item successfully returned!', item: updatedItem }, { status: 200 })

  } catch (err) {
    console.error('Error in /api/return:', err)
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }
}