'use client'

import Link from 'next/link'
import { useDashboardStats } from '@/hooks/use-dashboard-data'
import { RealtimeListener } from '@/components/dashboard/realtime-listener'
import { ItemsTable } from '@/components/dashboard/items-table'

function StatCard({
  label,
  value,
  color = 'default',
}: {
  label: string
  value: number
  color?: 'default' | 'indigo' | 'rose'
}) {
  const styles = {
    default: 'bg-white/[0.03] border-white/5',
    indigo: 'bg-indigo-500/[0.03] border-indigo-500/10',
    rose: 'bg-rose-500/[0.03] border-rose-500/10',
  }
  const textStyles = {
    default: 'text-gray-400',
    indigo: 'text-indigo-200/70',
    rose: 'text-rose-400/80',
  }
  const valueStyles = {
    default: 'text-white',
    indigo: 'text-white',
    rose: 'text-rose-300',
  }

  return (
    <div className={`p-8 rounded-[2rem] border flex flex-col justify-between min-h-[190px] hover:opacity-80 transition-opacity ${styles[color]}`}>
      <span className={`text-[15px] font-medium tracking-wide ${textStyles[color]}`}>{label}</span>
      <div className={`text-6xl font-light tracking-tight mt-4 ${valueStyles[color]}`}>
        {value}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { totalAssets, availableItems, activeBorrows, overdueBorrows, isLoading } = useDashboardStats()

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-300">
      <RealtimeListener />

      <div>
        <h1 className="text-[2.75rem] leading-tight font-medium tracking-tight mb-2">System Overview</h1>
        <p className="text-gray-400 text-[17px] font-light">Real-time status of all laboratory assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Assets" value={totalAssets} />
        <StatCard label="Available" value={availableItems} />
        <StatCard label="Active Borrows" value={activeBorrows} color="indigo" />
        <StatCard label="Overdue" value={overdueBorrows} color="rose" />
      </div>

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
        <ItemsTable isLoading={isLoading} />
      </div>
    </div>
  )
}