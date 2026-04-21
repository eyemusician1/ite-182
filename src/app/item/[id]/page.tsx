import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { BorrowForm } from '@/components/borrower/borrow-form'
import { ReturnButton } from '@/components/borrower/return-button'
import { ItemStatusCard } from '@/components/borrower/item-status-card'

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 1. Fetch the item bypassing RLS (since borrowers aren't logged in)
  const supabaseAdmin = createSupabaseAdminClient()
  const { data: item, error: itemError } = await supabaseAdmin
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (itemError || !item) {
    notFound()
  }

  // 2. If it's borrowed, fetch the active log so we know WHO has it
  let activeLog = null
  if (item.status === 'BORROWED') {
    const { data: log } = await supabaseAdmin
      .from('borrow_logs')
      .select('*')
      .eq('item_id', id)
      .is('returned_at', null)
      .single()

    activeLog = log
  }

  return (
    <div
      className="min-h-screen bg-[#0a0d27] text-white flex flex-col items-center justify-center p-6 selection:bg-white/20"
      style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
    >
      <div className="w-full max-w-lg bg-white/5 border border-white/10 rounded-[2rem] p-10 flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">

        {/* Header Section */}
        <div className="flex flex-col gap-2 border-b border-white/10 pb-8">
          <span className="text-gray-500 font-medium tracking-widest uppercase text-sm">{item.category}</span>
          <h1 className="text-4xl font-medium tracking-tight text-white">{item.name}</h1>
          <div className="mt-4">
             <span className={`px-4 py-1.5 rounded-full text-sm font-medium tracking-wide uppercase ${
                item.status === 'AVAILABLE' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                item.status === 'MAINTENANCE' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                'bg-blue-400/10 text-blue-400 border border-blue-400/20'
              }`}>
                {item.status}
              </span>
          </div>
        </div>

        {/* Dynamic Action Section */}
        <div className="flex flex-col gap-4">
          {item.status === 'AVAILABLE' && (
            <BorrowForm itemId={item.id} />
          )}

          {item.status === 'BORROWED' && activeLog && (
            <>
              <ItemStatusCard
                borrowerName={activeLog.borrower_name}
                department={activeLog.department}
                expectedReturn={activeLog.expected_return}
              />
              <div className="mt-4">
                <ReturnButton itemId={item.id} logId={activeLog.id} itemName={item.name} />
              </div>
            </>
          )}

          {item.status === 'MAINTENANCE' && (
            <div className="p-6 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-center">
              <p className="text-amber-400 font-medium">This equipment is currently down for maintenance.</p>
              <p className="text-amber-400/70 text-sm mt-2">Please check back later or contact the lab admin.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}