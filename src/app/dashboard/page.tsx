import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ItemsTable } from '@/components/dashboard/items-table'
import { RealtimeListener } from '@/components/dashboard/realtime-listener'

export const revalidate = 30

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()

  // Fetch items and borrow counts. We sum `quantity` on the server-side results for totals.
  const [{ data: items }, { data: activeBorrowRows }, { data: overdueRows }] = await Promise.all([
    supabase.from('items').select('id,quantity,status'),
    supabase.from('borrow_logs').select('*').is('returned_at', null),
    supabase.from('borrow_logs').select('*').is('returned_at', null).lt('expected_return', now),
  ])

  const totalAssets = (items || []).reduce((s, it) => s + (it.quantity || 0), 0)
  const availableItems = (items || []).filter(i => i.status === 'AVAILABLE').reduce((s, it) => s + (it.quantity || 0), 0)
  const activeBorrows = activeBorrowRows?.length ?? 0
  const overdueBorrows = overdueRows?.length ?? 0

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <RealtimeListener />

      <div>
        <h1 className="text-[2.75rem] leading-tight font-medium tracking-tight mb-2">System Overview</h1>
        <p className="text-gray-400 text-[17px] font-light">Real-time status of all laboratory assets.</p>
      </div>

      {/* Flow-Styled Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Assets */}
        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between min-h-[190px] hover:bg-white/[0.05] transition-colors">
          <span className="text-[15px] font-medium text-gray-400 tracking-wide">Total Assets</span>
          <div className="text-6xl font-light tracking-tight mt-4 text-white">
            {totalAssets ?? 0}
          </div>
        </div>

        {/* Available Items */}
        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between min-h-[190px] hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-gray-400 tracking-wide">Available</span>
          </div>
          <div className="text-6xl font-light tracking-tight mt-4 text-white">
            {availableItems ?? 0}
          </div>
        </div>

        {/* Active Borrows (Indigo Theme + Pulse) */}
        <div className="p-8 rounded-[2rem] bg-indigo-500/[0.03] border border-indigo-500/10 flex flex-col justify-between min-h-[190px] hover:bg-indigo-500/[0.05] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-indigo-200/70 tracking-wide">Active Borrows</span>
          </div>
          <div className="text-6xl font-light tracking-tight mt-4 text-white">
            {activeBorrows ?? 0}
          </div>
        </div>

        {/* Overdue (Muted Rose Theme) */}
        <div className="p-8 rounded-[2rem] bg-rose-500/[0.03] border border-rose-500/10 flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
          <span className="text-[15px] font-medium text-rose-400/80 tracking-wide z-10">Overdue</span>
          <div className="text-6xl font-light tracking-tight mt-4 text-rose-300 z-10">
            {overdueBorrows ?? 0}
          </div>
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-rose-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
        </div>
      </div>

      {/* Recent Activity Table Container */}
      <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col mt-2 shadow-2xl">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-medium tracking-tight text-white">Recent Activity</h2>
          <Link href="/dashboard/history">
            <button className="px-5 py-2.5 rounded-full bg-transparent border border-white/10 hover:bg-white/5 text-white text-[13px] font-medium transition-colors flex items-center gap-2">
              View All Logs
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </Link>
        </div>
        <ItemsTable />
      </div>
    </div>
  )
}