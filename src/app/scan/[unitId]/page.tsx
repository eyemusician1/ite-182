import { createSupabaseServerClient } from '@/lib/supabase-server'
import BorrowPanel from '@/components/scan/borrow-panel'

export default async function ScanPage({ params }: { params: { unitId: string } }) {
  const supabase = await createSupabaseServerClient()
  const unitId = params?.unitId

  if (!unitId) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-medium text-white">Invalid QR</h2>
        <p className="text-gray-400 mt-2">No unit identifier provided.</p>
      </div>
    )
  }

  // Fetch unit + item info
  const { data: unit, error } = await supabase
    .from('item_units')
    .select('id, status, item_id, items(id, name, category, quantity)')
    .eq('id', unitId)
    .maybeSingle()

  if (error) {
    console.error('Scan page fetch error:', error.message)
  }

  if (!unit) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-medium text-white">Unit not found</h2>
        <p className="text-gray-400 mt-2">This equipment unit does not exist or has been removed.</p>
      </div>
    )
  }

  const item = Array.isArray(unit.items) ? unit.items[0] : unit.items ?? null

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white/[0.02] border border-white/10 p-8">
        <h1 className="text-2xl font-medium text-white">Scan: {item?.name ?? 'Equipment'}</h1>
        <p className="text-gray-400 mt-2">Category: {item?.category ?? '—'}</p>
        <p className="text-gray-400 mt-1">Unit ID: <span className="text-white font-mono">{unit.id}</span></p>
        <div className="mt-6">
          {/* Client-side borrow panel */}
          {/* @ts-expect-error Server -> Client prop typing is narrow here */}
          <BorrowPanel unit={{ id: unit.id, status: unit.status, item: item }} />
        </div>
      </div>
    </div>
  )
}
