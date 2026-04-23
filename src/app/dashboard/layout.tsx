import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { UserMenu } from '@/components/dashboard/user-menu'
import { SearchInput } from '@/components/dashboard/search-input'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()

  // Use getUser() — reliable server-side session verification
  // This is called after middleware already confirmed auth, so the
  // extra network call here is just a safety net for the layout
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) {
    redirect('/login')
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
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/cics-logo.png"
              alt="CICS Logo"
              width={140}
              height={40}
              className="object-contain h-10 w-auto"
              style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.45)) saturate(1.05) contrast(1.08)' }}
              priority
            />
            <span className="sr-only">Inventory Lab Control</span>
          </Link>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link href="/dashboard" className="text-base text-gray-400 hover:text-white transition-colors">Overview</Link>
              <Link href="/dashboard/items" className="text-base text-gray-400 hover:text-white transition-colors">Equipments</Link>
              <Link href="/dashboard/history" className="text-base text-gray-400 hover:text-white transition-colors">Logs</Link>
            </div>
            <SearchInput />
            <UserMenu initials={initials} fullName={fullName} email={email} avatarUrl={avatarUrl} />
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 md:py-16">
        {children}
      </main>
    </div>
  )
}