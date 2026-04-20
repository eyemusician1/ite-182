'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function AddEquipmentDialog() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Wire up actual database POST here later
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <Dialog>
      <DialogTrigger
        className="px-10 py-4 rounded-full bg-white text-[#0a0d27] hover:bg-gray-200 transition-all font-medium text-lg whitespace-nowrap outline-none"
        style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
      >
        Add Equipment
      </DialogTrigger>

      {/* Increased max-width to xl, increased padding to p-10, added explicit font-family */}
      <DialogContent
        className="bg-[#0a0d27]/95 backdrop-blur-xl border border-white/10 text-white sm:max-w-xl rounded-[2.5rem] p-10 shadow-2xl"
        style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
      >
        <DialogHeader>
          <DialogTitle className="text-4xl font-medium tracking-tight mb-2">New Asset</DialogTitle>
          <p className="text-gray-400 text-lg font-light">Register a new piece of equipment into the laboratory inventory.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 mt-8">
          <div className="space-y-3">
            <label htmlFor="name" className="text-base font-medium text-gray-300">Equipment Name</label>
            <input
              id="name"
              required
              placeholder="e.g. Oscilloscope Model X"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-lg placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="category" className="text-base font-medium text-gray-300">Category</label>
            <input
              id="category"
              required
              placeholder="e.g. Electronics, Glassware"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-lg placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            // Increased padding and font size for a larger button
            className="mt-6 w-full bg-white text-[#0a0d27] hover:bg-gray-200 transition-all duration-300 font-medium text-xl rounded-full px-10 py-4 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Register Equipment'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}