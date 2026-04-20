'use client'

// Dummy data to visualize the design before we hook up the database
const MOCK_ITEMS = [
  { id: '1', name: 'Digital Oscilloscope DS1054Z', category: 'Electronics', status: 'AVAILABLE', date: 'Oct 24, 2026' },
  { id: '2', name: 'MacBook Pro M3 Max', category: 'Computers', status: 'BORROWED', date: 'Oct 23, 2026' },
  { id: '3', name: 'Fluke 87V Multimeter', category: 'Testing', status: 'AVAILABLE', date: 'Oct 22, 2026' },
  { id: '4', name: 'Raspberry Pi 5 Kit', category: 'Microcontrollers', status: 'BORROWED', date: 'Oct 20, 2026' },
]

export function ItemsTable() {
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
          {MOCK_ITEMS.map((item) => (
            <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">

              {/* Name */}
              <td className="px-10 py-6 text-white font-medium text-lg">
                {item.name}
              </td>

              {/* Category */}
              <td className="px-6 py-6 font-light">
                {item.category}
              </td>

              {/* Status (Minimalist glowing dot indicator) */}
              <td className="px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'AVAILABLE'
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                      : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                  }`} />
                  <span className="text-sm font-medium tracking-wide uppercase">
                    {item.status}
                  </span>
                </div>
              </td>

              {/* Date */}
              <td className="px-10 py-6 text-right font-light text-gray-500">
                {item.date}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}