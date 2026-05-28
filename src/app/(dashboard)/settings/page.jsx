"use client"
import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"

export default function SettingsPage() {
  const [profile,  setProfile]  = useState({ name: "", email: "", role: "", branch: "" })
  const [pwForm,   setPwForm]   = useState({ currentPassword: "", newPassword: "", confirm: "" })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [msg,      setMsg]      = useState(null)
  const [pwMsg,    setPwMsg]    = useState(null)

  useEffect(() => {
    api.get("/users/me")
      .then(j => {
        const u = j.data ?? j
        setProfile({
          name:   u.fullName   ?? "",
          email:  u.email      ?? "",
          role:   u.role       ?? "",
          branch: u.branchName ?? u.branch ?? ""
        })
      })
      .catch(err => {
        setMsg({ type: "error", text: err.message })
      })
      .finally(() => setLoading(false))
  }, [])

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true); setMsg(null)
    try {
      await api.put("/users/me", { name: profile.name })
      setMsg({ type: "success", text: "Profile updated successfully." })
    } catch (err) {
      setMsg({ type: "error", text: err.message })
    } finally { setSaving(false) }
  }

  async function changePassword(e) {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "New passwords do not match." }); return
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: "error", text: "Password must be at least 8 characters." }); return
    }
    setPwSaving(true); setPwMsg(null)
    try {
      await api.post("/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwMsg({ type: "success", text: "Password changed successfully." })
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" })
    } catch (err) {
      setPwMsg({ type: "error", text: err.message })
    } finally { setPwSaving(false) }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 620 }}>
      <PageHeader title="Settings" subtitle="Manage your profile and account security." />

      <Section title="Profile" subtitle="Update your display name">
        {loading ? <Skeleton /> : (
          <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Full name">
              <input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                style={inputStyle} required
              />
            </Field>
            <Field label="Email address">
              <input value={profile.email} disabled style={{ ...inputStyle, background: "#f7f8f4", color: "#9ca3af", cursor: "not-allowed" }} />
              <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Email cannot be changed. Contact your admin.</span>
            </Field>
            <Field label="Role">
              <input value={profile.role} disabled style={{ ...inputStyle, background: "#f7f8f4", color: "#9ca3af", cursor: "not-allowed" }} />
            </Field>
            {profile.branch && (
              <Field label="Branch">
                <input value={profile.branch} disabled style={{ ...inputStyle, background: "#f7f8f4", color: "#9ca3af", cursor: "not-allowed" }} />
              </Field>
            )}
            {msg && <Banner msg={msg} />}
            <div>
              <button type="submit" disabled={saving} style={btnPrimary}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </Section>

      <Section title="Change password" subtitle="FR-04 — passwords are stored as bcrypt hashes">
        <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Current password">
            <input type="password" value={pwForm.currentPassword}
              onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
              style={inputStyle} required autoComplete="current-password" />
          </Field>
          <Field label="New password">
            <input type="password" value={pwForm.newPassword}
              onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
              style={inputStyle} required autoComplete="new-password" />
          </Field>
          <Field label="Confirm new password">
            <input type="password" value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              style={inputStyle} required autoComplete="new-password" />
          </Field>
          {pwMsg && <Banner msg={pwMsg} />}
          <div>
            <button type="submit" disabled={pwSaving} style={btnPrimary}>
              {pwSaving ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </Section>
    </div>
  )
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "14px 24px 12px", borderBottom: "1px solid #e8ebe3", background: "#f7f8f4" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1f0e" }}>{title}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{subtitle}</div>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "#374151", fontFamily: "'Inter', sans-serif" }}>{label}</label>
      {children}
    </div>
  )
}

function Banner({ msg }) {
  const isSuccess = msg.type === "success"
  return (
    <div style={{
      padding: "10px 14px", borderRadius: 6, fontSize: 12,
      background: isSuccess ? "#f0fdf4" : "#fef2f2",
      border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
      color: isSuccess ? "#16a34a" : "#dc2626",
      fontFamily: "'DM Mono', monospace",
    }}>
      {msg.text}
    </div>
  )
}

function Skeleton() {
  return [1,2,3].map(i => (
    <div key={i} style={{ height: 38, background: "#f3f4f0", borderRadius: 6, marginBottom: 16 }} />
  ))
}

const inputStyle = { border: "1px solid #d1d5db", borderRadius: 6, padding: "9px 12px", fontSize: 13, fontFamily: "'Inter', sans-serif", outline: "none", color: "#1a1f0e", width: "100%", boxSizing: "border-box" }
const btnPrimary = { background: "#1a1f0e", color: "#fff", border: "none", borderRadius: 6, padding: "9px 20px", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500 }  