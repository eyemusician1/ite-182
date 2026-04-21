import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AddEquipmentDialog } from '@/components/dashboard/add-equipment-dialog'
import { RealtimeListener } from '@/components/dashboard/realtime-listener'
import { ItemActions } from '@/components/dashboard/item-actions'

export default async function ItemsManagementPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError || user.app_metadata?.role !== 'admin') {
    redirect('/login?error=unauthorized')
  }

  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })

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
          <h2 className="text-xl font-medium tracking-tight text-white">All Assets</h2>
          <span className="text-gray-500 text-sm font-medium tracking-widest uppercase">
            {items?.length || 0} Total Items
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-[11px] tracking-widest uppercase font-medium bg-white/[0.02]">
                <th className="px-10 py-6 font-normal">Asset Name</th>
                <th className="px-6 py-6 font-normal">Category</th>
                <th className="px-6 py-6 font-normal">Status</th>
                <th className="px-6 py-6 font-normal">QR ID</th>
                <th className="px-10 py-6 font-normal text-right">Added</th>
                <th className="px-6 py-6 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {!items || items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-gray-500 font-light text-xl">
                    No equipment found in the database.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-white/10 hover:bg-white/[0.04] transition-colors group">
                    <td className="px-10 py-6 text-white font-medium text-[15px]">{item.name}</td>
                    <td className="px-6 py-6 font-light text-[15px]">{item.category}</td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase border ${
                        item.status === 'AVAILABLE'
                          ? 'bg-white/5 border-white/10 text-gray-300'
                          : item.status === 'MAINTENANCE'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                          : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                      }`}>
                        {item.status === 'BORROWED' && (
                          <span className="mr-2 relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                          </span>
                        )}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 font-mono text-sm text-gray-500">
                      {item.id.split('-')[0]}...
                    </td>
                    <td className="px-10 py-6 text-right font-light text-gray-500 text-[15px]">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <ItemActions item={item} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}