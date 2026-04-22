import { createSupabaseServerClient } from '@/lib/supabase-server'

export const revalidate = 60

interface BorrowLog {
  id: string
  item_id: string
  borrower_name: string
  department: string
  borrowed_at: string
  expected_return: string
  returned_at: string | null
  returned_by_staff: boolean
  items: {
    name: string
    category: string
  } | null
}

function StatusPill({ log }: { log: BorrowLog }) {
  const isReturned = !!log.returned_at
  const isOverdue = !isReturned && new Date(log.expected_return) < new Date()

  if (isReturned) {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase border bg-emerald-500/10 border-emerald-500/20 text-emerald-300">
        <span className="mr-2 relative flex h-1.5 w-1.5">
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
        </span>
        Returned
      </span>
    )
  }

  if (isOverdue) {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase border bg-rose-500/10 border-rose-500/20 text-rose-300">
        <span className="mr-2 relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
        </span>
        Overdue
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase border bg-indigo-500/10 border-indigo-500/20 text-indigo-300">
      <span className="mr-2 relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
      </span>
      Active
    </span>
  )
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getDuration(start: string, end: string | null) {
  const from = new Date(start)
  const to = end ? new Date(end) : new Date()
  const diffMs = to.getTime() - from.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return 'Just now'
}

