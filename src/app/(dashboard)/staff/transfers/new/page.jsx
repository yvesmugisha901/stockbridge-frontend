"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function NewTransferPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    sourceBranchId: "", destinationBranchId: "",
    itemId: "", quantity: "", justification: "",
  })

  async function handleSubmit(e) {
    e.preventDefault()
    toast.success("Transfer request submitted")
    router.push("/staff/transfers")
  }

  const field = (label, key, type = "text", extra = {}) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} {...extra} required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  )

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">New Transfer Request</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {field("Source Branch", "sourceBranchId")}
          {field("Destination Branch", "destinationBranchId")}
          {field("Item", "itemId")}
          {field("Quantity", "quantity", "number", { min: 1 })}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Justification</label>
            <textarea required rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.justification}
              onChange={e => setForm({ ...form, justification: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit"
              className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 transition">
              Submit Request
            </button>
            <button type="button" onClick={() => router.back()}
              className="text-sm px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}