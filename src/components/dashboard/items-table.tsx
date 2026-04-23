'use client'

import { useItems } from '@/hooks/use-dashboard-data'

interface Item {
  id: string
  name: string
  category: string
  status: string
  created_at: string
  quantity?: number
}

export function ItemsTable({ isLoading: parentLoading }: { isLoading?: boolean }) {
  const { items, isLoading } = useItems()

  const loading = parentLoading || isLoading
  const recent = items.slice(0, 5)

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-gray-500 text-[11px] tracking-widest uppercase font-medium bg-[#0a0d27]/40">
              <th className="px-8 py-5 font-normal">Asset Name</th>
              <th className="px-6 py-5 font-normal">Category</th>
              <th className="px-6 py-5 font-normal">Quantity</th>
              <th className="px-6 py-5 font-normal">Status</th>
              <th className="px-8 py-5 font-normal text-right">Added</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-white/5">
                {[...Array(5)].map((_, j) => (
                  <td key={j} className="px-8 py-5">
                    <div className="h-4 bg-white/5 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!recent || recent.length === 0) {
    return (
      <div className="p-16 text-center text-gray-500 font-light text-xl">
        No equipment found in the database.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 text-gray-500 text-[11px] tracking-widest uppercase font-medium bg-[#0a0d27]/40">
            <th className="px-8 py-5 font-normal">Asset Name</th>
            <th className="px-6 py-5 font-normal">Category</th>
            <th className="px-6 py-5 font-normal">Quantity</th>
            <th className="px-6 py-5 font-normal">Status</th>
            <th className="px-8 py-5 font-normal text-right">Added</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {recent.map((item) => (
            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
              <td className="px-8 py-5 text-white font-medium text-[15px]">{item.name}</td>
              <td className="px-6 py-5 font-light text-[15px]">{item.category}</td>
              <td className="px-6 py-5 font-light text-[15px]">{item.quantity ?? 1}</td>
              <td className="px-6 py-5">
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
              <td className="px-8 py-5 text-right font-light text-gray-500 text-[15px]">
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