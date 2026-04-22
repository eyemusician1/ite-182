'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'unauthorized') {
      setAuthError("Access denied. Account is not an admin.")
      window.history.replaceState(null, '', '/login')
    }
  }, [])

  const handleGoogleLogin = async () => {
    if (!supabase) return

    const client = supabase // narrowed to non-null

    setIsLoading(true)
    setAuthError(null)

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`
      }
    })

    if (error) {
      console.error("Error logging in:", error.message)
      setAuthError("Something went wrong connecting to Google.")
      setIsLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0d27] text-white bg-[url('/loginBg.png')] bg-cover bg-center"
      style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90 -z-10" />

      <div className="z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center animate-in fade-in duration-700">
        <h1 className="text-6xl md:text-[5.5rem] lg:text-[7rem] font-medium tracking-tight mb-6">
          Inventory
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 font-light max-w-xl">
          Manage lab equipment and tracking securely.
        </p>

        <div className="w-full max-w-sm flex flex-col items-center">
          <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in-95 duration-500">

            {authError && (
              <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
                {authError}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="px-8 py-3.5 rounded-full border border-white/20 bg-transparent hover:bg-white/10 transition-all duration-300 font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connecting to Google...' : 'Access System'}
            </button>

            <div className="flex flex-col gap-4 mt-2">
              <button className="text-gray-400 text-sm hover:text-white transition-colors">
                How do I get access?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}