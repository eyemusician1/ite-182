'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ItemWithLatestBorrow } from '@/types'

/** Subscribes to real-time item status changes via Supabase Realtime.
 * Staff dashboard updates instantly when a borrow or return happens. */
export function useRealtimeItems(initialItems: ItemWithLatestBorrow[]) {
  const [items, setItems] = useState<ItemWithLatestBorrow[]>(initialItems)

  useEffect(() => {
    const channel = supabase
      .channel('items-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === (payload.new as ItemWithLatestBorrow).id
                ? { ...item, ...(payload.new as ItemWithLatestBorrow) }
                : item
            )
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return items
}