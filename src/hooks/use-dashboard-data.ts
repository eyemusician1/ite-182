import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

// Items list
export function useItems() {
  const { data, error, isLoading, mutate } = useSWR('/api/items', fetcher)
  return {
    items: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}

// Dashboard stats (overview page)
export function useDashboardStats() {
  const { data: items, isLoading: itemsLoading } = useSWR('/api/items', fetcher)
  const { data: borrows, isLoading: borrowsLoading } = useSWR('/api/borrow', fetcher)

  const now = new Date().toISOString()

  const totalAssets = (items ?? []).reduce((s: number, it: { quantity?: number }) => s + (it.quantity || 0), 0)
  const availableItems = (items ?? []).filter((i: { status: string }) => i.status === 'AVAILABLE')
    .reduce((s: number, it: { quantity?: number }) => s + (it.quantity || 0), 0)
  const activeBorrows = (borrows ?? []).filter((b: { returned_at: string | null }) => !b.returned_at).length
  const overdueBorrows = (borrows ?? []).filter((b: { returned_at: string | null; expected_return: string }) =>
    !b.returned_at && b.expected_return < now
  ).length

  return {
    totalAssets,
    availableItems,
    activeBorrows,
    overdueBorrows,
    isLoading: itemsLoading || borrowsLoading,
  }
}

// Borrow logs (history page)
export function useBorrowLogs() {
  const { data, error, isLoading, mutate } = useSWR('/api/borrow', fetcher)
  return {
    logs: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  }
}