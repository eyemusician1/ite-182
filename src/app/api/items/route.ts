import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/get-user'

export async function GET() {
  const { user, error: authError } = await getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: items, error } = await supabase
    .from('items')
    .select('id, name, category, status, quantity, created_at, updated_at') // only needed columns
    .order('created_at', { ascending: false })

  if (error) {
    console.error('GET /api/items error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(items, {
    status: 200,
    headers: {
      // Cache for 30s on CDN edge, allow stale for 10s while revalidating
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=10',
    },
  })
}

export async function POST(req: NextRequest) {
  const { user, error: authError } = await getUser()

  if (authError || !user) {
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

    const qty = Math.max(1, Math.floor(Number(quantity) || 1))
    const now = new Date().toISOString()

    const supabase = await createSupabaseServerClient()

    const { data: existing, error: selectErr } = await supabase
      .from('items')
      .select('id, quantity')  // only needed columns
      .eq('name', name.trim())
      .eq('category', category.trim())
      .maybeSingle()

    if (selectErr) {
      console.error('POST /api/items select error:', selectErr.message)
      return NextResponse.json({ error: selectErr.message }, { status: 500 })
    }

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

        try {
          const unitsToInsert = Array.from({ length: qty }).map(() => ({
            id: crypto.randomUUID(),
            item_id: updated.id,
            status: 'AVAILABLE',
            created_at: now,
            updated_at: now,
          }))
          const { error: unitsErr } = await supabase.from('item_units').insert(unitsToInsert)
          if (unitsErr) console.warn('Could not create item_units:', unitsErr.message)
        } catch (uErr) {
          console.warn('item_units insertion skipped:', (uErr as Error).message)
        }

        return NextResponse.json(updated, { status: 200 })
      } catch (updErr) {
        if (isMissingQuantityError(updErr)) {
          console.warn('Quantity column missing — falling back to per-unit inserts.')
          const itemsToInsert = Array.from({ length: qty }).map(() => ({
            id: crypto.randomUUID(),
            name: name.trim(),
            category: category.trim(),
            status: 'AVAILABLE',
            created_at: now,
            updated_at: now,
          }))
          const { data, error } = await supabase.from('items').insert(itemsToInsert).select()
          if (error) return NextResponse.json({ error: error.message }, { status: 500 })
          return NextResponse.json(data, { status: 201 })
        }
        console.error('POST /api/items update error:', (updErr as Error).message)
        return NextResponse.json({ error: (updErr as Error).message }, { status: 500 })
      }
    }

    try {
      const { data, error } = await supabase
        .from('items')
        .insert([{
          id: crypto.randomUUID(),
          name: name.trim(),
          category: category.trim(),
          status: 'AVAILABLE',
          quantity: qty,
          created_at: now,
          updated_at: now,
        }])
        .select()
        .maybeSingle()

      if (error) throw error

      try {
        const unitsToInsert = Array.from({ length: qty }).map(() => ({
          id: crypto.randomUUID(),
          item_id: data.id,
          status: 'AVAILABLE',
          created_at: now,
          updated_at: now,
        }))
        const { error: unitsErr } = await supabase.from('item_units').insert(unitsToInsert)
        if (unitsErr) console.warn('Could not create item_units:', unitsErr.message)
      } catch (uErr) {
        console.warn('item_units insertion skipped:', (uErr as Error).message)
      }

      return NextResponse.json(data, { status: 201 })
    } catch (insertErr) {
      if (isMissingQuantityError(insertErr)) {
        console.warn('Quantity column missing — falling back to per-unit inserts.')
        const itemsToInsert = Array.from({ length: qty }).map(() => ({
          id: crypto.randomUUID(),
          name: name.trim(),
          category: category.trim(),
          status: 'AVAILABLE',
          created_at: now,
          updated_at: now,
        }))
        const { data, error } = await supabase.from('items').insert(itemsToInsert).select()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data, { status: 201 })
      }
      console.error('POST /api/items insert error:', (insertErr as Error).message)
      return NextResponse.json({ error: (insertErr as Error).message }, { status: 500 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('POST /api/items unexpected error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}