import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import LogoutButton from '@/components/dashboard/logout-button'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getSession()

  if (!data?.session) {
    redirect('/login')
  }

  const user = data.session.user
  const fullName = user.user_metadata?.full_name as string | undefined
  const email = user.email ?? ''

  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : email.slice(0, 2).toUpperCase()

  return (
    <div
      className="min-h-screen bg-[#0a0d27] text-white selection:bg-white/20"
      style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
    >
      <nav className="border-b border-white/10 bg-[#0a0d27]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-medium tracking-tight text-white">
              Inventory <span className="text-gray-500 font-normal ml-2">Lab Control</span>
            </span>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="text-base text-white font-medium hover:text-gray-300 transition-colors">Overview</Link>
              <Link href="/dashboard/items" className="text-base text-gray-500 hover:text-white transition-colors">Database</Link>
              <Link href="/dashboard/history" className="text-base text-gray-500 hover:text-white transition-colors">Logs</Link>
            </div>

            <input
              type="text"
              placeholder="Search..."
              className="hidden md:block bg-white/5 border border-white/10 rounded-full px-6 py-2.5 min-w-[250px] focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-gray-500 text-sm"
            />

            {/* Avatar + logout */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-sm font-medium select-none">
                  {initials}
                </div>
                {/* Hover tooltip */}
                <div className="absolute right-0 top-14 bg-[#13172e] border border-white/10 rounded-2xl px-4 py-3 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="text-white font-medium">{fullName ?? email}</p>
                  {fullName && <p className="text-gray-500 text-xs mt-0.5">{email}</p>}
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-16 flex flex-col gap-12 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-[3rem] leading-tight font-medium tracking-tight mb-2">System Overview</h1>
            <p className="text-gray-400 text-xl font-light">Real-time status of all laboratory assets.</p>
          </div>
          <button className="px-10 py-4 rounded-full bg-white text-[#0a0d27] hover:bg-gray-200 transition-all font-medium text-lg whitespace-nowrap">
            Add Equipment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-between min-h-[200px]">
            <span className="text-lg font-medium text-gray-400">Total Assets</span>
            <div className="text-7xl font-light tracking-tight mt-4 bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
              1,248
            </div>
          </div>
          <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-between min-h-[200px]">
            <span className="text-lg font-medium text-gray-400">Available</span>
            <div className="text-7xl font-light tracking-tight mt-4 bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
              1,102
            </div>
          </div>
          <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-between min-h-[200px]">
            <span className="text-lg font-medium text-gray-400">Active Borrows</span>
            <div className="text-7xl font-light tracking-tight mt-4 bg-gradient-to-b from-white via-white/90 to-white/40 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
              142
            </div>
          </div>
          <div className="p-10 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col justify-between min-h-[200px] relative overflow-hidden">
            <span className="text-lg font-medium text-red-400 z-10">Overdue</span>
            <div className="text-7xl font-light tracking-tight mt-4 bg-gradient-to-b from-red-400 via-red-500/90 to-red-900/50 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(248,113,113,0.2)] z-10 relative">
              4
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-red-500/10 blur-[64px] rounded-full pointer-events-none" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 overflow-hidden flex flex-col mt-4">
          <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-2xl font-medium tracking-tight">Recent Activity</h2>
            <button className="text-gray-400 hover:text-white font-medium text-base transition-colors">
              View All Logs &rarr;
            </button>
          </div>
          <div className="p-10 text-center text-gray-500 py-40 flex flex-col items-center justify-center">
            <p className="text-xl font-light">Items Table Component renders here</p>
          </div>
        </div>
      </main>
    </div>
  )
}