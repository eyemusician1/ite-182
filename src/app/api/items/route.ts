import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Simple auth check — verifies the user is logged in via Supabase Auth.
// No app_metadata role required since this is a single-staff system.
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

    if (existing) {
      const newQty = (existing.quantity || 0) + qty
      const { data: updated, error: updErr } = await supabase
        .from('items')
        .update({ quantity: newQty, updated_at: now })
        .eq('id', existing.id)
        .select()
        .maybeSingle()

      if (updErr) {
        console.error('POST /api/items update error:', updErr.message)
        return NextResponse.json({ error: updErr.message }, { status: 500 })
      }

      return NextResponse.json(updated, { status: 200 })
    }

    // Insert a single aggregated item row
    const { data, error } = await supabase
      .from('items')
      .insert([{ id: crypto.randomUUID(), name: name.trim(), category: category.trim(), status: 'AVAILABLE', quantity: qty, created_at: now, updated_at: now }])
      .select()
      .maybeSingle()

    if (error) {
      console.error('POST /api/items insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('POST /api/items unexpected error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}