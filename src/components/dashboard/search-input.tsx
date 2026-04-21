"use client"

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function SearchInput({ initial = '' }: { initial?: string }) {
  const router = useRouter()
  const [q, setQ] = useState(initial)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = q.trim()
    const params = new URLSearchParams()
    if (trimmed) params.set('search', trimmed)
    router.push(`/dashboard/items${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const clear = () => {
    setQ('')
    router.push('/dashboard/items')
    inputRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      clear()
    }
  }

  return (
    <form onSubmit={submit} className="hidden md:block">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search everything..."
          className="bg-white/5 border border-white/10 rounded-full px-6 py-2.5 min-w-[250px] focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-gray-500 text-sm"
        />

        {q.length > 0 && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </form>
  )
}