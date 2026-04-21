import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { UserMenu } from '@/components/dashboard/user-menu'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error || user.app_metadata?.role !== 'admin') {
    redirect('/login?error=unauthorized')
  }

  const fullName = user.user_metadata?.full_name as string | undefined
  const email = user.email ?? ''
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : email.slice(0, 2).toUpperCase()

  return (
    <div
      className="min-h-screen bg-[#0a0d27] text-white selection:bg-white/20 flex flex-col"
      style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
    >
      <nav className="border-b border-white/10 bg-[#0a0d27]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-24 flex items-center justify-between">
          <span className="text-3xl font-medium tracking-tight text-white">
            Inventory <span className="text-gray-500 font-normal ml-2">Lab Control</span>
          </span>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="text-base text-gray-400 hover:text-white transition-colors">Overview</Link>
              <Link href="/dashboard/items" className="text-base text-gray-400 hover:text-white transition-colors">Equipments</Link>
              <Link href="/dashboard/history" className="text-base text-gray-400 hover:text-white transition-colors">Logs</Link>
            </div>
            <input
              type="text"
              placeholder="Search everything..."
              className="hidden md:block bg-white/5 border border-white/10 rounded-full px-6 py-2.5 min-w-[250px] focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-gray-500 text-sm"
            />
            <UserMenu initials={initials} fullName={fullName} email={email} avatarUrl={avatarUrl} />
          </div>
        </div>
      </nav>

      {/* FIXED: Added max-width, horizontal auto-margin, and padding */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 md:py-16">
        {children}
      </main>
    </div>
  )
}