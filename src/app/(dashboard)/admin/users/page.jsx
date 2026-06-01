"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader     from "@/components/ui/PageHeader"
import UsersTable     from "@/components/users/UsersTable"
import UserFormModal  from "@/components/users/UserFormModal"
import { getToken }   from "@/lib/auth/tokens"
import toast          from "react-hot-toast"

const API = process.env.NEXT_PUBLIC_API_URL

export default function UsersPage() {
  const [users,      setUsers]      = useState([])
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [modalOpen,  setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [branches,   setBranches]   = useState([])

  // ─── fetch users ─────────────────────────────────────────────────────────────
  const loadUsers = useCallback(async (pageNum = 0) => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(
        `${API}/users?page=${pageNum}&size=20&sort=id,desc`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const j        = await res.json()
      const pageData = j.data
      setUsers(pageData.content ?? [])
      setTotalPages(pageData.totalPages ?? 1)
      setPage(pageData.number ?? 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── fetch branches ───────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await fetch(`${API}/branches`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!res.ok) return
        const j = await res.json()
        setBranches(j.data ?? [])
      } catch { /* silent */ }
    }
    loadBranches()
  }, [])

  useEffect(() => { loadUsers(0) }, [loadUsers])

  // ─── modal helpers ────────────────────────────────────────────────────────────
  function openCreate() { setEditing(null); setModal(true) }
  function openEdit(u)  { setEditing(u);    setModal(true) }

  // ─── save (create or update) ──────────────────────────────────────────────────
  async function handleSave(formData) {
    const isEdit = Boolean(editing)
    const url    = isEdit ? `${API}/users/${editing.id}` : `${API}/users`
    const method = isEdit ? "PUT" : "POST"

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${getToken()}`,
      },
      body: JSON.stringify(formData),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.message ?? `HTTP ${res.status}`)
    }
    setModal(false)
    loadUsers(page)
  }

  // ─── delete user ──────────────────────────────────────────────────────────────
  async function handleDelete(userId) {
    const res = await fetch(`${API}/users/${userId}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.message ?? `HTTP ${res.status}`)
    }
    setModal(false)
    loadUsers(page)
  }

  // ─── toggle active / deactivate ───────────────────────────────────────────────
  // ✅ renamed from handleToggleActive → now matches UsersTable's onDeactivate prop
  async function handleDeactivate(user) {
    const path = user.active ? "deactivate" : "activate"
    const res  = await fetch(`${API}/users/${user.id}/${path}`, {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!res.ok) {
      toast.error(`Failed to ${path} user`)
      return
    }
    toast.success(`User ${path}d`)
    loadUsers(page)
  }

  const active   = users.filter((u) => u.active).length
  const inactive = users.length - active

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="User Management"
        subtitle={`${active} active · ${inactive} inactive`}
        action={{ label: "New User", onClick: openCreate }}
      />

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Total",    value: users.length, bg: "#f7f8f4", color: "#1a1f0e" },
          { label: "Active",   value: active,        bg: "#f0f7ed", color: "#3d7a2b" },
          { label: "Inactive", value: inactive,       bg: "#fef2f2", color: "#dc2626" },
        ].map((p) => (
          <div key={p.label} style={{
            background: p.bg, padding: "8px 16px",
            border: "1px solid #dde0d4",
            fontFamily: "'DM Mono', monospace", fontSize: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: "#6b7260", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {p.label}
            </span>
            <span style={{ color: p.color, fontWeight: 600 }}>{p.value}</span>
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          color: "#dc2626", padding: "10px 16px",
          fontFamily: "'DM Mono', monospace", fontSize: 12,
        }}>
          {error}
        </div>
      )}

      <UsersTable
        users={users}
        loading={loading}
        onEdit={openEdit}
        onDeactivate={handleDeactivate} 
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            disabled={page === 0}
            onClick={() => loadUsers(page - 1)}
            style={paginationBtn(page === 0)}
          >
            ← Prev
          </button>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: "#6b7260", alignSelf: "center",
          }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => loadUsers(page + 1)}
            style={paginationBtn(page >= totalPages - 1)}
          >
            Next →
          </button>
        </div>
      )}

      <UserFormModal
        open={modalOpen}
        user={editing}
        branches={branches}
        onClose={() => setModal(false)}
        onSave={handleSave}
        onDelete={handleDelete}  
      />
    </div>
  )
}

function paginationBtn(disabled) {
  return {
    background:    disabled ? "#f7f8f4" : "#fff",
    color:         disabled ? "#b0b5a0" : "#1a1f0e",
    border:        "1px solid #dde0d4",
    padding:       "6px 14px",
    cursor:        disabled ? "default" : "pointer",
    fontFamily:    "'DM Mono', monospace",
    fontSize:      11,
    letterSpacing: "0.06em",
  }
}