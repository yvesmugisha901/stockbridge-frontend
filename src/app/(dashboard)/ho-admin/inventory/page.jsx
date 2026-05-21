"use client"
import Link from "next/link"
export default function InventoryPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Item Catalogue</h1>
        <Link href="/ho-admin/inventory/new" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">+ Add Item</Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{["Code","Name","Category","Unit","Status","Actions"].map(h=>(
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody><tr><td colSpan={6} className="text-center py-10 text-gray-400">No items in catalogue</td></tr></tbody>
        </table>
      </div>
    </div>
  )
}