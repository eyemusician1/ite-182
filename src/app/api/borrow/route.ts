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
    const { itemId, borrowerName, department, expectedReturn } = body

    // Basic validation
    if (!itemId || !borrowerName || !department || !expectedReturn) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 2. Atomic Update: Change status ONLY if it's currently AVAILABLE.
    // This prevents two people from borrowing the same item at the exact same millisecond.
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update({ status: 'BORROWED' })
      .eq('id', itemId)
      .eq('status', 'AVAILABLE')
      .select()
      .single()

    // If it returns no data, the item was either already borrowed or doesn't exist
    if (updateError || !updatedItem) {
      return NextResponse.json(
        { error: 'Transaction failed: Item is already borrowed, under maintenance, or does not exist.' },
        { status: 400 }
      )
    }

    // 3. Insert the BorrowLog using snake_case columns
    const { error: logError } = await supabase
      .from('borrow_logs')
      .insert([
        {
          item_id: itemId,
          borrower_name: borrowerName,
          department: department,
          expected_return: expectedReturn,
          // 'created_at' is automatic, 'returned_at' remains null
        }
      ])

    // 4. Manual Rollback if the log fails (Safety Net)
    if (logError) {
      console.error('Borrow log insert failed:', logError.message)
      // Revert the item back to AVAILABLE
      await supabase.from('items').update({ status: 'AVAILABLE' }).eq('id', itemId)
      return NextResponse.json({ error: 'Failed to record borrow log. Item status reverted.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Item successfully borrowed!', item: updatedItem }, { status: 200 })

  } catch (err) {
    console.error('Error in /api/borrow:', err)
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }
}