"use client"
export default function HOAdminDashboard() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Head Office Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">System-wide inventory and final approvals.</p>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {["Final Approvals Pending","Total Branches","Low Stock Items","Items in Transit"].map(label => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">—</p>
          </div>
        ))}
      </div>
    </div>
  )
}