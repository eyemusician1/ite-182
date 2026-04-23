'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function AuthConfirmInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  useEffect(() => {
    if (!supabase) {
      router.replace(next)
      return
    }

    const client = supabase

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        router.replace(next)
      }
    })

    // If session already settled, redirect immediately
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe()
        router.replace(next)
      }
    })

    // Safety fallback after 3s
    const timeout = setTimeout(() => {
      subscription.unsubscribe()
      router.replace(next)
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [router, next])

  return null
}

function Spinner() {
  return (
    <div
      className="min-h-screen bg-[#0a0d27] flex items-center justify-center"
      style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
    >
      <div className="flex flex-col items-center gap-4">
        <span className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-light">Signing you in...</p>
      </div>
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthConfirmInner />
      <Spinner />
    </Suspense>
  )
}