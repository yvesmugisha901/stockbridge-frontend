"use client"
export default function TransferDetailPage({ params }) {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Transfer #{params.id}</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-500">
        Transfer detail will load here. Actions: Mark In Transit / Confirm Receipt.
      </div>
    </div>
  )
}