"use client"
import { useState, useEffect, useCallback } from "react"
import PageHeader     from "@/components/ui/PageHeader"
import UsersTable     from "@/components/users/UsersTable"
import UserFormModal  from "@/components/users/UserFormModal"
import { getToken }   from "@/lib/auth/tokens"
import toast          from "react-hot-toast"

const API = process.env.NEXT_PUBLIC_API_URL

// ─── tiny helpers ─────────────────────────────────────────────────────────────
const mono = { fontFamily: "'DM Mono', monospace" }

function pill(label, value, bg, color) {
  return (
    <div key={label} style={{
      background: bg, padding: "8px 16px",
      border: "1px solid #dde0d4",
      ...mono, fontSize: 12,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ color: "#6b7260", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </span>
      <span style={{ color, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
function TabBar({ active, onChange, pendingCount }) {
  const tabs = [
    { id: "users",   label: "All Users" },
    { id: "pending", label: "Pending Requests", badge: pendingCount },
  ]
  return (
    <div style={{ display: "flex", borderBottom: "1px solid #dde0d4", gap: 0 }}>
      {tabs.map((t) => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              ...mono, fontSize: 12,
              textTransform: "uppercase", letterSpacing: "0.1em",
              padding: "10px 22px",
              background: "none", border: "none",
              borderBottom: isActive ? "2px solid #3d7a2b" : "2px solid transparent",
              color: isActive ? "#3d7a2b" : "#6b7260",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: "-1px",
              transition: "color 0.15s",
            }}
          >
            {t.label}
            {t.badge > 0 && (
              <span style={{
                background: "#dc2626", color: "#fff",
                borderRadius: "99px",
                fontSize: 10, fontWeight: 600,
                padding: "1px 7px",
                letterSpacing: 0,
              }}>
                {t.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Pending request row ──────────────────────────────────────────────────────
function PendingRow({ user, onApprove, onReject, approving, rejecting }) {
  const busy = approving || rejecting
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr auto",
      alignItems: "center",
      gap: 16,
      padding: "16px 20px",
      borderBottom: "1px solid #dde0d4",
      background: "#fff",
      transition: "background 0.15s",
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = "#fafbf8"}
    onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
    >
      {/* Identity */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ ...mono, fontSize: 13, color: "#1a1f0e", fontWeight: 500 }}>
          {user.fullName || "—"}
        </span>
        <span style={{ ...mono, fontSize: 11, color: "#6b7260" }}>{user.email}</span>
      </div>

      {/* Role */}
      <div>
        <span style={{
          ...mono, fontSize: 10,
          textTransform: "uppercase", letterSpacing: "0.1em",
          background: "#f7f8f4", border: "1px solid #dde0d4",
          padding: "3px 9px", color: "#3d7a2b",
        }}>
          {user.role?.replace(/_/g, " ") || "—"}
        </span>
      </div>

      {/* Branch */}
      <div style={{ ...mono, fontSize: 12, color: "#6b7260" }}>
        {user.branchName || user.branchId || "—"}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        {/* Approve */}
        <button
          disabled={busy}
          onClick={() => onApprove(user)}
          style={{
            ...mono, fontSize: 11,
            textTransform: "uppercase", letterSpacing: "0.08em",
            padding: "7px 14px",
            background: approving ? "#5a9e46" : "#3d7a2b",
            color: "#fff", border: "none",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.7 : 1,
            display: "flex", alignItems: "center", gap: 6,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { if (!busy) e.currentTarget.style.background = "#2a5a1e" }}
          onMouseLeave={(e) => { if (!busy) e.currentTarget.style.background = approving ? "#5a9e46" : "#3d7a2b" }}
        >
          {approving ? (
            "Activating…"
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Approve
            </>
          )}
        </button>

        {/* Reject */}
        <button
          disabled={busy}
          onClick={() => onReject(user)}
          style={{
            ...mono, fontSize: 11,
            textTransform: "uppercase", letterSpacing: "0.08em",
            padding: "7px 14px",
            background: "#fff",
            color: rejecting ? "#b91c1c" : "#dc2626",
            border: "1px solid #fecaca",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.7 : 1,
            display: "flex", alignItems: "center", gap: 6,
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { if (!busy) { e.currentTarget.style.background = "#fef2f2" } }}
          onMouseLeave={(e) => { if (!busy) { e.currentTarget.style.background = "#fff" } }}
        >
          {rejecting ? (
            "Rejecting…"
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Reject
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Pending table ────────────────────────────────────────────────────────────
function PendingTable({ requests, loading, onApprove, onReject, actionState }) {
  if (loading) {
    return (
      <div style={{
        border: "1px solid #dde0d4", background: "#fff",
        padding: "48px 0", textAlign: "center",
        ...mono, fontSize: 12, color: "#6b7260",
      }}>
        Loading requests…
      </div>
    )
  }

  if (!requests.length) {
    return (
      <div style={{
        border: "1px solid #dde0d4", background: "#fff",
        padding: "56px 0",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        {/* Empty check icon */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "#f0f7ed", border: "1px solid #b2d9a5",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3d7a2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <span style={{ ...mono, fontSize: 12, color: "#6b7260" }}>
          No pending requests — you&apos;re all caught up.
        </span>
      </div>
    )
  }

  return (
    <div style={{ border: "1px solid #dde0d4" }}>
      {/* Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr auto",
        gap: 16,
        padding: "10px 20px",
        background: "#f7f8f4",
        borderBottom: "1px solid #dde0d4",
      }}>
        {["Name / Email", "Requested Role", "Branch", "Action"].map((h) => (
          <span key={h} style={{
            ...mono, fontSize: 10,
            textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7260",
          }}>
            {h}
          </span>
        ))}
      </div>

      {requests.map((u) => (
        <PendingRow
          key={u.id}
          user={u}
          onApprove={onApprove}
          onReject={onReject}
          approving={actionState[u.id] === "approving"}
          rejecting={actionState[u.id] === "rejecting"}
        />
      ))}
    </div>
  )
}

// ─── Reject reason modal ──────────────────────────────────────────────────────
function RejectModal({ user, onConfirm, onCancel }) {
  const [reason, setReason] = useState("")
  const [busy,   setBusy]   = useState(false)

  async function submit() {
    setBusy(true)
    await onConfirm(user, reason.trim())
    setBusy(false)
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#fff", border: "1px solid #dde0d4",
        width: "100%", maxWidth: 420,
        ...mono,
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid #dde0d4",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: "#1a1f0e" }}>
              Reject request
            </div>
            <div style={{ fontSize: 11, color: "#6b7260", marginTop: 3 }}>
              {user.fullName} &middot; {user.email}
            </div>
          </div>
          <button onClick={onCancel} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#9a9e8f", fontSize: 18, lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{
              fontSize: 10, textTransform: "uppercase",
              letterSpacing: "0.12em", color: "#6b7260",
            }}>
              Reason (optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Duplicate account, incorrect role requested…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                ...mono, fontSize: 12,
                background: "#f7f8f4", border: "1px solid #dde0d4",
                padding: "10px 12px", color: "#1a1f0e", outline: "none",
                resize: "vertical",
              }}
              onFocus={(e)  => { e.target.style.borderColor = "#dc2626" }}
              onBlur={(e)   => { e.target.style.borderColor = "#dde0d4" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={onCancel} style={{
              ...mono, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.08em",
              padding: "8px 18px",
              background: "#fff", border: "1px solid #dde0d4",
              color: "#6b7260", cursor: "pointer",
            }}>
              Cancel
            </button>
            <button onClick={submit} disabled={busy} style={{
              ...mono, fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.08em",
              padding: "8px 18px",
              background: busy ? "#fca5a5" : "#dc2626",
              color: "#fff", border: "none",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.8 : 1,
            }}>
              {busy ? "Rejecting…" : "Confirm rejection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════════════════
export default function UsersPage() {
  const [tab,        setTab]        = useState("users")   // "users" | "pending"
  const [users,      setUsers]      = useState([])
  const [pending,    setPending]    = useState([])
  const [page,       setPage]       = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [error,      setError]      = useState(null)
  const [modalOpen,  setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [branches,   setBranches]   = useState([])
  const [actionState, setActionState] = useState({})   // { [userId]: "approving"|"rejecting" }
  const [rejectTarget, setRejectTarget] = useState(null) // user being rejected

  // ─── fetch all active/inactive users ────────────────────────────────────────
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

  // ─── fetch pending (self-registered, not yet activated) ─────────────────────
  // Calls GET /users/pending  — adjust the endpoint to match your backend.
  // Expected response shape: { data: [ { id, fullName, email, role, branchId, branchName, ... } ] }
  const loadPending = useCallback(async () => {
    try {
      setPendingLoading(true)
      const res = await fetch(`${API}/users/pending`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const j = await res.json()
      setPending(j.data ?? [])
    } catch {
      setPending([])
    } finally {
      setPendingLoading(false)
    }
  }, [])

  // ─── fetch branches ──────────────────────────────────────────────────────────
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
    loadUsers(0)
    loadPending()
  }, [loadUsers, loadPending])

  // ─── modal helpers ───────────────────────────────────────────────────────────
  function openCreate() { setEditing(null); setModal(true) }
  function openEdit(u)  { setEditing(u);    setModal(true) }

  // ─── save (create or update) ─────────────────────────────────────────────────
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

    const j = await res.json()
    loadUsers(page)

    if (isEdit) {
      setModal(false)
      return { user: j.data }
    }

    return {
      user:          j.data,
      plainPassword: formData.password,
      emailPreview:  null,
      emailError:    null,
    }
  }

  // ─── delete user ─────────────────────────────────────────────────────────────
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

  // ─── toggle active / deactivate ──────────────────────────────────────────────
  async function handleDeactivate(user) {
    const path = user.active ? "deactivate" : "activate"
    const res  = await fetch(`${API}/users/${user.id}/${path}`, {
      method:  "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (!res.ok) { toast.error(`Failed to ${path} user`); return }
    toast.success(`User ${path}d`)
    loadUsers(page)
  }

  // ─── approve pending request ──────────────────────────────────────────────────
  // Calls PATCH /users/{id}/activate  (same endpoint as your existing activate)
  async function handleApprove(user) {
    setActionState((s) => ({ ...s, [user.id]: "approving" }))
    try {
      const res = await fetch(`${API}/users/${user.id}/activate`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) throw new Error()
      toast.success(`${user.fullName || user.email} approved and activated`)
      await Promise.all([loadPending(), loadUsers(page)])
    } catch {
      toast.error("Failed to approve user")
    } finally {
      setActionState((s) => { const n = { ...s }; delete n[user.id]; return n })
    }
  }

  // ─── reject pending request ───────────────────────────────────────────────────
  // Calls DELETE /users/{id}  — or swap for a dedicated /reject endpoint if you have one.
  async function handleRejectConfirm(user, reason) {
    setActionState((s) => ({ ...s, [user.id]: "rejecting" }))
    try {
      const res = await fetch(`${API}/users/${user.id}/reject`, {
        method:  "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ reason: reason || undefined }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Request from ${user.fullName || user.email} rejected`)
      setRejectTarget(null)
      await loadPending()
    } catch {
      toast.error("Failed to reject request")
    } finally {
      setActionState((s) => { const n = { ...s }; delete n[user.id]; return n })
    }
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
        {pill("Total",    users.length, "#f7f8f4", "#1a1f0e")}
        {pill("Active",   active,        "#f0f7ed", "#3d7a2b")}
        {pill("Inactive", inactive,       "#fef2f2", "#dc2626")}
        {pending.length > 0 && pill("Pending", pending.length, "#fef9ec", "#a07010")}
      </div>

      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca",
          color: "#dc2626", padding: "10px 16px",
          ...mono, fontSize: 12,
        }}>
          {error}
        </div>
      )}

      {/* Tab bar */}
      <TabBar
        active={tab}
        onChange={setTab}
        pendingCount={pending.length}
      />

      {/* ── All Users tab ── */}
      {tab === "users" && (
        <>
          <UsersTable
            users={users}
            loading={loading}
            onEdit={openEdit}
            onDeactivate={handleDeactivate}
          />

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                disabled={page === 0}
                onClick={() => loadUsers(page - 1)}
                style={paginationBtn(page === 0)}
              >
                ← Prev
              </button>
              <span style={{ ...mono, fontSize: 11, color: "#6b7260", alignSelf: "center" }}>
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
        </>
      )}

      {/* ── Pending Requests tab ── */}
      {tab === "pending" && (
        <>
          {/* Info notice */}
          <div style={{
            display: "flex", gap: 10, alignItems: "flex-start",
            background: "#fef9ec", border: "1px solid #f5e0a0",
            padding: "10px 14px",
          }}>
            <svg style={{ flexShrink: 0, marginTop: 1 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a07010" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span style={{ ...mono, fontSize: 11, color: "#a07010", lineHeight: 1.6 }}>
              These users self-registered and are awaiting your approval. Approving activates their account and sends them an email. Rejecting permanently removes their request.
            </span>
          </div>

          <PendingTable
            requests={pending}
            loading={pendingLoading}
            onApprove={handleApprove}
            onReject={(user) => setRejectTarget(user)}
            actionState={actionState}
          />
        </>
      )}

      {/* Reject reason modal */}
      {rejectTarget && (
        <RejectModal
          user={rejectTarget}
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
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
