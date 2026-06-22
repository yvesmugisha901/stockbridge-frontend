"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader      from "@/components/ui/PageHeader"
import BranchesTable   from "@/components/branches/BranchesTable"
import BranchFormModal from "@/components/branches/BranchFormModal"
import { getToken }    from "@/lib/auth/tokens"
import toast           from "react-hot-toast"

const API = process.env.NEXT_PUBLIC_API_URL

export default function BranchesPage() {
  const [branches,  setBranches] = useState([])
  const [loading,   setLoading]  = useState(true)
  const [error,     setError]    = useState(null)
  const [modalOpen, setModal]    = useState(false)
  const [editing,   setEditing]  = useState(null)

  // ─── fetch ───────────────────────────────────────────────────────────────────
  // GET /api/v1/branches → ApiResponse<List<BranchSummaryResponse>>
  const loadBranches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API}/branches`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const j = await res.json()
      setBranches(j.data ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadBranches() }, [loadBranches])

  // ─── modal helpers ────────────────────────────────────────────────────────────
  function openCreate() { setEditing(null); setModal(true) }
  function openEdit(b)  { setEditing(b);    setModal(true) }

  // ─── save (create or update) ──────────────────────────────────────────────────
  async function handleSave(formData) {
    const isEdit = Boolean(editing)
    const url    = isEdit ? `${API}/branches/${editing.id}` : `${API}/branches`
    const method = isEdit ? "PUT" : "POST"

    const payload = {
      name:        formData.name,
      code:        formData.code,
      location:    formData.location,
      contactInfo: formData.contactInfo ?? formData.contact ?? "",
    }

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.message ?? `HTTP ${res.status}`)
    }
    setModal(false)
    loadBranches()
  }

  // ─── suspend / activate ───────────────────────────────────────────────────────
  async function handleToggleActive(branch) {
    const action = branch.active ? "deactivate" : "activate"
    const label  = branch.active ? "suspended" : "activated"
    try {
      const res = await fetch(`${API}/branches/${branch.id}/${action}`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.message ?? `HTTP ${res.status}`)
      }
      toast.success(`Branch ${label}`)
      loadBranches()
    } catch (err) {
      toast.error(err.message ?? `Failed to ${action} branch`)
    }
  }

  const active   = branches.filter((b) => b.active).length
  const inactive = branches.length - active

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Branch Management"
        subtitle={`${branches.length} branches · ${active} active · ${inactive} inactive`}
        action={{ label: "New Branch", onClick: openCreate }}
      />

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Total",      value: branches.length, bg: "#f7f8f4", color: "#1a1f0e" },
          { label: "Active",     value: active,           bg: "#f0f7ed", color: "#3d7a2b" },
          { label: "Suspended",  value: inactive,         bg: "#fef2f2", color: "#dc2626" },
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

      <BranchesTable
        branches={branches}
        loading={loading}
        onEdit={openEdit}
        onToggleActive={handleToggleActive}
      />

      <BranchFormModal
        open={modalOpen}
        branch={editing}
        onClose={() => setModal(false)}
        onSave={handleSave}
      />
    </div>
  )
}