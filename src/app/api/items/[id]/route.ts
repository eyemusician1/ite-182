import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

async function verifyAuth(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function DELETE(_req: NextRequest, { params }: { params: { id?: string } }) {
  const supabase = await createSupabaseServerClient()
  const user = await verifyAuth(supabase)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = params?.id
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const { data: existing, error: selectErr } = await supabase
      .from('items')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (selectErr) {
      console.error('DELETE /api/items/[id] select error:', selectErr.message)
      return NextResponse.json({ error: selectErr.message }, { status: 500 })
    }

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('DELETE /api/items/[id] unexpected error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
