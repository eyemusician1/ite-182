'use client'

import { useState } from 'react'
import { ItemActions } from '@/components/dashboard/item-actions'

interface Item {
  id: string
  name: string
  category: string
  status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE'
  quantity?: number
  created_at?: string
  updated_at?: string
}

interface Group {
  key: string
  name: string
  category: string
  total: number
  available: number
  borrowed: number
  maintenance: number
  items: Item[]
}

export function EquipmentList({ items, onMutate }: { items: Item[]; onMutate?: () => void }) {
  const groupedItems = items.reduce<Record<string, Group>>((acc, item) => {
    const key = `${item.name}-${item.category}`
    if (!acc[key]) {
      acc[key] = { key, name: item.name, category: item.category, total: 0, available: 0, borrowed: 0, maintenance: 0, items: [] }
    }
    const qty = Number(item.quantity ?? 1)
    acc[key].total += qty
    if (item.status === 'AVAILABLE') acc[key].available += qty
    if (item.status === 'BORROWED') acc[key].borrowed += qty
    if (item.status === 'MAINTENANCE') acc[key].maintenance += qty
    acc[key].items.push(item)
    return acc
  }, {})

  const groups = Object.values(groupedItems)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const toggleGroup = (key: string) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }))

  if (!items || items.length === 0) {
    return (
      <table className="w-full text-left border-collapse">
        <tbody className="text-gray-300">
          <tr><td colSpan={5} className="p-16 text-center text-gray-500 font-light text-xl">No equipment found in the database.</td></tr>
        </tbody>
      </table>
    )
  }

  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-white/10 text-gray-400 text-[11px] tracking-widest uppercase font-medium bg-white/[0.02]">
          <th className="px-10 py-6 font-normal">Asset Group</th>
          <th className="px-6 py-6 font-normal">Category</th>
          <th className="px-6 py-6 font-normal">Stock Level</th>
          <th className="px-6 py-6 font-normal">Status Overview</th>
          <th className="px-10 py-6 font-normal text-right">Actions</th>
        </tr>
      </thead>

      {groups.map((group) => {
        const isExpanded = expandedGroups[group.key]
        return (
          <tbody key={group.key} className="border-b border-white/10 transition-colors">
            <tr onClick={() => toggleGroup(group.key)} className="group cursor-pointer hover:bg-white/[0.04] transition-colors">
              <td className="px-10 py-6 text-white font-medium text-[15px] flex items-center gap-3">
                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-white' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {group.name}
              </td>
              <td className="px-6 py-6 font-light text-gray-400 text-[15px]">{group.category}</td>
              <td className="px-6 py-6">
                <span className="text-[15px] font-medium text-white">{group.available}</span>
                <span className="text-gray-500 text-sm ml-1">/ {group.total} Total</span>
              </td>
              <td className="px-6 py-6">
                {group.available === group.total ? (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase border bg-white/5 border-white/10 text-gray-300">All Available</span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium tracking-widest uppercase border bg-indigo-500/10 border-indigo-500/20 text-indigo-300">
                    {group.borrowed > 0 && (
                      <span className="mr-2 relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500" />
                      </span>
                    )}
                    {group.borrowed} Borrowed
                  </span>
                )}
              </td>
              <td className="px-10 py-6 text-right text-sm text-indigo-400/70 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                {isExpanded ? 'Collapse' : 'Expand Details'}
              </td>
            </tr>

            {isExpanded && group.items.map((item) => (
              <tr key={item.id} className="bg-black/20 border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-10 py-5 pl-[4.5rem] flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                  <span className="text-white font-medium">{item.name}</span>
                </td>
                <td className="px-6 py-5 text-gray-500 text-sm font-light">{item.category}</td>
                <td className="px-6 py-5"><span className="text-[15px] font-medium text-white">{item.quantity ?? 1}</span></td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase border ${
                    item.status === 'AVAILABLE' ? 'bg-white/5 border-white/10 text-gray-400'
                    : item.status === 'MAINTENANCE' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                  }`}>{item.status}</span>
                </td>
                <td className="px-10 py-5 text-right">
                  <ItemActions item={item} onMutate={onMutate} />
                </td>
              </tr>
            ))}
          </tbody>
        )
      })}
    </table>
  )
}