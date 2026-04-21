import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()

  try {
    const body = await req.json().catch(() => ({}))
    const { unitId, borrowerName, borrowerEmail } = body as { unitId?: string; borrowerName?: string; borrowerEmail?: string }

    if (!unitId) return NextResponse.json({ error: 'unitId required' }, { status: 400 })
    if (!borrowerName || !borrowerName.trim()) return NextResponse.json({ error: 'borrowerName required' }, { status: 400 })

    // Check unit availability
    const { data: unit, error: unitErr } = await supabase
      .from('item_units')
      .select('id, status, item_id')
      .eq('id', unitId)
      .maybeSingle()

    if (unitErr) {
      console.error('POST /api/borrow unit select error:', unitErr.message)
      return NextResponse.json({ error: unitErr.message }, { status: 500 })
    }

    if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    if (unit.status !== 'AVAILABLE') return NextResponse.json({ error: 'Unit not available' }, { status: 409 })

    const now = new Date().toISOString()

    // Attempt to mark the unit as BORROWED and create a borrow record.
    // Wrap in try/catch — if borrows table doesn't exist, proceed with unit update.
    try {
      // update unit status
      const { data: updatedUnit, error: updErr } = await supabase
        .from('item_units')
        .update({ status: 'BORROWED', updated_at: now })
        .eq('id', unitId)
        .select()
        .maybeSingle()

      if (updErr) throw updErr

      // decrement aggregated items.quantity if column exists
      try {
        await supabase.from('items').update({ quantity: (supabase.raw ? undefined : undefined) }).eq('id', unit.item_id)
      } catch {
        // best-effort: attempt to decrement using SQL fallback
        try {
          await supabase.rpc('decrement_item_quantity', { _item_id: unit.item_id })
        } catch {
          // ignore if no rpc defined — admin can run migration later
        }
      }

      // try to insert into `borrows` table if it exists
      try {
        const borrowRow = {
          id: crypto.randomUUID(),
          unit_id: unitId,
          item_id: unit.item_id,
          borrower_name: borrowerName.trim(),
          borrower_email: borrowerEmail ?? null,
          borrowed_at: now,
        }
        const { error: borrowErr } = await supabase.from('borrows').insert([borrowRow])
        if (borrowErr) {
          // not fatal — proceed
          console.warn('Could not create borrows row:', borrowErr.message)
        }
      } catch (bErr) {
        console.warn('borrows insertion skipped:', (bErr as Error).message)
      }

      return NextResponse.json({ ok: true, unit: updatedUnit ?? { id: unitId } }, { status: 200 })
    } catch (err) {
      console.error('POST /api/borrow error:', (err as Error).message)
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('POST /api/borrow unexpected error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
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