"use client"
export default function EditUserPage({ params }) {
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Edit User #{params.id}</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-500">Edit / deactivate user form loads here.</div>
    </div>
  )
}