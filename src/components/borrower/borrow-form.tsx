'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BorrowForm({ itemId, itemName }: { itemId: string, itemName?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const form = e.currentTarget
    const borrowerName = (form.elements.namedItem('borrowerName') as HTMLInputElement).value.trim()
    const department = (form.elements.namedItem('department') as HTMLSelectElement).value
    const expectedReturn = (form.elements.namedItem('expectedReturn') as HTMLInputElement).value

    const res = await fetch('/api/borrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, borrowerName, department, expectedReturn }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Failed to borrow equipment. Please try again.')
      setIsLoading(false)
    } else {
      // Refresh the page so the server fetches the new "BORROWED" status and swaps the UI
      router.refresh()
    }
  }

  // Calculate the minimum datetime for the input (prevents past dates)
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  const minDateTime = now.toISOString().slice(0, 16)

  return (
    <div className="bg-[#12163b] border border-white/10 rounded-[2rem] p-8 mt-4 shadow-2xl">
      <h3 className="text-xl font-medium text-white mb-6">Borrow this Asset{itemName ? ` — ${itemName}` : ''}</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Borrower Name */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="borrowerName" className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Your Full Name</label>
          <input
            id="borrowerName"
            name="borrowerName"
            required
            placeholder="e.g. Juan Dela Cruz"
            className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light"
          />
        </div>

        {/* Department Dropdown */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="department" className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Department / Course</label>
          <div className="relative">
            <select
              id="department"
              name="department"
              required
              className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white appearance-none focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light cursor-pointer"
            >
              <option value="" disabled selected className="bg-[#12163b] text-gray-500">Select your department</option>
              <option value="BSIT" className="bg-[#12163b] text-white py-2">BS Information Technology</option>
              <option value="BSCS" className="bg-[#12163b] text-white py-2">BS Computer Science</option>
              <option value="BSCHEM" className="bg-[#12163b] text-white py-2">BS Chemistry</option>
              <option value="BSA" className="bg-[#12163b] text-white py-2">BS Agriculture</option>
              <option value="FACULTY" className="bg-[#12163b] text-white py-2">Faculty / Staff</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-gray-400">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </div>
          </div>
        </div>

        {/* Expected Return Date/Time */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="expectedReturn" className="text-sm font-medium text-gray-300 tracking-wide uppercase text-xs">Expected Return Time</label>
          <input
            id="expectedReturn"
            name="expectedReturn"
            type="datetime-local"
            min={minDateTime}
            required
            className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-light"
            style={{ colorScheme: 'dark' }} // Forces the native browser calendar popup to be dark mode
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 px-8 py-4 bg-white text-[#0a0d27] text-[15px] font-medium rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)] flex justify-center items-center gap-2"
        >
          {isLoading ? 'Processing...' : 'Confirm Borrow'}
        </button>
      </form>
    </div>
  )
}