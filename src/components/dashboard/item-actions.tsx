"use client"

import { useState } from 'react'

interface RawItem {
  id: string
  name: string
  category: string
  status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE'
  created_at?: string
  quantity?: number
}

export function ItemActions({ item, onMutate }: { item: RawItem; onMutate?: () => void }) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState(item.name)
  const [category, setCategory] = useState(item.category)
  const [status, setStatus] = useState(item.status)

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await fetch(`/api/items/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, status })
    })

    if (res.ok) {
      setIsEditOpen(false)
      onMutate?.() // instant SWR revalidation — no full page reload
    } else {
      const { error } = await res.json()
      alert(`Edit failed: ${error}`)
    }
    setIsLoading(false)
  }

  const handleDelete = async (decrement = 1) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decrement })
      })

      if (res.ok) {
        setIsDeleteOpen(false)
        onMutate?.() // instant SWR revalidation
      } else {
        const { error } = await res.json().catch(() => ({}))
        alert(`Delete failed: ${error ?? 'Unknown error'}`)
      }
    } catch (err) {
      alert(`Network error: ${err instanceof Error ? err.message : String(err)}`)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex justify-end items-center gap-4">
      <button onClick={() => setIsEditOpen(true)} className="text-gray-400 hover:text-white transition-colors text-sm font-medium tracking-wide">Edit</button>
      <button onClick={() => setIsDeleteOpen(true)} className="text-red-400/70 hover:text-red-400 transition-colors text-sm font-medium tracking-wide">Delete</button>

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
                      <option value="AVAILABLE" className="bg-[#12163b] text-white py-2">Available</option>
                      <option value="BORROWED" className="bg-[#12163b] text-white py-2">Borrowed</option>
                      <option value="MAINTENANCE" className="bg-[#12163b] text-white py-2">Maintenance</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-gray-400">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-6 py-3 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-8 py-3 bg-white text-[#0a0d27] text-sm font-medium rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors">
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
                <button type="button" onClick={() => setIsDeleteOpen(false)} className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
                {item.quantity && item.quantity > 1 ? (
                  <>
                    <button type="button" onClick={() => handleDelete(1)} disabled={isLoading} className="px-6 py-2.5 bg-white text-[#0a0d27] rounded-full text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors">
                      {isLoading ? 'Removing...' : 'Remove One'}
                    </button>
                    <button type="button" onClick={() => handleDelete(item.quantity)} disabled={isLoading} className="px-6 py-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm font-medium rounded-full hover:bg-rose-500/20 disabled:opacity-50 transition-colors">
                      {isLoading ? 'Deleting...' : `Delete All (${item.quantity})`}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => handleDelete(1)} disabled={isLoading} className="px-6 py-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm font-medium rounded-full hover:bg-rose-500/20 disabled:opacity-50 transition-colors">
                    {isLoading ? 'Deleting...' : 'Yes, Delete Asset'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}