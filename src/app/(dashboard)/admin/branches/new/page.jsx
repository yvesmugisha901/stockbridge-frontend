"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
export default function NewBranchPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", code: "", location: "", contact: "" })
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Create Branch</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={e => { e.preventDefault(); toast.success("Branch created"); router.push("/admin/branches") }} className="space-y-4">
          {[["Branch Name","name"],["Branch Code","code"],["Location","location"],["Contact","contact"]].map(([l,k])=>(
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Save Branch</button>
            <button type="button" onClick={() => router.back()} className="text-sm px-5 py-2 rounded-lg border border-gray-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}