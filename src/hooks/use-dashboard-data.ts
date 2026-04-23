import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface Item {
  id: string
  name: string
  category: string
  status: 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE'
  quantity?: number
  created_at?: string
  updated_at?: string
}

export function useItems() {
  const { data, error, isLoading, mutate } = useSWR<Item[]>('/api/items', fetcher)
  return {
    items: data ?? [],
    isLoading,
    isError: !!error,
    mutate, // expose raw mutate so components can do optimistic updates directly
  }
}

export function useDashboardStats() {
  const { data: items, isLoading: itemsLoading } = useSWR<Item[]>('/api/items', fetcher)
  const { data: borrows, isLoading: borrowsLoading } = useSWR('/api/borrow', fetcher)

  const now = new Date().toISOString()

  const totalAssets = (items ?? []).reduce((s, it) => s + (it.quantity || 0), 0)
  const availableItems = (items ?? [])
    .filter(i => i.status === 'AVAILABLE')
    .reduce((s, it) => s + (it.quantity || 0), 0)
  const activeBorrows = (borrows ?? []).filter((b: { returned_at: string | null }) => !b.returned_at).length
  const overdueBorrows = (borrows ?? []).filter((b: { returned_at: string | null; expected_return: string }) =>
    !b.returned_at && b.expected_return < now
  ).length

  return { totalAssets, availableItems, activeBorrows, overdueBorrows, isLoading: itemsLoading || borrowsLoading }
}

export function useBorrowLogs() {
  const { data, error, isLoading, mutate } = useSWR('/api/borrow', fetcher)
  return { logs: data ?? [], isLoading, isError: !!error, mutate }
}