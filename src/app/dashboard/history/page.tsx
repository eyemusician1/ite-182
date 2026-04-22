'use client'

import { useBorrowLogs } from '@/hooks/use-dashboard-data'
import { RealtimeListener } from '@/components/dashboard/realtime-listener'

interface BorrowLog {
  id: string
  item_id: string
  borrower_name: string
  department: string
  borrowed_at: string
  expected_return: string
  returned_at: string | null
  returned_by_staff: boolean
  items: { name: string; category: string } | null
}

function StatusPill({ log }: { log: BorrowLog }) {
  const isReturned = !!log.returned_at
  const isOverdue = !isReturned && new Date(log.expected_return) < new Date()

  if (isReturned) return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase border bg-emerald-500/10 border-emerald-500/20 text-emerald-300">
      <span className="mr-2 relative flex h-1.5 w-1.5">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
      </span>
      Returned
    </span>
  )

  if (isOverdue) return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase border bg-rose-500/10 border-rose-500/20 text-rose-300">
      <span className="mr-2 relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
      </span>
      Overdue
    </span>
  )

  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase border bg-indigo-500/10 border-indigo-500/20 text-indigo-300">
      <span className="mr-2 relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
      </span>
      Active
    </span>
  )
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

function getDuration(start: string, end: string | null) {
  const diffMs = (end ? new Date(end) : new Date()).getTime() - new Date(start).getTime()
  const days = Math.floor(diffMs / 86400000)
  const hours = Math.floor((diffMs % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return 'Just now'
}

export default function HistoryPage() {
  const { logs, isLoading } = useBorrowLogs()
  const now = new Date()

  const allLogs: BorrowLog[] = logs
  const totalLogs = allLogs.length
  const activeLogs = allLogs.filter(l => !l.returned_at && new Date(l.expected_return) >= now).length
  const returnedLogs = allLogs.filter(l => !!l.returned_at).length
  const overdueLogs = allLogs.filter(l => !l.returned_at && new Date(l.expected_return) < now).length

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-300" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
      <RealtimeListener />

      <div>
        <h1 className="text-[2.75rem] leading-tight font-medium tracking-tight mb-2">Borrow Logs</h1>
        <p className="text-gray-400 text-[17px] font-light">Complete audit trail of all equipment borrow and return activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Records', value: totalLogs, color: 'bg-white/[0.03] border-white/5', text: 'text-gray-400' },
          { label: 'Active', value: activeLogs, color: 'bg-indigo-500/[0.03] border-indigo-500/10', text: 'text-indigo-200/60' },
          { label: 'Returned', value: returnedLogs, color: 'bg-emerald-500/[0.03] border-emerald-500/10', text: 'text-emerald-200/60' },
          { label: 'Overdue', value: overdueLogs, color: 'bg-rose-500/[0.03] border-rose-500/10', text: 'text-rose-400/70' },
        ].map(({ label, value, color, text }) => (
          <div key={label} className={`p-10 rounded-[2rem] border flex flex-col justify-between min-h-[200px] ${color}`}>
            <span className={`text-[14px] font-medium tracking-wider uppercase ${text}`}>{label}</span>
            <div className="text-7xl font-light tracking-tight mt-4 text-white">
              {isLoading ? <span className="inline-block w-16 h-16 bg-white/5 rounded animate-pulse" /> : value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col shadow-2xl">
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
              </span>
              {overdueLogs} Overdue
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-16 text-center text-gray-500 font-light">Loading records...</div>
        ) : allLogs.length === 0 ? (
          <div className="p-24 text-center flex flex-col items-center justify-center gap-4">
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
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-white font-medium text-[15px] leading-tight">
                          {log.items?.name ?? <span className="text-gray-600 italic font-light">Deleted item</span>}
                        </p>
                        <p className="text-gray-600 text-[12px] font-light mt-0.5">{log.items?.category ?? '—'}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-medium text-gray-300 shrink-0 uppercase">
                            {log.borrower_name?.slice(0, 2) ?? '??'}
                          </div>
                          <span className="text-[15px] font-light whitespace-nowrap">{log.borrower_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[13px] font-light text-gray-400 leading-snug block max-w-[200px]">{log.department}</span>
                      </td>
                      <td className="px-6 py-5 text-[13px] font-light text-gray-400 whitespace-nowrap">{formatDateTime(log.borrowed_at)}</td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`text-[13px] font-light ${isOverdue ? 'text-rose-400' : 'text-gray-400'}`}>{formatDate(log.expected_return)}</span>
                        {isOverdue && <p className="text-[11px] text-rose-500/70 font-light mt-0.5">Past due</p>}
                      </td>
                      <td className="px-6 py-5 text-[13px] font-light whitespace-nowrap">
                        {log.returned_at
                          ? <span className="text-emerald-400/80">{formatDateTime(log.returned_at)}</span>
                          : <span className="text-gray-600">—</span>}
                        {log.returned_by_staff && <p className="text-[11px] text-gray-600 font-light mt-0.5">by staff</p>}
                      </td>
                      <td className="px-6 py-5 text-[13px] font-light text-gray-500 whitespace-nowrap">{getDuration(log.borrowed_at, log.returned_at)}</td>
                      <td className="px-8 py-5 text-right"><StatusPill log={log} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {allLogs.length > 0 && (
          <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
            <span className="text-gray-600 text-[13px] font-light">Showing all {totalLogs} {totalLogs === 1 ? 'record' : 'records'}</span>
            <span className="text-gray-600 text-[11px] tracking-widest uppercase font-medium">Most recent first</span>
          </div>
        )}
      </div>
    </div>
  )
}