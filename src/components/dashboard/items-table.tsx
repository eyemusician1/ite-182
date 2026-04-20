import prisma from '@/lib/prisma'
import { Item } from '@prisma/client' // <-- 1. Import the exact type from Prisma

export async function ItemsTable() {
  // 1. Fetch the latest 5 items directly from your Supabase database
  const items = await prisma.item.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  // 2. Empty state if there is no data yet
  if (items.length === 0) {
    return (
      <div
        className="p-16 text-center text-gray-500 font-light text-xl border-t border-white/10"
        style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
      >
        No equipment found in the database. Add an asset to see it here.
      </div>
    )
  }

  // 3. Render the real data
  return (
    <div className="w-full overflow-x-auto" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
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
          {/* 2. Explicitly tell TypeScript that "item" is a Prisma Item */}
          {items.map((item: Item) => (
            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
              <td className="px-10 py-6 text-white font-medium text-lg">{item.name}</td>
              <td className="px-6 py-6 font-light">{item.category}</td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'AVAILABLE'
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                      // 3. Keep the "as string" cast here to prevent the build error
                      : (item.status as string) === 'MAINTENANCE'
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                  }`} />
                  <span className="text-sm font-medium tracking-wide uppercase">{item.status}</span>
                </div>
              </td>
              <td className="px-10 py-6 text-right font-light text-gray-500">
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}