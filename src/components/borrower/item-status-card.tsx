'use client'

export function ItemStatusCard({
  borrowerName,
  department,
  expectedReturn
}: {
  borrowerName: string,
  department: string,
  expectedReturn: string
}) {

  const returnDate = new Date(expectedReturn).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <div className="bg-[#12163b] border border-blue-500/20 rounded-[2rem] p-8 mt-4 shadow-[0_8px_32px_rgba(96,165,250,0.1)] relative overflow-hidden">
      {/* Subtle blue glow in the background */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        <div>
          <p className="text-gray-400 text-xs font-medium tracking-wide uppercase mb-1">Currently Borrowed By</p>
          <p className="text-white text-xl font-medium tracking-tight">
            {borrowerName} <span className="text-gray-400 font-light text-base ml-1">({department})</span>
          </p>
        </div>

        <div>
          <p className="text-gray-400 text-xs font-medium tracking-wide uppercase mb-1">Expected Return</p>
          <div className="inline-flex items-center gap-2 bg-[#0a0d27]/50 border border-white/5 px-4 py-2 rounded-xl">
             <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-medium text-[15px]">{returnDate}</span>
          </div>
        </div>
      </div>
    </div>
  )
}