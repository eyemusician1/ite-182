import { createSupabaseServerClient } from '@/lib/supabase-server'
import { BorrowForm } from '@/components/borrower/borrow-form'
import { ItemStatusCard } from '@/components/borrower/item-status-card'
import { ReturnButton } from '@/components/borrower/return-button'

type Item = {
  id: string
  name: string
  category: string
  status: string
  quantity: number
}

type BorrowLog = {
  id: string
  borrower_name?: string | null
  department?: string | null
  expected_return?: string | null
}

export default async function ScanPage({ params }: { params: { unitId: string } }) {
  const supabase = await createSupabaseServerClient()
  const unitId = params?.unitId

  if (!unitId) {
    return (
      <div className="min-h-screen bg-[#0a0d27] flex items-center justify-center p-6" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
        <div className="w-full max-w-xl rounded-[2.5rem] bg-[#0e1236] border border-white/10 p-10 shadow-2xl text-center">
          <h2 className="text-2xl font-medium text-white tracking-tight">Invalid QR Code</h2>
          <p className="text-gray-400 mt-2 font-light">No unit identifier provided.</p>
        </div>
      </div>
    )
  }

  // Try to resolve the item from `item_units` first (preferred when QR encodes unit id).
  // Fallback to querying `items` directly if no unit row exists for the provided id.
  let item: Item | null = null
  let error: unknown = null

  try {
    const { data: unitRow, error: unitErr } = await supabase
      .from('item_units')
      .select('item_id, items(id, name, category, status, quantity)')
      .eq('id', unitId)
      .maybeSingle()

    if (unitErr) {
      console.warn('Could not fetch item_units for scan:', unitErr.message)
    }

    if (unitRow && unitRow.items) {
      // Supabase types joined relations as arrays; normalize to single object
      const joined = unitRow.items
      item = (Array.isArray(joined) ? joined[0] : joined) as Item ?? null
    } else if (unitRow && unitRow.item_id) {
      const { data: itm, error: itErr } = await supabase
        .from('items')
        .select('id, name, category, status, quantity')
        .eq('id', unitRow.item_id)
        .maybeSingle()
      if (itErr) console.warn('Could not fetch item by item_id fallback:', itErr.message)
      item = (itm as Item) ?? null
    } else {
      const { data: itm, error: itErr } = await supabase
        .from('items')
        .select('id, name, category, status, quantity')
        .eq('id', unitId)
        .maybeSingle()
      if (itErr) console.warn('Could not fetch item by unitId fallback:', itErr.message)
      item = (itm as Item) ?? null
    }
  } catch (err) {
    error = err
    console.error('Scan page fetch error:', err)
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[#0a0d27] flex items-center justify-center p-6" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
        <div className="w-full max-w-xl rounded-[2.5rem] bg-[#0e1236] border border-white/10 p-10 shadow-2xl text-center">
          <h2 className="text-2xl font-medium text-white tracking-tight">Asset Not Found</h2>
          <p className="text-gray-400 mt-2 font-light">This equipment unit does not exist or has been removed from the system.</p>
        </div>
      </div>
    )
  }

  // If the item is borrowed, fetch the active borrow log to display the student's name
  let activeLog: BorrowLog | null = null
  if (item.status === 'BORROWED') {
    try {
      const { data: log, error: logErr } = await supabase
        .from('borrow_logs')
        .select('*')
        .eq('item_id', item.id)
        .is('returned_at', null)
        .maybeSingle()

      if (logErr) console.warn('Could not fetch active borrow log:', logErr.message)
      activeLog = (log as BorrowLog) ?? null
    } catch (err) {
      if (err instanceof Error) {
        console.warn('Error fetching borrow log:', err.message)
      }
      activeLog = null
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0d27] flex items-center justify-center p-6" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
      <div className="w-full max-w-xl rounded-[2.5rem] bg-[#0e1236] border border-white/10 p-10 shadow-[0_24px_50px_rgba(0,0,0,0.5)]">

        {/* Header Info */}
        <h1 className="text-3xl font-medium text-white tracking-tight">{item.name}</h1>
        <div className="flex flex-col gap-1 mt-4">
          <p className="text-gray-400 text-[15px] font-light">
            Category: <span className="text-white font-medium ml-1">{item.category}</span>
          </p>
          <p className="text-gray-400 text-[15px] font-light">
            Unit ID: <span className="text-white font-mono ml-1">{item.id.split('-')[0]}...</span>
          </p>
        </div>

        {/* Dynamic State Rendering */}
        <div className="mt-8">

          {item.status === 'AVAILABLE' && (
            <BorrowForm itemId={item.id} itemName={item.name} />
          )}

          {item.status === 'BORROWED' && activeLog && (
            <div className="flex flex-col gap-4">
              <ItemStatusCard
                borrowerName={activeLog.borrower_name ?? ''}
                department={activeLog.department ?? ''}
                expectedReturn={activeLog.expected_return ?? ''}
              />
              <ReturnButton
                itemId={item.id}
                logId={activeLog.id}
                itemName={item.name}
              />
            </div>
          )}

          {item.status === 'MAINTENANCE' && (
             <div className="p-8 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex flex-col items-center justify-center text-center mt-4">
               <span className="text-rose-400 font-medium tracking-widest uppercase text-sm">Under Maintenance</span>
               <p className="text-gray-300 mt-2 text-[15px] font-light">This equipment is currently unavailable for borrowing.</p>
             </div>
          )}

        </div>
      </div>
    </div>
  )
}