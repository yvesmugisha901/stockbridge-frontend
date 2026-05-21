"use client"
import Link from "next/link"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/utils/constants"

export default function StaffTransfersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">My Transfer Requests</h1>
        <Link href="/staff/transfers/new"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + New Request
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["ID","Item","From","To","Qty","Status","Date"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="text-center py-10 text-gray-400">No transfers yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}