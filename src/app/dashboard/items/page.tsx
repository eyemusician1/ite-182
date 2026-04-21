import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { AddEquipmentDialog } from '@/components/dashboard/add-equipment-dialog'
import { RealtimeListener } from '@/components/dashboard/realtime-listener'
import { ItemActions } from '@/components/dashboard/item-actions'

export default async function ItemsManagementPage() {
  const supabase = await createSupabaseServerClient()

  // 1. Security Check: Ensure only Admins can access the master database
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError || user.app_metadata?.role !== 'admin') {
    redirect('/login?error=unauthorized')
  }

  // 2. Fetch all equipment from the database
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false }) // Using our fixed snake_case!

  if (error) {
    console.error("Error fetching items:", error.message)
  }

  return (
    <div className="animate-in fade-in duration-700" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
      {/* Invisible listener to refresh the table automatically when an item is added or borrowed */}
      <RealtimeListener />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[2.5rem] leading-tight font-medium tracking-tight mb-2 text-white">Equipment Database</h1>
          <p className="text-gray-400 text-xl font-light">Manage and track your entire laboratory inventory.</p>
        </div>

        {/* Reusing the dialog we fixed! */}
        <AddEquipmentDialog />
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 overflow-hidden flex flex-col shadow-2xl">
        <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-xl font-medium tracking-tight text-white">All Assets</h2>
          <span className="text-gray-500 text-sm font-medium tracking-widest uppercase">
            {items?.length || 0} Total Items
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-500 text-sm tracking-widest uppercase font-medium bg-[#0a0d27]/40">
                <th className="px-10 py-6 font-normal">Asset Name</th>
                <th className="px-6 py-6 font-normal">Category</th>
                <th className="px-6 py-6 font-normal">Status</th>
                <th className="px-6 py-6 font-normal">QR ID</th>
                <th className="px-10 py-6 font-normal text-right">Added</th>
                {/* NEW HEADER FOR ACTIONS */}
                <th className="px-6 py-6 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {!items || items.length === 0 ? (
                <tr>
                  {/* Updated colSpan from 5 to 6 to account for the new Actions column */}
                  <td colSpan={6} className="p-16 text-center text-gray-500 font-light text-xl">
                    No equipment found in the database.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors group">
                    <td className="px-10 py-6 text-white font-medium text-lg">{item.name}</td>
                    <td className="px-6 py-6 font-light">{item.category}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                            : item.status === 'MAINTENANCE'
                            ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                        }`} />
                        <span className="text-sm font-medium tracking-wide uppercase">{item.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-mono text-sm text-gray-500">
                      {/* Truncating the UUID so it looks clean on the dashboard */}
                      {item.id.split('-')[0]}...
                    </td>
                    <td className="px-10 py-6 text-right font-light text-gray-500">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    {/* NEW TABLE CELL FOR EDIT & DELETE */}
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