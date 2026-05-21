"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
export default function NewItemPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", code: "", category: "", unit: "" })
  const f = (label, key) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
    </div>
  )
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Add New Item</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={e => { e.preventDefault(); toast.success("Item created"); router.push("/ho-admin/inventory") }} className="space-y-4">
          {f("Item Name", "name")}{f("Item Code", "code")}{f("Category", "category")}{f("Unit of Measure", "unit")}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Save Item</button>
            <button type="button" onClick={() => router.back()} className="text-sm px-5 py-2 rounded-lg border border-gray-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}