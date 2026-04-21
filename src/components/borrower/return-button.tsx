'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ReturnButton({ itemId, logId, itemName }: { itemId: string, logId: string, itemName: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleReturn = async () => {
    if (!window.confirm(`Are you sure you want to return ${itemName}?`)) return

    setIsLoading(true)

    const res = await fetch('/api/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, logId }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      alert(body.error ?? 'Failed to return equipment. Please check with the lab admin.')
      setIsLoading(false)
    } else {
      // Instantly updates the UI back to the Available state
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleReturn}
      disabled={isLoading}
      className="w-full px-8 py-4 bg-transparent border border-white/20 text-white text-[15px] font-medium rounded-full hover:bg-white/5 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
      {isLoading ? 'Returning Asset...' : 'Return this Asset'}
    </button>
  )
}