// Enums
export type ItemStatus = 'AVAILABLE' | 'BORROWED'

// Domain models
export interface Item {
  id: string
  name: string
  category: string
  status: ItemStatus
  createdAt: string
  updatedAt: string
}

export interface BorrowLog {
  id: string
  itemId: string
  borrowerName: string
  department: string
  borrowedAt: string
  expectedReturn: string
  returnedAt: string | null
  returnedByStaff: boolean
  item?: Item
}

// API shapes
export interface BorrowRequest {
  itemId: string
  borrowerName: string
  department: string
  expectedReturn: string // YYYY-MM-DD
}

export interface ReturnRequest {
  itemId: string
  logId: string
}

export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

// Dashboard view types
export interface ItemWithLatestBorrow extends Item {
  latestBorrow?: BorrowLog | null
  isOverdue?: boolean
}