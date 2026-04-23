import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/get-user'

// GET /api/items/:id/unit
// Returns a single unit id for the item (available unit if present),
// or the item id as a fallback. Protected: admin only.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error: authError } = await getUser()
  if (authError || !user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const p = await params
  const id = p?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const supabase = await createSupabaseServerClient()

    // Try to find an AVAILABLE unit for this item first
    try {
      const { data: unit } = await supabase
        .from('item_units')
        .select('id')
        .eq('item_id', id)
        .eq('status', 'AVAILABLE')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (unit && unit.id) {
        return NextResponse.json({ unitId: unit.id }, { status: 200 })
      }
    } catch (uErr) {
      // If the table doesn't exist or query fails, fall back to item id
      console.warn('Could not query item_units for unit id:', (uErr as Error).message)
    }

    // Fallback to returning the item id
    return NextResponse.json({ unitId: id }, { status: 200 })
  } catch (err) {
    console.error('GET /api/items/:id/unit error:', (err as Error).message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
