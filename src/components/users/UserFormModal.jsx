/**
 * UserFormModal — create or edit a user
 * Props: open, user (null = create), branches [], onClose(), onSave(data)
 */
"use client"
import { useState, useEffect } from "react"

const ROLES = [
  { value: "STAFF",      label: "Branch Staff" },
  { value: "MANAGER",    label: "Branch Manager" },
  { value: "HO_ADMIN",   label: "HO Admin" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "ADMIN",      label: "System Admin" },
]

const EMPTY = { name: "", email: "", password: "", role: "STAFF", branchId: "", active: true }

export default function UserFormModal({ open, user, branches = [], onClose, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const isEdit = !!user

  useEffect(() => {
    setForm(user ? { ...user, password: "" } : EMPTY)
  }, [user, open])

  if (!open) return null

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave?.(form)
      onClose?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(26,31,14,0.45)",
          zIndex: 50,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* modal */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#fff",
        border: "1px solid #dde0d4",
        width: "100%",
        maxWidth: 480,
        maxHeight: "90vh",
        overflowY: "auto",
        zIndex: 51,
        boxShadow: "0 24px 64px rgba(26,31,14,0.18)",
      }}>
        {/* header */}
        <div style={{
          padding: "24px 28px",
          borderBottom: "1px solid #dde0d4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 22,
              color: "#1a1f0e",
              margin: "0 0 2px",
            }}>
              {isEdit ? "Edit User" : "New User"}
            </h2>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", margin: 0 }}>
              {isEdit ? `Editing ${user.email}` : "Add a new system user"}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7260", fontSize: 20, lineHeight: 1 }}>
            ×
          </button>
        </div>

        {/* body */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 18 }}>

          <Field label="Full Name">
            <Input value={form.name} onChange={(v) => set("name", v)} placeholder="John Doe" />
          </Field>

          <Field label="Email Address">
            <Input type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="john@company.com" />
          </Field>

          <Field label={isEdit ? "New Password (leave blank to keep)" : "Password"}>
            <Input type="password" value={form.password} onChange={(v) => set("password", v)} placeholder="••••••••" />
          </Field>

          <Field label="Role">
            <Select value={form.role} onChange={(v) => set("role", v)} options={ROLES} />
          </Field>

          {/* Branch only relevant for non-admin roles */}
          {form.role !== "ADMIN" && form.role !== "HO_ADMIN" && (
            <Field label="Assigned Branch">
              <Select
                value={form.branchId}
                onChange={(v) => set("branchId", v)}
                options={[{ value: "", label: "— Select branch —" }, ...branches.map((b) => ({ value: b.id, label: b.name }))]}
              />
            </Field>
          )}

          {isEdit && (
            <Field label="Status">
              <div style={{ display: "flex", gap: 12 }}>
                {[true, false].map((val) => (
                  <label key={String(val)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e" }}>
                    <input
                      type="radio"
                      checked={form.active === val}
                      onChange={() => set("active", val)}
                      style={{ accentColor: "#3d7a2b" }}
                    />
                    {val ? "Active" : "Inactive"}
                  </label>
                ))}
              </div>
            </Field>
          )}
        </div>

        {/* footer */}
        <div style={{
          padding: "16px 28px",
          borderTop: "1px solid #dde0d4",
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
        }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={saveBtn(saving)}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#2a5a1e" }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "#3d7a2b" }}
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>
    </>
  )
}

/* ── tiny sub-components ── */
function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#6b7260", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({ type = "text", value, onChange, placeholder }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", boxSizing: "border-box",
        fontFamily: "'DM Mono', monospace", fontSize: 13,
        background: "#f7f8f4", border: "1px solid #dde0d4",
        padding: "10px 14px", color: "#1a1f0e", outline: "none",
      }}
      onFocus={(e) => { e.target.style.borderColor = "#3d7a2b"; e.target.style.background = "#fff" }}
      onBlur={(e)  => { e.target.style.borderColor = "#dde0d4"; e.target.style.background = "#f7f8f4" }}
    />
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", boxSizing: "border-box",
        fontFamily: "'DM Mono', monospace", fontSize: 13,
        background: "#f7f8f4", border: "1px solid #dde0d4",
        padding: "10px 14px", color: "#1a1f0e", outline: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7260' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 36,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

const cancelBtn = {
  background: "#f7f8f4", color: "#6b7260",
  border: "1px solid #dde0d4", cursor: "pointer",
  fontFamily: "'DM Mono', monospace", fontSize: 11,
  textTransform: "uppercase", letterSpacing: "0.1em",
  padding: "10px 20px",
}

const saveBtn = (saving) => ({
  background: "#3d7a2b", color: "#fff", border: "none",
  cursor: saving ? "not-allowed" : "pointer",
  fontFamily: "'DM Mono', monospace", fontSize: 11,
  textTransform: "uppercase", letterSpacing: "0.1em",
  padding: "10px 24px", opacity: saving ? 0.7 : 1,
  transition: "background 0.2s",
})