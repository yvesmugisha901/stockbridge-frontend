/**
 * UserFormModal — create or edit a user
 * Props: open, user (null = create), branches [], onClose(), onSave(data)
 *
 * CreateUserRequest fields: username (auto-generated), email, password, fullName, role, branchId
 * UpdateUserRequest fields: username (auto-generated), email, fullName, role, branchId  (no password)
 *
 * Username is auto-derived from fullName: "Eve Mutoni" → "eve.mutoni"
 */
"use client"
import { useState, useEffect } from "react"
import { ROLES }               from "@/lib/utils/constants"
import toast                   from "react-hot-toast"

const EMPTY = {
  fullName: "",
  email:    "",
  password: "",
  role:     "",
  branchId: "",
}

/** "Eve Mutoni Uwase" → "eve.mutoni.uwase" */
function toUsername(fullName) {
  return fullName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "")
}

export default function UserFormModal({ open, user, branches = [], onClose, onSave }) {
  const [form,    setForm]    = useState(EMPTY)
  const [saving,  setSaving]  = useState(false)
  const [errors,  setErrors]  = useState({})

  const isEdit = Boolean(user)

  // ─── sync form when modal opens / switches between create and edit ──────────
  useEffect(() => {
    if (open) {
      if (user) {
        setForm({
          fullName: user.fullName  ?? "",
          email:    user.email     ?? "",
          password: "",
          role:     user.role      ?? "",
          branchId: user.branchId != null ? String(user.branchId) : "",
        })
      } else {
        setForm(EMPTY)
      }
      setErrors({})
    }
  }, [open, user])

  if (!open) return null

  // ─── field helpers ──────────────────────────────────────────────────────────
  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  // ─── client-side validation ─────────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!form.fullName.trim())  e.fullName = "Full name is required"
    if (!form.email.trim())     e.email    = "Email is required"
    if (!isEdit && !form.password.trim()) e.password = "Password is required"
    if (!isEdit && form.password.length < 6) e.password = "At least 6 characters"
    if (!form.role)             e.role     = "Role is required"
    return e
  }

  // ─── submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const payload = {
        username: toUsername(form.fullName),   // auto-generated, hidden from UI
        fullName: form.fullName.trim(),
        email:    form.email.trim(),
        role:     form.role,
        branchId: form.branchId ? Number(form.branchId) : null,
      }
      if (!isEdit) payload.password = form.password

      await onSave(payload)
      toast.success(isEdit ? "User updated" : "User created")
    } catch (err) {
      toast.error(err.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  // ─── username preview (shown as a subtle hint below Full Name) ──────────────
  const usernamePreview = form.fullName.trim() ? toUsername(form.fullName) : null

  return (
    <div style={overlay}>
      <div style={panel}>
        {/* Header */}
        <div style={panelHeader}>
          <span style={panelTitle}>{isEdit ? "Edit User" : "New User"}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Full Name */}
          <Field label="Full Name" error={errors.fullName}>
            <input
              style={input(errors.fullName)}
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
            />
            {usernamePreview && (
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: "#9ba590",
                marginTop: 3,
              }}>
                username: {usernamePreview}
              </span>
            )}
          </Field>

          {/* Email */}
          <Field label="Email" error={errors.email}>
            <input
              type="email"
              style={input(errors.email)}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="off"
            />
          </Field>

          {/* Password — only on create */}
          {!isEdit && (
            <Field label="Password" error={errors.password}>
              <input
                type="password"
                style={input(errors.password)}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                autoComplete="new-password"
              />
            </Field>
          )}

          {/* Role */}
          <Field label="Role" error={errors.role}>
            <select
              style={input(errors.role)}
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            >
              <option value="">Select role</option>
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>

          {/* Branch */}
          <Field label="Branch (optional)">
            <select
              style={input(false)}
              value={form.branchId}
              onChange={(e) => set("branchId", e.target.value)}
            >
              <option value="">— No branch —</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)}>{b.name} ({b.code})</option>
              ))}
            </select>
          </Field>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                background: saving ? "#b0b5a0" : "#1a1f0e",
                color: "#fff",
                border: "none",
                padding: "10px 0",
                cursor: saving ? "default" : "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "#f7f8f4",
                color: "#6b7260",
                border: "1px solid #dde0d4",
                padding: "10px 20px",
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.08em",
              }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// ─── tiny layout helpers ─────────────────────────────────────────────────────
function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: error ? "#dc2626" : "#6b7260",
      }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#dc2626" }}>
          {error}
        </span>
      )}
    </div>
  )
}

// ─── styles ──────────────────────────────────────────────────────────────────
const overlay = {
  position:       "fixed",
  inset:          0,
  background:     "rgba(0,0,0,0.45)",
  display:        "flex",
  alignItems:     "center",
  justifyContent: "center",
  zIndex:         1000,
}

const panel = {
  background:   "#fff",
  border:       "1px solid #dde0d4",
  width:        460,
  maxWidth:     "calc(100vw - 32px)",
  maxHeight:    "90vh",
  overflowY:    "auto",
}

const panelHeader = {
  display:         "flex",
  alignItems:      "center",
  justifyContent:  "space-between",
  padding:         "16px 28px",
  borderBottom:    "1px solid #dde0d4",
  background:      "#f7f8f4",
}

const panelTitle = {
  fontFamily:    "'DM Mono', monospace",
  fontSize:      13,
  fontWeight:    600,
  color:         "#1a1f0e",
  letterSpacing: "0.04em",
}

const closeBtn = {
  background:  "transparent",
  border:      "none",
  cursor:      "pointer",
  color:       "#6b7260",
  fontSize:    16,
  lineHeight:  1,
  padding:     4,
}

function input(hasError) {
  return {
    width:        "100%",
    boxSizing:    "border-box",
    border:       `1px solid ${hasError ? "#fca5a5" : "#dde0d4"}`,
    background:   hasError ? "#fef2f2" : "#fafaf8",
    padding:      "9px 12px",
    fontFamily:   "'Inter', sans-serif",
    fontSize:     13,
    color:        "#1a1f0e",
    outline:      "none",
  }
}