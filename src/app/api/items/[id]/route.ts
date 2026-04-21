import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js'

async function verifyAdmin(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  return user && user.app_metadata?.role === 'admin'
}

// PATCH: Edit an item by ID
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  if (!(await verifyAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { name, category, status } = body
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('items')
      .update({ name, category, status, updated_at: now })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: Remove an item by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient()
  if (!(await verifyAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const { error } = await supabase.from('items').delete().eq('id', id)

    if (error) {
      const pgError = error as PostgrestError
      if (pgError.code === '23503') {
        return NextResponse.json(
          { error: 'Cannot delete equipment that has a borrow history. Try changing its status to Maintenance instead.' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
