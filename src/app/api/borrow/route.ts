import { NextRequest, NextResponse } from 'next/server'

// POST /api/borrow
// Body: { itemId, borrowerName, department, expectedReturn }
// 1. Check item is AVAILABLE (atomic transaction)
// 2. Insert BorrowLog
// 3. Update Item.status = BORROWED
export async function POST(_req: NextRequest) {
  return NextResponse.json({ message: 'TODO' }, { status: 501 })
}