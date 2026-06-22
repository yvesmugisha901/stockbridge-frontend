"use client"
import { useState } from "react"
import Link from "next/link"
import toast from "react-hot-toast"
import { getToken } from "@/lib/auth/session"

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  })
  const [show,   setShow]   = useState({ current: false, next: false, confirm: false })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [done,   setDone]   = useState(false)

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: null }))
  }

  function validate() {
    const e = {}
    if (!form.currentPassword.trim())     e.currentPassword = "Current password is required"
    if (!form.newPassword.trim())          e.newPassword     = "New password is required"
    else if (form.newPassword.length < 6)  e.newPassword     = "At least 6 characters"
    if (!form.confirmPassword.trim())      e.confirmPassword = "Please confirm your new password"
    else if (form.newPassword !== form.confirmPassword)
                                           e.confirmPassword = "Passwords do not match"
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const payload = {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
        confirmPassword: form.confirmPassword,
      }

      // TEMP DEBUG — remove after fix
      console.log("SENDING PAYLOAD:", JSON.stringify(payload))

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message ?? "Failed to change password")
      }

      setDone(true)
      toast.success("Password changed successfully")
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <div style={{
        background: "#fff", border: "1px solid #dde0d4",
        padding: "24px 32px 28px",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div style={{
          background: "#f0f7ed", border: "1px solid #c6dfc0",
          padding: "14px 16px", borderRadius: 6,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ color: "#3d7a2b", fontSize: 16, lineHeight: 1 }}>✓</span>
          <p style={{ margin: 0, fontSize: 12, color: "#3d7a2b", lineHeight: 1.5,
            fontFamily: "'Inter', sans-serif" }}>
            Your password has been updated. Use your new password next time you sign in.
          </p>
        </div>
        <Link href="/settings" style={backLinkStyle}>← Back to settings</Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff", border: "1px solid #dde0d4",
        padding: "24px 32px 28px",
        display: "flex", flexDirection: "column", gap: 14,
      }}
    >
      <PwdField
        label="Current Password"
        value={form.currentPassword}
        show={show.current}
        onToggle={() => setShow(s => ({ ...s, current: !s.current }))}
        onChange={(v) => set("currentPassword", v)}
        error={errors.currentPassword}
      />
      <PwdField
        label="New Password"
        value={form.newPassword}
        show={show.next}
        onToggle={() => setShow(s => ({ ...s, next: !s.next }))}
        onChange={(v) => set("newPassword", v)}
        error={errors.newPassword}
      />
      <PwdField
        label="Confirm New Password"
        value={form.confirmPassword}
        show={show.confirm}
        onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))}
        onChange={(v) => set("confirmPassword", v)}
        error={errors.confirmPassword}
      />

      <button
        type="submit" disabled={saving}
        style={{
          marginTop: 4, width: "100%",
          background: saving ? "#5a9e46" : "#3d7a2b",
          color: "#fff", border: "none",
          cursor: saving ? "not-allowed" : "pointer",
          padding: "12px 0", opacity: saving ? 0.7 : 1,
          fontFamily: "'DM Mono', monospace", fontSize: 12,
          textTransform: "uppercase", letterSpacing: "0.1em",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "#2a5a1e" }}
        onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "#3d7a2b" }}
      >
        {saving ? "Saving…" : "Update Password"}
      </button>

      <Link href="/settings" style={backLinkStyle}>← Back to settings</Link>
    </form>
  )
}

function PwdField({ label, value, show, onToggle, onChange, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          style={{
            ...inputStyle,
            paddingRight: 52,
            borderColor: error ? "#fca5a5" : "#dde0d4",
            background:  error ? "#fef2f2" : "#f7f8f4",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#3d7a2b"; e.target.style.background = "#fff" }}
          onBlur={(e)  => {
            e.target.style.borderColor = error ? "#fca5a5" : "#dde0d4"
            e.target.style.background  = error ? "#fef2f2" : "#f7f8f4"
          }}
        />
        <button
          type="button" onClick={onToggle}
          style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 10, color: "#9a9e8f", fontFamily: "'DM Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.06em", padding: 0,
          }}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && (
        <span style={{ fontSize: 11, color: "#dc2626", fontFamily: "'Inter', sans-serif" }}>
          {error}
        </span>
      )}
    </div>
  )
}

const labelStyle = {
  fontFamily: "'DM Mono', monospace", fontSize: 10,
  textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b7260",
}
const inputStyle = {
  width: "100%", boxSizing: "border-box",
  fontFamily: "'DM Mono', monospace", fontSize: 13,
  background: "#f7f8f4", border: "1px solid #dde0d4",
  padding: "10px 14px", color: "#1a1f0e", outline: "none",
}
const backLinkStyle = {
  display: "block", textAlign: "center",
  fontFamily: "'DM Mono', monospace", fontSize: 11,
  color: "#6b7260", textDecoration: "none",
}