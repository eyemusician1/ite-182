'use client'

import { SWRConfig } from 'swr'

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,       // don't refetch when window regains focus
        revalidateOnReconnect: true,    // do refetch on reconnect
        dedupingInterval: 5000,         // dedupe requests within 5s
        keepPreviousData: true,         // show stale data while revalidating — key for instant nav
      }}
    >
      {children}
    </SWRConfig>
  )
}