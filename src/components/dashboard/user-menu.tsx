'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import Image from 'next/image'

interface UserMenuProps {
  initials: string
  fullName?: string
  email: string
  avatarUrl?: string
}

export function UserMenu({ initials, fullName, email, avatarUrl }: UserMenuProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <DropdownMenu>
      {/* Trigger: The Avatar */}
      <DropdownMenuTrigger
        className="outline-none focus:ring-2 focus:ring-white/20 rounded-full transition-all"
        style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
      >
        <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-sm font-medium select-none overflow-hidden relative hover:bg-white/10">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="User Avatar"
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            initials
          )}
        </div>
      </DropdownMenuTrigger>

      {/* Dropdown Content: Glassmorphism style with explicit font */}
      <DropdownMenuContent
        align="end"
        className="w-64 bg-[#13172e]/95 backdrop-blur-xl border border-white/10 text-white rounded-2xl p-2 shadow-2xl"
        style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-4 py-3">
            <div className="flex flex-col space-y-1">
              <p className="text-base font-medium leading-none text-white">{fullName || 'User'}</p>
              <p className="text-sm leading-none text-gray-400 mt-1">{email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/10 my-1" />

        <DropdownMenuItem className="px-4 py-3 text-sm cursor-pointer rounded-xl hover:bg-white/5 transition-colors">
          Account Settings
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLogout}
          className="px-4 py-3 text-sm cursor-pointer rounded-xl text-red-400 focus:bg-red-500/10 focus:text-red-300 transition-colors mt-1"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}