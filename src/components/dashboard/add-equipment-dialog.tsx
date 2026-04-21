'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function AddEquipmentDialog() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim()
    const category = (form.elements.namedItem('category') as HTMLInputElement).value.trim()

    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.message ?? 'Failed to register equipment. Please try again.')
    } else {
      form.reset()
      setOpen(false)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 1. Flow-Style Trigger Button */}
      {/* Notice we don't need an onClick handler here because DialogTrigger handles it natively! */}
      <DialogTrigger
        className="px-7 py-3.5 bg-white text-[#0a0d27] text-[15px] font-medium rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center gap-2 outline-none"
        style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Equipment
      </DialogTrigger>

      {/* 2. Flow-Style Modal Container */}
      <DialogContent
        className="bg-[#12163b] border border-white/10 text-white sm:max-w-lg rounded-[2rem] p-0 shadow-2xl overflow-hidden !gap-0"
        style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
      >
        {/* Header Area */}
        <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02]">
          <DialogTitle className="text-2xl font-medium tracking-tight">New Asset</DialogTitle>
          <p className="text-gray-400 text-sm mt-2 font-light">Register a new piece of equipment into the laboratory inventory.</p>
        </div>

        {/* Form Area */}
        <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Name Input */}
            <div className="flex flex-col gap-2.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Equipment Name</label>
              <input
                id="name"
                name="name"
                required
                placeholder="e.g. Oscilloscope Model X"
                className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light"
              />
            </div>

            {/* Category Input */}
            <div className="flex flex-col gap-2.5">
              <label htmlFor="category" className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Category</label>
              <input
                id="category"
                name="category"
                required
                placeholder="e.g. Electronics, Glassware"
                className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 mt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-6 py-3 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-white text-[#0a0d27] text-sm font-medium rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              {isLoading ? 'Adding...' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}