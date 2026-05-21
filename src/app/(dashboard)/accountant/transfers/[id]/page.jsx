"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
export default function RecordCostPage({ params }) {
  const router = useRouter()
  const [form, setForm] = useState({ amount: "", currency: "RWF", costType: "", notes: "" })
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Record Cost — Transfer #{params.id}</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={e => { e.preventDefault(); toast.success("Cost recorded"); router.push("/accountant/transfers") }} className="space-y-4">
          {[["Amount","amount","number"],["Currency","currency"],["Cost Type","costType"]].map(([l,k,t="text"])=>(
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
              <input type={t} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={form.notes} onChange={e => setForm({...form,notes:e.target.value})} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700">Save Cost</button>
            <button type="button" onClick={() => router.back()} className="text-sm px-5 py-2 rounded-lg border border-gray-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}