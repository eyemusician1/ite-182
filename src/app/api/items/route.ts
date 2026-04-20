import { NextRequest, NextResponse } from 'next/server'

// GET  /api/items -- list all items with current borrow info (staff only)
// POST /api/items -- create a new item (staff only)
export async function GET(_req: NextRequest) {
  return NextResponse.json({ message: 'TODO' }, { status: 501 })
}
export async function POST(_req: NextRequest) {
  return NextResponse.json({ message: 'TODO' }, { status: 501 })
}