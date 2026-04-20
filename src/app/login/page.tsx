'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)

      // Removed debug logs to avoid leaking environment values to the client console.

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // This tells Google where to send the user after they log in
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

    if (error) {
      console.error("Error logging in:", error.message)
      setIsLoading(false)
    }
    // We don't set isLoading to false on success because the page will redirect!
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
              <p className="text-[11px] text-gray-500">
                Explore <span className="underline cursor-pointer hover:text-gray-300">CICS Guidelines</span>. See <span className="underline cursor-pointer hover:text-gray-300">FAQ</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}