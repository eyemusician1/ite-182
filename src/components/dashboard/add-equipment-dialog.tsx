'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Item } from '@/hooks/use-dashboard-data'
import { KeyedMutator } from 'swr'

interface Props {
  mutate: KeyedMutator<Item[]>
}

export function AddEquipmentDialog({ mutate }: Props) {
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
    const quantity = parseInt((form.elements.namedItem('quantity') as HTMLInputElement).value, 10) || 1

    // Temp item for optimistic UI
    const tempItem: Item = {
      id: `temp-${Date.now()}`,
      name,
      category,
      quantity,
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
    }

    // 1. Close modal and show item instantly
    setOpen(false)
    form.reset()
    await mutate(current => [tempItem, ...(current ?? [])], { revalidate: false })

    const toastId = toast.loading(`Adding ${name}...`)

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, quantity }),
      })

      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        await mutate() // revert
        toast.error(body.error ?? 'Failed to add equipment.', { id: toastId })
        setError(body.error ?? 'Failed to register equipment.')
        setOpen(true)
      } else {
        await mutate() // confirm with real data
        toast.success(`${name} added successfully!`, { id: toastId })
      }
    } catch (err) {
      await mutate()
      const msg = err instanceof Error ? err.message : 'Network error.'
      toast.error(msg, { id: toastId })
      setError(msg)
      setOpen(true)
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="px-7 py-3.5 bg-white text-[#0a0d27] text-[15px] font-medium rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center gap-2 outline-none"
        style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Equipment
      </DialogTrigger>

      <DialogContent
        className="bg-[#0a0d27]/95 backdrop-blur-2xl border border-white/10 text-white sm:max-w-lg rounded-[2rem] p-0 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden !gap-0"
        style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
      >
        <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02]">
          <DialogTitle className="text-2xl font-medium tracking-tight">New Asset</DialogTitle>
          <p className="text-gray-400 text-sm mt-2 font-light">Register new equipment into the laboratory inventory.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
          )}
          <div className="space-y-6">
            <div className="flex flex-col gap-2.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Equipment Name</label>
              <input id="name" name="name" required placeholder="e.g. Oscilloscope Model X"
                className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light" />
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col gap-2.5 flex-1">
                <label htmlFor="category" className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Category</label>
                <input id="category" name="category" required placeholder="e.g. Electronics"
                  className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light" />
              </div>
              <div className="flex flex-col gap-2.5 w-1/3">
                <label htmlFor="quantity" className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Quantity</label>
                <input id="quantity" name="quantity" type="number" min="1" step="1" defaultValue="1" required
                  className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-2">
            <button type="button" onClick={() => { setOpen(false); setError(null) }}
              className="px-6 py-3 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-8 py-3 bg-white text-[#0a0d27] text-sm font-medium rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] flex items-center gap-2">
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-[#0a0d27]/30 border-t-[#0a0d27] rounded-full animate-spin" />Adding...</>
                : 'Add Equipment'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}