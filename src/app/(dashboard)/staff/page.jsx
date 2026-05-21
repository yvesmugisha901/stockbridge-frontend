"use client"
import { useAuthContext } from "@/lib/context/AuthContext"

export default function StaffDashboard() {
  const { user } = useAuthContext()
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Welcome, {user?.name || "Staff"}</h1>
      <p className="text-gray-500 text-sm mb-6">Here is your branch stock overview.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Low Stock Alerts</p>
          <p className="text-2xl font-bold text-red-500 mt-1">—</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">My Pending Transfers</p>
          <p className="text-2xl font-bold text-yellow-500 mt-1">—</p>
        </div>
      </div>
    </div>
  )
}