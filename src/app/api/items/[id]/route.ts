import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/get-user'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { user, error: authError } = await getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const p = await params
  const id = p?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    // Read optional decrement amount from request body (if provided).
    let decrement = 1
    try {
      const body = await req.json().catch(() => ({}))
      if (body && typeof body.decrement === 'number') decrement = Math.max(1, Math.floor(body.decrement))
    } catch {
      // ignore
    }

    const { data: existing, error: selectErr } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (selectErr) {
      console.error('DELETE /api/items/[id] select error:', selectErr.message)
      return NextResponse.json({ error: selectErr.message }, { status: 500 })
    }

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // If the DB has a `quantity` column, decrement it. Otherwise fallback to deleting the row.
    const hasQuantity = Object.prototype.hasOwnProperty.call(existing, 'quantity')

    if (!hasQuantity) {
      // legacy: remove the row
      const { data, error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle()

      if (error) {
        console.error('DELETE /api/items/[id] delete error:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ deleted: data?.id ?? id }, { status: 200 })
    }

    const currentQty = Number(existing.quantity || 0)
    const newQty = Math.max(0, currentQty - decrement)

    if (newQty > 0) {
      const { data: updated, error: updErr } = await supabase
        .from('items')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle()

      if (updErr) {
        console.error('DELETE /api/items/[id] update error:', updErr.message)
        return NextResponse.json({ error: updErr.message }, { status: 500 })
      }

      // remove `decrement` number of item_units for this item (if table exists)
      try {
        const { data: units } = await supabase
          .from('item_units')
          .select('id')
          .eq('item_id', id)
          .eq('status', 'AVAILABLE')
          .order('created_at', { ascending: true })
          .limit(decrement)

        if (units && units.length > 0) {
          const ids = units.map((u: { id: string }) => u.id)
          await supabase.from('item_units').delete().in('id', ids)
        }
      } catch (uErr) {
        console.warn('Could not delete item_units (table may be missing):', (uErr as Error).message)
      }

      return NextResponse.json({ id: updated?.id ?? id, quantity: updated?.quantity ?? newQty }, { status: 200 })
    }

    // quantity reached zero — delete the row and all its item_units
    try {
      // delete units first (if table exists)
      try {
        await supabase.from('item_units').delete().eq('item_id', id)
      } catch (uErr) {
        console.warn('Could not delete item_units (table may be missing):', (uErr as Error).message)
      }

      const { data: deleted, error: delErr } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
        .select()
        .maybeSingle()

      if (delErr) {
        console.error('DELETE /api/items/[id] final delete error:', delErr.message)
        return NextResponse.json({ error: delErr.message }, { status: 500 })
      }

      return NextResponse.json({ deleted: deleted?.id ?? id }, { status: 200 })
    } catch (err) {
      console.error('DELETE /api/items/[id] deletion error:', (err as Error).message)
      return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('DELETE /api/items/[id] unexpected error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  const { user, error: authError } = await getUser()
  if (authError || !user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized: Admin required' }, { status: 401 })
  }

  const p = await params
  const id = p?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const body = await req.json().catch(() => ({}))
    const updates: Record<string, unknown> = {}
    if (typeof body.name === 'string') updates.name = body.name.trim()
    if (typeof body.category === 'string') updates.category = body.category.trim()
    if (typeof body.status === 'string') updates.status = body.status
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      console.error('PATCH /api/items/[id] error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('PATCH /api/items/[id] unexpected error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
