import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Simple auth check — verifies the user is logged in via Supabase Auth.
async function verifyAuth(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function GET(_req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const user = await verifyAuth(supabase)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('GET /api/items error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(items, { status: 200 })
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const user = await verifyAuth(supabase)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, category, quantity } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Equipment name is required' }, { status: 400 })
    }
    if (!category || !category.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    // Clamp quantity to a safe whole number, minimum 1
    const qty = Math.max(1, Math.floor(Number(quantity) || 1))
    const now = new Date().toISOString()

    // If an item with the same name+category already exists, increment its quantity.
    const { data: existing, error: selectErr } = await supabase
      .from('items')
      .select('*')
      .eq('name', name.trim())
      .eq('category', category.trim())
      .maybeSingle()

    if (selectErr) {
      console.error('POST /api/items select error:', selectErr.message)
      return NextResponse.json({ error: selectErr.message }, { status: 500 })
    }

    // helper to detect missing-quantity-column errors
    const isMissingQuantityError = (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      return /quantity|Could not find the 'quantity' column|column.*quantity.*does not exist/i.test(msg)
    }

    if (existing) {
      try {
        const newQty = (existing.quantity || 0) + qty
        const { data: updated, error: updErr } = await supabase
          .from('items')
          .update({ quantity: newQty, updated_at: now })
          .eq('id', existing.id)
          .select()
          .maybeSingle()

        if (updErr) throw updErr

        // Try to create per-unit records in `item_units` (unique IDs for QR codes)
        try {
          const unitsToInsert = Array.from({ length: qty }).map(() => ({
            id: crypto.randomUUID(),
            item_id: updated.id,
            status: 'AVAILABLE',
            created_at: now,
            updated_at: now,
          }))

          const { error: unitsErr } = await supabase.from('item_units').insert(unitsToInsert)
          if (unitsErr) {
            console.warn('Could not create item_units (table may be missing):', unitsErr.message)
          }
        } catch (uErr) {
          console.warn('item_units insertion skipped:', (uErr as Error).message)
        }

        return NextResponse.json(updated, { status: 200 })
      } catch (updErr) {
        // Fallback for databases that haven't had the `quantity` column added yet.
        if (isMissingQuantityError(updErr)) {
          console.warn('Quantity column missing — falling back to per-unit inserts. Please run the Supabase migration to add `quantity`.')
          // Insert `qty` additional individual rows (legacy behavior)
          const itemsToInsert = Array.from({ length: qty }).map(() => ({
            id: crypto.randomUUID(),
            name: name.trim(),
            category: category.trim(),
            status: 'AVAILABLE',
            created_at: now,
            updated_at: now,
          }))

          const { data, error } = await supabase
            .from('items')
            .insert(itemsToInsert)
            .select()

          if (error) {
            console.error('POST /api/items fallback insert error:', error.message)
            return NextResponse.json({ error: error.message }, { status: 500 })
          }

          return NextResponse.json(data, { status: 201 })
        }

        console.error('POST /api/items update error:', (updErr as Error).message ?? String(updErr))
        return NextResponse.json({ error: (updErr as Error).message ?? String(updErr) }, { status: 500 })
      }
    }

    // Try to insert a single aggregated item row (preferred)
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([{ id: crypto.randomUUID(), name: name.trim(), category: category.trim(), status: 'AVAILABLE', quantity: qty, created_at: now, updated_at: now }])
        .select()
        .maybeSingle()

      if (error) {
        throw error
      }

      // create item_units for the new item
      try {
        const unitsToInsert = Array.from({ length: qty }).map(() => ({
          id: crypto.randomUUID(),
          item_id: data.id,
          status: 'AVAILABLE',
          created_at: now,
          updated_at: now,
        }))

        const { error: unitsErr } = await supabase.from('item_units').insert(unitsToInsert)
        if (unitsErr) {
          console.warn('Could not create item_units (table may be missing):', unitsErr.message)
        }
      } catch (uErr) {
        console.warn('item_units insertion skipped:', (uErr as Error).message)
      }

      return NextResponse.json(data, { status: 201 })
    } catch (insertErr) {
      if (isMissingQuantityError(insertErr)) {
        console.warn('Quantity column missing — falling back to per-unit inserts. Please run the Supabase migration to add `quantity`.')
        const itemsToInsert = Array.from({ length: qty }).map(() => ({
          id: crypto.randomUUID(),
          name: name.trim(),
          category: category.trim(),
          status: 'AVAILABLE',
          created_at: now,
          updated_at: now,
        }))

        const { data, error } = await supabase
          .from('items')
          .insert(itemsToInsert)
          .select()

        if (error) {
          console.error('POST /api/items fallback insert error:', error.message)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
      }

      console.error('POST /api/items insert error:', (insertErr as Error).message ?? String(insertErr))
      return NextResponse.json({ error: (insertErr as Error).message ?? String(insertErr) }, { status: 500 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('POST /api/items unexpected error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}