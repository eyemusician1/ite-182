import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AddEquipmentDialog } from '@/components/dashboard/add-equipment-dialog'
import { RealtimeListener } from '@/components/dashboard/realtime-listener'
// Import the new EquipmentList component
import { EquipmentList } from '@/components/dashboard/equipment-list'

export default async function ItemsManagementPage({ searchParams }: { searchParams?: any }) {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError || user.app_metadata?.role !== 'admin') {
    redirect('/login?error=unauthorized')
  }

  const sp = await searchParams
  const search = (sp?.search || '').trim()

  let query = supabase.from('items').select('*')
  if (search) {
    // filter by name or category using case-insensitive LIKE
    const escaped = search.replace(/%/g, '\\%')
    query = query.or(`name.ilike.%${escaped}%,category.ilike.%${escaped}%`)
  }

  const { data: items, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching items:", error.message)
  }

  return (
    <div className="animate-in fade-in duration-700" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
      <RealtimeListener />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[2.5rem] leading-tight font-medium tracking-tight mb-2 text-white">Equipment Database</h1>
          <p className="text-gray-400 text-xl font-light">Manage and track your entire laboratory inventory.</p>
        </div>
        <AddEquipmentDialog />
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/[0.01]">
          <h2 className="text-xl font-medium tracking-tight text-white">Inventory Overview</h2>
          <span className="text-gray-500 text-sm font-medium tracking-widest uppercase">
            {(items || []).reduce((s, it) => s + (it.quantity || 1), 0)} Total Physical Assets
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          {/* Delegate rendering to the client component */}
          <EquipmentList items={items || []} />
        </div>
      </div>
    </div>
  )
}