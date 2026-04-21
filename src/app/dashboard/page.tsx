import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { ItemsTable } from '@/components/dashboard/items-table'
import { RealtimeListener } from '@/components/dashboard/realtime-listener'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()

  const [
    { count: totalAssets },
    { count: availableItems },
    { count: activeBorrows },
    { count: overdueBorrows }
  ] = await Promise.all([
    supabase.from('items').select('*', { count: 'exact', head: true }),
    supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'AVAILABLE'),
    supabase.from('borrow_logs').select('*', { count: 'exact', head: true }).is('returned_at', null),
    supabase.from('borrow_logs').select('*', { count: 'exact', head: true }).is('returned_at', null).lt('expected_return', now),
  ])

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <RealtimeListener />

      <div>
        <h1 className="text-[2.75rem] leading-tight font-medium tracking-tight mb-2">System Overview</h1>
        <p className="text-gray-400 text-[17px] font-light">Real-time status of all laboratory assets.</p>
      </div>

      {/* Flow-Styled Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1 */}
        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between min-h-[190px] hover:bg-white/[0.05] transition-colors">
          <span className="text-[15px] font-medium text-gray-400 tracking-wide">Total Assets</span>
          <div className="text-6xl font-light tracking-tight mt-4 text-white">
            {totalAssets ?? 0}
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between min-h-[190px] hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-gray-400 tracking-wide">Available</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
          </div>
          <div className="text-6xl font-light tracking-tight mt-4 text-white">
            {availableItems ?? 0}
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between min-h-[190px] hover:bg-white/[0.05] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-gray-400 tracking-wide">Active Borrows</span>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
          </div>
          <div className="text-6xl font-light tracking-tight mt-4 text-white">
            {activeBorrows ?? 0}
          </div>
        </div>

        {/* Card 4 (Overdue - Maintains the red alert theme but in Flow style) */}
        <div className="p-8 rounded-[2rem] bg-red-500/[0.05] border border-red-500/10 flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
          <span className="text-[15px] font-medium text-red-400 tracking-wide z-10">Overdue</span>
          <div className="text-6xl font-light tracking-tight mt-4 text-red-400 z-10">
            {overdueBorrows ?? 0}
          </div>
          {/* Subtle glow effect */}
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-red-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-red-500/20 transition-colors" />
        </div>
      </div>

      {/* Recent Activity Table Container */}
      <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] overflow-hidden flex flex-col mt-2 shadow-2xl">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-medium tracking-tight text-white">Recent Activity</h2>

          {/* Flow-Style Secondary Pill Button */}
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