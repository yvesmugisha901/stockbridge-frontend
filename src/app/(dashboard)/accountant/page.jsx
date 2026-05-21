"use client"
export default function AccountantDashboard() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Accountant Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Track approved transfers and record costs.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["Approved Transfers","Total Cost This Month","Pending Cost Entry"].map(l => (
          <div key={l} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{l}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">—</p>
          </div>
        ))}
      </div>
    </div>
  )
}