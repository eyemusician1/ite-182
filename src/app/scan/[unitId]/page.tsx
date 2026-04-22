import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { BorrowForm } from '@/components/borrower/borrow-form'
import { ItemStatusCard } from '@/components/borrower/item-status-card'
import { ReturnButton } from '@/components/borrower/return-button'

export const revalidate = 0 // always fresh — borrowers need real-time status

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

const ErrorCard = ({ title, message }: { title: string; message: string }) => (
  <div className="min-h-screen bg-[#0a0d27] flex items-center justify-center p-6" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
    <div className="w-full max-w-xl rounded-[2.5rem] bg-[#0e1236] border border-white/10 p-10 shadow-2xl text-center">
      <h2 className="text-2xl font-medium text-white tracking-tight">{title}</h2>
      <p className="text-gray-400 mt-2 font-light">{message}</p>
    </div>
  </div>
)

export default async function ScanPage({ params }: { params: { unitId: string } }) {
  const unitId = params?.unitId

  if (!unitId) {
    return <ErrorCard title="Invalid QR Code" message="No unit identifier provided." />
  }

  // Use admin client — borrowers aren't authenticated, no need for cookie-based client
  const supabase = createSupabaseAdminClient()

  let item: Item | null = null

  // Try item_units first, then fall back to items directly — all in parallel where possible
  const { data: unitRow } = await supabase
    .from('item_units')
    .select('item_id')
    .eq('id', unitId)
    .maybeSingle()

  const itemId = unitRow?.item_id ?? unitId

  // Single query with joined borrow log — no sequential calls
  const { data: itemData } = await supabase
    .from('items')
    .select(`
      id, name, category, status, quantity,
      borrow_logs (
        id, borrower_name, department, expected_return, returned_at
      )
    `)
    .eq('id', itemId)
    .maybeSingle()

  item = itemData ? {
    id: itemData.id,
    name: itemData.name,
    category: itemData.category,
    status: itemData.status,
    quantity: itemData.quantity,
  } : null

  if (!item) {
    return <ErrorCard title="Asset Not Found" message="This equipment unit does not exist or has been removed from the system." />
  }

  // Get active log from joined data — no extra DB call
  const activeLog: BorrowLog | null = item.status === 'BORROWED'
    ? ((itemData?.borrow_logs as BorrowLog[]) ?? []).find(
        (log: BorrowLog & { returned_at?: string | null }) => log.returned_at === null
      ) ?? null
    : null

  return (
    <div className="min-h-screen bg-[#0a0d27] flex items-center justify-center p-6" style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}>
      <div className="w-full max-w-xl rounded-[2.5rem] bg-[#0e1236] border border-white/10 p-10 shadow-[0_24px_50px_rgba(0,0,0,0.5)]">

        <h1 className="text-3xl font-medium text-white tracking-tight">{item.name}</h1>
        <div className="flex flex-col gap-1 mt-4">
          <p className="text-gray-400 text-[15px] font-light">
            Category: <span className="text-white font-medium ml-1">{item.category}</span>
          </p>
          <p className="text-gray-400 text-[15px] font-light">
            Unit ID: <span className="text-white font-mono ml-1">{item.id.split('-')[0]}...</span>
          </p>
        </div>

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