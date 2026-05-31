/**
 * BranchFormModal — create or edit a branch
 * Props: open, branch (null = create), onClose(), onSave(data)
 */
"use client"
import { useState, useEffect } from "react"

const EMPTY = { name: "", code: "", location: "", contact: "", active: true }

export default function BranchFormModal({ open, branch, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const isEdit = !!branch

  useEffect(() => {
    if (open) {
      if (branch) {
        setForm({
          name:     branch.name         ?? "",
          code:     branch.code         ?? "",
          location: branch.location     ?? "",
          // API returns contactInfo; normalise to contact for internal form state
          contact:  branch.contactInfo  ?? branch.contact ?? "",
          active:   branch.active       ?? true,
        })
      } else {
        setForm(EMPTY)
      }
    }
  }, [branch, open])

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
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(26,31,14,0.45)",
          zIndex: 50,
          backdropFilter: "blur(2px)",
        }}
      />

      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#fff",
        border: "1px solid #dde0d4",
        width: "100%",
        maxWidth: 460,
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
            <h2 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 22, color: "#1a1f0e", margin: "0 0 2px" }}>
              {isEdit ? "Edit Branch" : "New Branch"}
            </h2>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", margin: 0 }}>
              {isEdit ? `Editing ${branch.name}` : "Add a new branch location"}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7260", fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {/* body */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12 }}>
            <Field label="Branch Name">
              <Input value={form.name} onChange={(v) => set("name", v)} placeholder="Kigali HQ" />
            </Field>
            <Field label="Code">
              <Input value={form.code} onChange={(v) => set("code", v.toUpperCase())} placeholder="KGL" />
            </Field>
          </div>

          <Field label="Location / Address">
            <Input value={form.location} onChange={(v) => set("location", v)} placeholder="KG 11 Ave, Kigali" />
          </Field>

          <Field label="Contact (phone or email)">
            <Input value={form.contact} onChange={(v) => set("contact", v)} placeholder="+250 7xx xxx xxx" />
          </Field>

          {isEdit && (
            <Field label="Status">
              <div style={{ display: "flex", gap: 12 }}>
                {[true, false].map((val) => (
                  <label key={String(val)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#1a1f0e" }}>
                    <input type="radio" checked={form.active === val} onChange={() => set("active", val)} style={{ accentColor: "#3d7a2b" }} />
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
          display: "flex", gap: 10, justifyContent: "flex-end",
        }}>
          <button onClick={onClose} style={cancelBtn}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={saveBtn(saving)}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#2a5a1e" }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "#3d7a2b" }}
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Branch"}
          </button>
        </div>
      </div>
    </>
  )
}

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