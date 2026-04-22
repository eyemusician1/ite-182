'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ItemWithLatestBorrow } from '@/types'

export function useRealtimeItems(initialItems: ItemWithLatestBorrow[]) {
  const [items, setItems] = useState<ItemWithLatestBorrow[]>(initialItems)
  const initialRef = useRef(initialItems)

  useEffect(() => {
    if (initialRef.current !== initialItems) {
      setItems(initialItems)
      initialRef.current = initialItems
    }
  }, [initialItems])

  useEffect(() => {
    if (!supabase) return

    const client = supabase // narrowed to non-null after the guard above

    const channel = client
      .channel('items-realtime-hook')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'items' },
        (payload) => {
          const updated = payload.new as ItemWithLatestBorrow
          if (!updated?.id) return
          setItems((prev) =>
            prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
          )
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'items' },
        (payload) => {
          const newItem = payload.new as ItemWithLatestBorrow
          if (!newItem?.id) return
          setItems((prev) => [newItem, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'items' },
        (payload) => {
          const deleted = payload.old as { id: string }
          if (!deleted?.id) return
          setItems((prev) => prev.filter((item) => item.id !== deleted.id))
        }
      )
      .subscribe()

    return () => { client.removeChannel(channel) }
  }, [])

  return items
}