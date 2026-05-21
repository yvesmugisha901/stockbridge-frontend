"use client"
export default function AccountantTransfersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Approved Transfers</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{["ID","Item","From","To","Qty","Status","Cost Recorded","Action"].map(h=>(
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody><tr><td colSpan={8} className="text-center py-10 text-gray-400">No transfers</td></tr></tbody>
        </table>
      </div>
    </div>
  )
}