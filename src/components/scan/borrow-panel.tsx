'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UnitProp {
  id: string
  status?: string
  item?: { id?: string; name?: string; category?: string; quantity?: number }
}

export default function BorrowPanel({ unit }: { unit: UnitProp }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleBorrow = async () => {
    const name = window.prompt('Please enter your name to borrow this item (required)')
    if (!name || !name.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: unit.id, borrowerName: name.trim() })
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage('Borrow successful. Thank you!')
        // refresh or navigate to a simple success view
        setTimeout(() => router.refresh(), 800)
      } else {
        setMessage(data?.error ?? 'Could not borrow this item')
      }
    } catch (err) {
      setMessage((err as Error).message ?? 'Network error')
    }

    setLoading(false)
  }

  return (
    <div className="p-4 rounded-lg bg-white/[0.01] border border-white/6">
      <p className="text-gray-300">Status: <span className="text-white font-medium">{unit.status ?? 'UNKNOWN'}</span></p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={handleBorrow}
          disabled={loading || unit.status !== 'AVAILABLE'}
          className="px-5 py-3 rounded-full bg-white text-[#0a0d27] font-medium disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Borrow This Item'}
        </button>
      </div>
      {message && <p className="mt-3 text-sm text-gray-300">{message}</p>}
    </div>
  )
}
