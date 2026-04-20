import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#0a0d27] text-white selection:bg-white/20 flex flex-col"
      style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
    >
      {/* --- Shared Minimalist Top Navigation --- */}
      <nav className="border-b border-white/10 bg-[#0a0d27]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-24 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <span className="text-3xl font-medium tracking-tight text-white">
              Inventory <span className="text-gray-500 font-normal ml-2">Lab Control</span>
            </span>
          </div>

          <div className="flex items-center gap-8">
             <div className="hidden md:flex items-center gap-8">
               <Link href="/dashboard" className="text-base text-gray-400 hover:text-white transition-colors">Overview</Link>
               <Link href="/dashboard/items" className="text-base text-gray-400 hover:text-white transition-colors">Database</Link>
               <Link href="/dashboard/history" className="text-base text-white font-medium hover:text-gray-300 transition-colors">Logs</Link>
             </div>

             <input
               type="text"
               placeholder="Search everything..."
               className="hidden md:block bg-white/5 border border-white/10 rounded-full px-6 py-2.5 min-w-[250px] focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-gray-500 text-sm"
             />

             <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-sm font-medium cursor-pointer hover:bg-white/10 transition-colors">
               SA
             </div>
          </div>
        </div>
      </nav>

      {/* Page Content loads here */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}