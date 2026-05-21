"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
export default function ManagerApprovalDetailPage({ params }) {
  const router = useRouter()
  const [comment, setComment] = useState("")
  const act = (action) => {
    if (action === "reject" && !comment.trim()) return toast.error("Comment required on rejection")
    toast.success(`Transfer ${action}d`)
    router.push("/manager/approvals")
  }
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Review Transfer #{params.id}</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <p className="text-sm text-gray-500">Transfer details will load here.</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Required if rejecting..." />
        </div>
        <div className="flex gap-3">
          <button onClick={() => act("approve")} className="bg-green-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-green-700 transition">Approve</button>
          <button onClick={() => act("reject")} className="bg-red-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-red-700 transition">Reject</button>
          <button onClick={() => router.back()} className="text-sm px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition">Back</button>
        </div>
      </div>
    </div>
  )
}