export default async function HistoryPage() {
  const supabase = await createSupabaseServerClient()

  const { data: logs, error } = await supabase
    .from('borrow_logs')
    .select(`
      *,
      items (
        name,
        category
      )
    `)
    .order('borrowed_at', { ascending: false })

  if (error) {
    console.error('Error fetching borrow logs:', error.message)
  }

  const allLogs: BorrowLog[] = logs ?? []
  const now = new Date()

  const totalLogs    = allLogs.length
  const activeLogs   = allLogs.filter(l => !l.returned_at && new Date(l.expected_return) >= now).length
  const returnedLogs = allLogs.filter(l => !!l.returned_at).length
  const overdueLogs  = allLogs.filter(l => !l.returned_at && new Date(l.expected_return) < now).length

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>

      {/* ── Page Header ───────────────────────────────── */}
      <div>
        <h1 className="text-[2.75rem] leading-tight font-medium tracking-tight mb-2">
          Borrow Logs
        </h1>
        <p className="text-gray-400 text-[17px] font-light">
          Complete audit trail of all equipment borrow and return activity.
        </p>
      </div>

      {/* ── Summary Stat Cards ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-10 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between min-h-[200px] hover:bg-white/[0.05] transition-colors">
          <span className="text-[14px] font-medium text-gray-400 tracking-wider uppercase">Total Records</span>
          <div className="text-7xl font-light tracking-tight mt-4 text-white">{totalLogs}</div>
        </div>

        <div className="p-10 rounded-[2rem] bg-indigo-500/[0.03] border border-indigo-500/10 flex flex-col justify-between min-h-[200px] hover:bg-indigo-500/[0.05] transition-colors">
          <span className="text-[14px] font-medium text-indigo-200/60 tracking-wider uppercase">Active</span>
          <div className="text-7xl font-light tracking-tight mt-4 text-white">{activeLogs}</div>
        </div>

        <div className="p-10 rounded-[2rem] bg-emerald-500/[0.03] border border-emerald-500/10 flex flex-col justify-between min-h-[200px] hover:bg-emerald-500/[0.05] transition-colors">
          <span className="text-[14px] font-medium text-emerald-200/60 tracking-wider uppercase">Returned</span>
          <div className="text-7xl font-light tracking-tight mt-4 text-white">{returnedLogs}</div>
        </div>

        <div className="p-10 rounded-[2rem] bg-rose-500/[0.03] border border-rose-500/10 flex flex-col justify-between min-h-[200px] relative overflow-hidden group hover:bg-rose-500/[0.05] transition-colors">
          <span className="text-[14px] font-medium text-rose-400/70 tracking-wider uppercase z-10">Overdue</span>
          <div className="text-7xl font-light tracking-tight mt-4 text-rose-300 z-10">{overdueLogs}</div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
        </div>
      </div>

      {/* ── Log Table ────────────────────────────────── */}
      <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col shadow-2xl">

        {/* Table header bar */}
        <div className="px-8 py-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01]">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-white">All Records</h2>
            <p className="text-gray-500 text-sm mt-0.5 font-light">
              {totalLogs} {totalLogs === 1 ? 'entry' : 'entries'} · sorted by latest
            </p>
          </div>
          {overdueLogs > 0 && (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-medium tracking-widest uppercase border bg-rose-500/10 border-rose-500/20 text-rose-300 self-start sm:self-auto">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
              </span>
              {overdueLogs} Overdue
            </span>
          )}
        </div>

        {/* Empty state */}
        {allLogs.length === 0 ? (
          <div className="p-24 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-light text-xl">No borrow records yet.</p>
            <p className="text-gray-600 text-sm font-light">Records will appear here once equipment is borrowed via QR code.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-[11px] tracking-widest uppercase font-medium bg-[#0a0d27]/40">
                  <th className="px-8 py-5 font-normal">Equipment</th>
                  <th className="px-6 py-5 font-normal">Borrower</th>
                  <th className="px-6 py-5 font-normal">Department</th>
                  <th className="px-6 py-5 font-normal">Borrowed</th>
                  <th className="px-6 py-5 font-normal">Due Date</th>
                  <th className="px-6 py-5 font-normal">Returned</th>
                  <th className="px-6 py-5 font-normal">Duration</th>
                  <th className="px-8 py-5 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {allLogs.map((log) => {
                  const isOverdue = !log.returned_at && new Date(log.expected_return) < now
                  return (
                    <tr
                      key={log.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Equipment */}
                      <td className="px-8 py-5">
                        <p className="text-white font-medium text-[15px] leading-tight">
                          {log.items?.name ?? (
                            <span className="text-gray-600 italic font-light">Deleted item</span>
                          )}
                        </p>
                        <p className="text-gray-600 text-[12px] font-light mt-0.5">
                          {log.items?.category ?? '—'}
                        </p>
                      </td>

                      {/* Borrower */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-medium text-gray-300 shrink-0 uppercase">
                            {log.borrower_name?.slice(0, 2) ?? '??'}
                          </div>
                          <span className="text-[15px] font-light whitespace-nowrap">
                            {log.borrower_name}
                          </span>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-6 py-5">
                        <span className="text-[13px] font-light text-gray-400 leading-snug block max-w-[200px]">
                          {log.department}
                        </span>
                      </td>

                      {/* Borrowed At */}
                      <td className="px-6 py-5 text-[13px] font-light text-gray-400 whitespace-nowrap">
                        {formatDateTime(log.borrowed_at)}
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`text-[13px] font-light ${isOverdue ? 'text-rose-400' : 'text-gray-400'}`}>
                          {formatDate(log.expected_return)}
                        </span>
                        {isOverdue && (
                          <p className="text-[11px] text-rose-500/70 font-light mt-0.5">Past due</p>
                        )}
                      </td>

                      {/* Returned At */}
                      <td className="px-6 py-5 text-[13px] font-light whitespace-nowrap">
                        {log.returned_at ? (
                          <span className="text-emerald-400/80">{formatDateTime(log.returned_at)}</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                        {log.returned_by_staff && (
                          <p className="text-[11px] text-gray-600 font-light mt-0.5">by staff</p>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-5 text-[13px] font-light text-gray-500 whitespace-nowrap">
                        {getDuration(log.borrowed_at, log.returned_at)}
                      </td>

                      {/* Status */}
                      <td className="px-8 py-5 text-right">
                        <StatusPill log={log} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {allLogs.length > 0 && (
          <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
            <span className="text-gray-600 text-[13px] font-light">
              Showing all {totalLogs} {totalLogs === 1 ? 'record' : 'records'}
            </span>
            <span className="text-gray-600 text-[11px] tracking-widest uppercase font-medium">
              Most recent first
            </span>
          </div>
        )}

      </div>
    </div>
  )
}