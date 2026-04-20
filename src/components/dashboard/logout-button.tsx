'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm font-medium text-gray-400 hover:text-white transition-all"
    >
      Sign out
    </button>
  )
}