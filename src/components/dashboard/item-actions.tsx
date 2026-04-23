"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Item } from '@/hooks/use-dashboard-data'
import { KeyedMutator } from 'swr'

interface RawItem {
  id: string
  name: string
  category: string
  status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE'
  created_at?: string
  quantity?: number
}

export function ItemActions({ item, mutate }: { item: RawItem; mutate: KeyedMutator<Item[]> }) {
  const [isQrOpen, setIsQrOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function gen() {
      if (!isQrOpen) return
      try {
        // dynamic import to avoid SSR issues
        const QR = await import('qrcode')
        const origin = typeof location !== 'undefined' ? location.origin : ''
        const url = `${origin}/scan/${item.id}`
        const dataUrl = await QR.toDataURL(url, { width: 400 })
        if (mounted) setQrDataUrl(dataUrl)
      } catch (err) {
        console.error('Failed to generate QR code', err)
        if (mounted) setQrDataUrl(null)
      }
    }

    gen()
    return () => { mounted = false }
  }, [isQrOpen, item.id])
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState(item.category)
  const [status, setStatus] = useState(item.status)

  useEffect(() => {
    // keep local form state in sync if the parent item changes
    setName(item.name)
    setCategory(item.category)
    setStatus(item.status)
  }, [item.id, item.name, item.category, item.status])

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 1. Close modal instantly
    setIsEditOpen(false)

    // 2. Update cache immediately
    await mutate(
      current => (current ?? []).map(i => i.id === item.id ? { ...i, name, category, status } : i),
      { revalidate: false }
    )

    const toastId = toast.loading(`Saving changes to ${name}...`)

    // 3. Send to API
    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, status })
    })

    if (!res.ok) {
      await mutate() // revert
      const { error } = await res.json().catch(() => ({}))
      toast.error(error ?? 'Failed to save changes.', { id: toastId })
      setIsEditOpen(true)
    } else {
      await mutate() // confirm
      toast.success('Equipment updated successfully!', { id: toastId })
    }

    setIsLoading(false)
  }

  const handleDelete = async (decrement = 1) => {
    setIsLoading(true)
    setIsDeleteOpen(false)

    const label = decrement === 1 ? `1 unit of ${item.name}` : `${item.name}`

    // 1. Remove from cache immediately
    await mutate(
      current => (current ?? [])
        .map(i => {
          if (i.id !== item.id) return i
          const newQty = (i.quantity ?? 1) - decrement
          return newQty > 0 ? { ...i, quantity: newQty } : null
        })
        .filter(Boolean) as Item[],
      { revalidate: false }
    )

    const toastId = toast.loading(`Deleting ${label}...`)

    // 2. Send to API
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decrement })
      })

      if (!res.ok) {
        await mutate() // revert
        const { error } = await res.json().catch(() => ({}))
        toast.error(error ?? 'Failed to delete equipment.', { id: toastId })
      } else {
        await mutate() // confirm
        toast.success(`${label} deleted.`, { id: toastId })
      }
    } catch (err) {
      await mutate()
      toast.error(err instanceof Error ? err.message : 'Network error.', { id: toastId })
    }

    setIsLoading(false)
  }

  return (
    <div className="flex justify-end items-center gap-4">
      <button onClick={() => setIsEditOpen(true)} className="text-gray-400 hover:text-white transition-colors text-sm font-medium tracking-wide">Edit</button>
      <button onClick={() => setIsDeleteOpen(true)} className="text-red-400/70 hover:text-red-400 transition-colors text-sm font-medium tracking-wide">Delete</button>
      <button onClick={() => setIsQrOpen(true)} title="Show QR code" className="text-gray-300 hover:text-white transition-colors text-sm font-medium tracking-wide flex items-center gap-2">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <path d="M7 14h3v3H7zM3 10h7" />
        </svg>
        <span className="hidden md:inline">QR</span>
      </button>

      {isEditOpen && (
        <div className="fixed inset-0 bg-[#0a0d27]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          <div className="bg-[#0a0d27]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full max-w-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-2xl font-medium text-white tracking-tight">Edit Equipment</h3>
              <p className="text-gray-400 text-sm mt-2 font-light">Update the details and current status of this asset.</p>
            </div>
            <form onSubmit={handleEdit} className="p-10 flex flex-col gap-8">
              <div className="space-y-6">
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Asset Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light" />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Category</label>
                  <input type="text" value={category} onChange={e => setCategory(e.target.value)} required
                    className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light" />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Current Status</label>
                  <div className="relative">
                    <select value={status} onChange={e => setStatus(e.target.value as RawItem['status'])}
                      className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white appearance-none focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light cursor-pointer">
                      <option value="AVAILABLE" className="bg-[#12163b] text-white">Available</option>
                      <option value="BORROWED" className="bg-[#12163b] text-white">Borrowed</option>
                      <option value="MAINTENANCE" className="bg-[#12163b] text-white">Maintenance</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-gray-400">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-2">
                <button type="button" onClick={() => setIsEditOpen(false)}
                  className="px-6 py-3 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading}
                  className="px-8 py-3 bg-white text-[#0a0d27] text-sm font-medium rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors">
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 bg-[#0a0d27]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          <div className="bg-[#0a0d27]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full max-w-md shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-xl font-medium text-white tracking-tight">Delete Equipment</h3>
            </div>
            <div className="p-8 flex flex-col gap-8">
              <p className="text-gray-300 font-light text-[15px] leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white font-medium">{item.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsDeleteOpen(false)}
                  className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                {item.quantity && item.quantity > 1 ? (
                  <>
                    <button type="button" onClick={() => handleDelete(1)} disabled={isLoading}
                      className="px-6 py-2.5 bg-white text-[#0a0d27] rounded-full text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors">
                      {isLoading ? 'Removing...' : 'Remove One'}
                    </button>
                    <button type="button" onClick={() => handleDelete(item.quantity)} disabled={isLoading}
                      className="px-6 py-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm font-medium rounded-full hover:bg-rose-500/20 disabled:opacity-50 transition-colors">
                      {isLoading ? 'Deleting...' : `Delete All (${item.quantity})`}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => handleDelete(1)} disabled={isLoading}
                    className="px-6 py-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm font-medium rounded-full hover:bg-rose-500/20 disabled:opacity-50 transition-colors">
                    {isLoading ? 'Deleting...' : 'Yes, Delete Asset'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isQrOpen && (
        <div className="fixed inset-0 bg-[#0a0d27]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0a0d27]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] w-full max-w-sm shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden p-6 text-center">
            <h3 className="text-xl font-medium text-white mb-4">QR Code — {item.name}</h3>
            <div className="bg-white/3 p-4 rounded-lg inline-block">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`QR for ${item.name}`} className="w-56 h-56 object-contain" />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-gray-400">Generating...</div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <a href={qrDataUrl ?? '#'} download={`qr-${item.id}.png`} className="px-4 py-2 bg-white text-[#0a0d27] rounded-full font-medium hover:bg-gray-200">Download</a>
              <button onClick={() => {
                const url = `${typeof location !== 'undefined' ? location.origin : ''}/scan/${item.id}`
                navigator.clipboard?.writeText(url)
                toast.success('Scan URL copied to clipboard')
              }} className="px-4 py-2 bg-white/5 text-white rounded-full font-medium hover:bg-white/10">Copy link</button>
            </div>

            <div className="mt-4">
              <button onClick={() => setIsQrOpen(false)} className="px-6 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}