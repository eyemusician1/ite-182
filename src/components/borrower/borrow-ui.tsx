'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function BorrowerUI({ itemId, itemName }: { itemId: string; itemName?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [borrowerName, setBorrowerName] = useState('')
  const [department, setDepartment] = useState('')
  const [expectedReturn, setExpectedReturn] = useState<string | null>(null)
  const [preset, setPreset] = useState<string | null>('2h')

  useEffect(() => {
    // initialize preset value
    applyPreset('2h')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyPreset(p: string) {
    setPreset(p)
    const now = new Date()
    let dt: Date
    if (p === '2h') dt = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    else if (p === '4h') dt = new Date(now.getTime() + 4 * 60 * 60 * 1000)
    else if (p === 'eod') {
      dt = new Date(now)
      dt.setHours(23, 59, 0, 0)
    } else if (p === '7d') dt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    else dt = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    // local iso without seconds for datetime-local
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setExpectedReturn(local)
  }

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!borrowerName.trim()) {
      setError('Please enter your full name')
      setIsLoading(false)
      return
    }
    if (!department) {
      setError('Please select your department')
      setIsLoading(false)
      return
    }
    if (!expectedReturn) {
      setError('Please choose an expected return time')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, borrowerName, department, expectedReturn }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Failed to borrow equipment. Please try again.')
        setIsLoading(false)
        return
      }

      // On success, refresh so the page shows BORROWED state
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error.'
      setError(msg)
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#12163b] border border-white/10 rounded-[2rem] p-8 mt-4 shadow-2xl max-w-2xl mx-auto">
      <h3 className="text-2xl font-medium text-white mb-6 text-center">Borrow this Asset{itemName ? ` — ${itemName}` : ''}</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
        )}

        <input
          value={borrowerName}
          onChange={(e) => setBorrowerName(e.target.value)}
          placeholder="Your full name"
          className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none"
        />

        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-4 text-white">
          <option value="" disabled>Select your department</option>
          <option value="BSIT">BS Information Technology</option>
          <option value="BSCS">BS Computer Science</option>
          <option value="BSCHEM">BS Chemistry</option>
          <option value="BSA">BS Agriculture</option>
          <option value="FACULTY">Faculty / Staff</option>
        </select>

        <div>
          <p className="text-gray-400 text-sm mb-2">Choose return time</p>
          <div className="flex gap-3 flex-wrap">
            <button type="button" onClick={() => applyPreset('2h')} className={`px-6 py-3 rounded-full ${preset === '2h' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-300'}`}>2 hours</button>
            <button type="button" onClick={() => applyPreset('4h')} className={`px-6 py-3 rounded-full ${preset === '4h' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-300'}`}>4 hours</button>
            <button type="button" onClick={() => applyPreset('eod')} className={`px-6 py-3 rounded-full ${preset === 'eod' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-300'}`}>End of day</button>
            <button type="button" onClick={() => applyPreset('7d')} className={`px-6 py-3 rounded-full ${preset === '7d' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-300'}`}>7 days</button>
            <button type="button" onClick={() => setPreset(null)} className={`px-6 py-3 rounded-full ${preset === null ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-300'}`}>Custom</button>
          </div>

          <div className="mt-4">
            <input
              type="datetime-local"
              value={expectedReturn ?? ''}
              onChange={(e) => { setExpectedReturn(e.target.value); setPreset(null) }}
              className="w-full bg-[#0a0d27]/50 border border-white/10 rounded-xl px-5 py-3 text-white"
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full mt-2 px-8 py-4 bg-white text-[#0a0d27] text-[15px] font-medium rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors">
          {isLoading ? 'Processing...' : 'Confirm Borrow'}
        </button>
      </form>
    </div>
  )
}
