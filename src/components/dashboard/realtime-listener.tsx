'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { mutate } from 'swr'

export function RealtimeListener() {
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!supabase) return

    const client = supabase // narrowed to non-null after the guard above

    const refresh = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        // Immediately revalidate SWR keys used by the dashboard so client components update fast
        void mutate('/api/items')
        void mutate('/api/borrow')
        // Keep router.refresh to update any server-rendered parts as a fallback
        router.refresh()
      }, 300)
    }

    const channel = client
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'borrow_logs' }, refresh)
      .subscribe()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      client.removeChannel(channel)
    }
  }, [router])

  return null
}