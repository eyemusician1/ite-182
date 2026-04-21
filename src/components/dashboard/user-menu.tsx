"use client"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface UserMenuProps {
  initials: string
  fullName?: string
  email: string
  avatarUrl?: string
}

export function UserMenu({ initials, fullName, email, avatarUrl }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative" ref={menuRef} style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
      {/* Trigger Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 shadow-lg"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="User Avatar"
            width={40}
            height={40}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {/* FIXED: Frosted Glass Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[340px] bg-[#0a0d27]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 flex flex-col gap-3">

            {/* User Info Header */}
            <div className="flex items-center gap-4 px-2 pt-2 pb-2">
              <div className="flex items-center justify-center w-11 h-11 rounded-full bg-indigo-500 text-white font-medium text-lg shrink-0">
                {initials}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-white text-[15px] font-medium truncate">{fullName || 'Lab Admin'}</span>
                <span className="text-gray-400 text-xs truncate">{email}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-white/10 w-full my-1" />

            {/* FIXED: Inner Card using white overlay */}
            <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-gray-300 text-sm font-medium px-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin Privileges Active
              </div>
              <button
                onClick={() => {
                  router.push('/dashboard/items')
                  setIsOpen(false)
                }}
                className="w-full py-3 bg-white text-[#0a0d27] hover:bg-gray-200 rounded-full text-sm font-medium transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                Manage Equipment
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={() => {
                  router.push('/dashboard/history')
                  setIsOpen(false)
                }}
                className="w-full flex items-center justify-center py-3 bg-white/5 hover:bg-white/10 border border-transparent rounded-full text-white text-sm font-medium transition-colors"
              >
                View Activity Logs
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center py-3 bg-transparent border border-white/10 hover:bg-white/5 rounded-full text-white text-sm font-medium transition-colors"
              >
                Sign out
              </button>
            </div>

            {/* Flow's Tiny Footer Links */}
            <div className="flex items-center justify-center gap-3 pt-2 pb-1 text-[11px] text-gray-500">
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Privacy</span>
              <span>•</span>
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-gray-300 cursor-pointer transition-colors">Licenses</span>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}