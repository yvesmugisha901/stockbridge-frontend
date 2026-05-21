"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { ROLES } from "@/lib/utils/constants"
export default function NewUserPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "", branchId: "" })
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Create User</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={e => { e.preventDefault(); toast.success("User created"); router.push("/admin/users") }} className="space-y-4">
          {[["Full Name","name"],["Email","email"],["Password","password"]].map(([l,k])=>(
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.role} onChange={e => setForm({...form,role:e.target.value})}>
              <option value="">Select role</option>
              {Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.branchId} onChange={e => setForm({...form,branchId:e.target.value})} placeholder="Branch ID" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Create User</button>
            <button type="button" onClick={() => router.back()} className="text-sm px-5 py-2 rounded-lg border border-gray-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}