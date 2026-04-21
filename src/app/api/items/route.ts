import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// Simple auth check — verifies the user is logged in via Supabase Auth.
// No app_metadata role required since this is a single-staff system.
async function verifyAuth(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function GET(req: NextRequest) {
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

    // Bulk insert N items with the same name/category
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
      console.error('POST /api/items insert error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/items unexpected error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}