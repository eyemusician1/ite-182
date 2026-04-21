'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type DbItem = {
  id: string
  name: string
  category: string
  status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE'
  created_at?: string
}

export function ItemActions({ item }: { item: DbItem }) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
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
      router.refresh()
    } else {
      const { error } = await res.json()
      alert(`Edit failed: ${error}`)
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${item.name}? This cannot be undone.`)) return

    const res = await fetch(`/api/items/${item.id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      const { error } = await res.json()
      alert(`Delete failed: ${error}`)
    }
  }

  return (
    <div className="flex justify-end items-center gap-4">
      <button
        onClick={() => setIsEditOpen(true)}
        className="text-gray-400 hover:text-white transition-colors text-sm font-medium tracking-wide"
      >
        Edit
      </button>
      <button
        onClick={handleDelete}
        className="text-red-400/70 hover:text-red-400 transition-colors text-sm font-medium tracking-wide"
      >
        Delete
      </button>

      {/* Redesigned Modal Overlay */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-[#0a0d27]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">

          {/* Modal Container */}
          <div className="bg-[#12163b] border border-white/10 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden text-left">

            {/* Header Area */}
            <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-2xl font-medium text-white tracking-tight">Edit Equipment</h3>
              <p className="text-gray-400 text-sm mt-2 font-light">Update the details and current status of this asset.</p>
            </div>

            {/* Form Area */}
            <form onSubmit={handleEdit} className="p-10 flex flex-col gap-8">
              <div className="space-y-6">

                {/* Name Input */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Asset Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light"
                    required
                  />
                </div>

                {/* Category Input */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light"
                    required
                  />
                </div>

                {/* Status Dropdown */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Current Status</label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE')}
                      // appearance-none removes the ugly default OS styling
                      className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white appearance-none focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light cursor-pointer"
                    >
                      {/* Set backgrounds on options so they don't turn transparent on Windows */}
                      <option value="AVAILABLE" className="bg-[#12163b] text-white py-2">Available</option>
                      <option value="BORROWED" className="bg-[#12163b] text-white py-2">Borrowed</option>
                      <option value="MAINTENANCE" className="bg-[#12163b] text-white py-2">Maintenance</option>
                    </select>

                    {/* Custom Chevron Icon */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-gray-400">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-6 py-3 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-white text-[#0a0d27] text-sm font-medium rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}