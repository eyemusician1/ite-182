import { createSupabaseServerClient } from '@/lib/supabase-server'

// 1. Updated interface to match your Supabase columns exactly
export interface Item {
  id: string
  name: string
  category: string
  status: string
  created_at: string // Changed from createdAt
}

export async function ItemsTable() {
  const supabase = await createSupabaseServerClient()

  // 2. Fetch using snake_case 'created_at'
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false }) // Fixed naming
    .limit(5)

  if (error) {
    console.error("Error fetching items:", error.message)
  }

  // 3. Empty state
  if (!items || items.length === 0) {
    return (
      <div className="p-16 text-center text-gray-500 font-light text-xl border-t border-white/10">
        No equipment found in the database. Add an asset to see it here.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 text-gray-500 text-sm tracking-widest uppercase font-medium">
            <th className="px-10 py-6 font-normal">Asset Name</th>
            <th className="px-6 py-6 font-normal">Category</th>
            <th className="px-6 py-6 font-normal">Status</th>
            <th className="px-10 py-6 font-normal text-right">Added</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {items.map((item: Item) => (
            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
              <td className="px-10 py-6 text-white font-medium text-lg">{item.name}</td>
              <td className="px-6 py-6 font-light">{item.category}</td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'AVAILABLE' ? 'bg-emerald-400' :
                    item.status === 'MAINTENANCE' ? 'bg-amber-400' : 'bg-blue-400'
                  }`} />
                  <span className="text-sm font-medium tracking-wide uppercase">{item.status}</span>
                </div>
              </td>
              <td className="px-10 py-6 text-right font-light text-gray-500">
                {/* 4. Use the correct snake_case property here too */}
                {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                }) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}