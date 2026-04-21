import { createSupabaseServerClient } from '@/lib/supabase-server'

interface BorrowLog {
  id: string
  borrowed_at: string
  expected_return: string
  returned_at: string | null
  borrower_name: string
  borrower_dept: string
  items: { name: string } | null
}

function getStatus(log: BorrowLog): 'RETURNED' | 'OVERDUE' | 'ACTIVE' {
  if (log.returned_at) return 'RETURNED'
  if (new Date(log.expected_return) < new Date()) return 'OVERDUE'
  return 'ACTIVE'
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export async function HistoryTable() {
  const supabase = await createSupabaseServerClient()

  const { data: logs, error } = await supabase
    .from('borrow_logs')
    .select('*, items(name)')
    .order('borrowed_at', { ascending: false })
    .limit(50)

  if (error) console.error('Error fetching borrow logs:', error.message)

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="p-16 text-center text-gray-500 font-light text-xl">
          No borrow history found.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-2">
        <div className="flex gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filter by item or borrower..."
            className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-gray-500 text-sm"
          />
        </div>
        <button className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-full transition-all w-full sm:w-auto">
          Export Data
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10 text-gray-500 text-xs tracking-widest uppercase font-medium bg-white/[0.02]">
              <th className="px-8 py-6 font-normal">Asset</th>
              <th className="px-6 py-6 font-normal">Borrower</th>
              <th className="px-6 py-6 font-normal">Borrowed</th>
              <th className="px-6 py-6 font-normal">Due Date</th>
              <th className="px-6 py-6 font-normal">Returned</th>
              <th className="px-8 py-6 font-normal text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {logs.map((log: BorrowLog) => {
              const status = getStatus(log)
              return (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors">
                  <td className="px-8 py-6">
                    <div className="text-white font-medium text-base">{log.items?.name ?? '—'}</div>
                    <div className="text-gray-500 text-sm mt-1">ID: {log.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-white font-medium">{log.borrower_name}</div>
                    <div className="text-gray-500 text-sm mt-1">{log.borrower_dept}</div>
                  </td>
                  <td className="px-6 py-6 font-light text-gray-400">{formatDate(log.borrowed_at)}</td>
                  <td className="px-6 py-6 font-light text-gray-400">{formatDate(log.expected_return)}</td>
                  <td className="px-6 py-6 font-light text-gray-400">{formatDate(log.returned_at)}</td>
                  <td className="px-8 py-6 text-right">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase border ${
                      status === 'RETURNED' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                      status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(248,113,113,0.15)]'
                    }`}>
                      {status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}