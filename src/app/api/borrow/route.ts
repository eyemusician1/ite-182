import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()

  // 1. Admin-only guard
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { itemId, borrowerName, department, expectedReturn } = body

    if (!itemId || !borrowerName || !department || !expectedReturn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 2. Atomic update — only succeeds if item is currently AVAILABLE
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update({ status: 'BORROWED' })
      .eq('id', itemId)
      .eq('status', 'AVAILABLE')
      .select()
      .single()

    if (updateError || !updatedItem) {
      return NextResponse.json(
        { error: 'Transaction failed: Item is already borrowed, under maintenance, or does not exist.' },
        { status: 400 }
      )
    }

    // 3. Insert borrow log
    const { error: logError } = await supabase
      .from('borrow_logs')
      .insert([{
        item_id: itemId,
        borrower_name: borrowerName,
        department: department,
        expected_return: expectedReturn,
      }])

    // 4. Manual rollback if log insert fails
    if (logError) {
      console.error('Borrow log insert failed:', logError.message)
      await supabase.from('items').update({ status: 'AVAILABLE' }).eq('id', itemId)
      return NextResponse.json({ error: 'Failed to record borrow log. Item status reverted.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item successfully borrowed!', item: updatedItem }, { status: 200 })

  } catch (err) {
    console.error('Error in /api/borrow:', err)
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }
}