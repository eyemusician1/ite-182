import { NextRequest, NextResponse } from 'next/server'

// POST /api/return
// Body: { itemId, logId }
// 1. Set BorrowLog.returnedAt = now()
// 2. Update Item.status = AVAILABLE
export async function POST(_req: NextRequest) {
  return NextResponse.json({ message: 'TODO' }, { status: 501 })
}