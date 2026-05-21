"use client"
import { useAuthContext } from "@/lib/context/AuthContext"
export default function ManagerDashboard() {
  const { user } = useAuthContext()
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Manager Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Welcome, {user?.name}. Review pending approvals below.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending Approvals</p>
          <p className="text-2xl font-bold text-yellow-500 mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Approved This Month</p>
          <p className="text-2xl font-bold text-green-500 mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Low Stock Items</p>
          <p className="text-2xl font-bold text-red-500 mt-1">—</p>
        </div>
      </div>
    </div>
  )
}