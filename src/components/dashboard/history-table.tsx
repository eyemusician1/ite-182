'use client'

// Dummy data for visualization
const MOCK_LOGS = [
  { id: 'L01', itemName: 'Digital Oscilloscope', borrower: 'John Doe', dept: 'CICS', borrowedAt: 'Oct 20, 2026', expectedReturn: 'Oct 22, 2026', returnedAt: 'Oct 22, 2026', status: 'RETURNED' },
  { id: 'L02', itemName: 'MacBook Pro M3 Max', borrower: 'Jane Smith', dept: 'Engineering', borrowedAt: 'Oct 23, 2026', expectedReturn: 'Oct 30, 2026', returnedAt: '-', status: 'ACTIVE' },
  { id: 'L03', itemName: 'Raspberry Pi 5 Kit', borrower: 'Alan Turing', dept: 'CICS', borrowedAt: 'Oct 10, 2026', expectedReturn: 'Oct 15, 2026', returnedAt: '-', status: 'OVERDUE' },
  { id: 'L04', itemName: 'Fluke 87V Multimeter', borrower: 'Ada Lovelace', dept: 'Physics', borrowedAt: 'Oct 18, 2026', expectedReturn: 'Oct 19, 2026', returnedAt: 'Oct 19, 2026', status: 'RETURNED' },
]

export function HistoryTable() {
  return (
    <div className="flex flex-col gap-6">

      {/* Table Filters & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center px-2">
        <div className="flex gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filter by item or borrower..."
            className="w-full sm:w-80 bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all text-white placeholder:text-gray-500 text-sm"
          />
          <select className="hidden sm:block bg-white/5 border border-white/10 rounded-full px-6 py-3 text-gray-300 focus:outline-none focus:border-white/30 appearance-none min-w-[160px] cursor-pointer">
            <option value="ALL" className="bg-[#0a0d27]">All Departments</option>
            <option value="CICS" className="bg-[#0a0d27]">CICS</option>
            <option value="ENG" className="bg-[#0a0d27]">Engineering</option>
          </select>
        </div>

        <button className="text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-full transition-all w-full sm:w-auto">
          Export Data
        </button>
      </div>

      {/* The Data Table */}
      <div className="w-full overflow-x-auto rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10 text-gray-500 text-xs tracking-widest uppercase font-medium bg-white/[0.02]">
              <th className="px-8 py-6 font-normal">Asset</th>
              <th className="px-6 py-6 font-normal">Borrower</th>
              <th className="px-6 py-6 font-normal">Borrowed</th>
              <th className="px-6 py-6 font-normal">Due Date</th>
              <th className="px-6 py-6 font-normal">Returned</th>
              <th className="px-8 py-6 font-normal text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {MOCK_LOGS.map((log) => (
              <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.04] transition-colors">

                <td className="px-8 py-6">
                  <div className="text-white font-medium text-base">{log.itemName}</div>
                  <div className="text-gray-500 text-sm mt-1">ID: {log.id}</div>
                </td>

                <td className="px-6 py-6">
                  <div className="text-white font-medium">{log.borrower}</div>
                  <div className="text-gray-500 text-sm mt-1">{log.dept}</div>
                </td>

                <td className="px-6 py-6 font-light text-gray-400">{log.borrowedAt}</td>
                <td className="px-6 py-6 font-light text-gray-400">{log.expectedReturn}</td>
                <td className="px-6 py-6 font-light text-gray-400">{log.returnedAt}</td>

                <td className="px-8 py-6 text-right">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase border ${
                    log.status === 'RETURNED' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                    log.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(248,113,113,0.15)]'
                  }`}>
                    {log.status}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}