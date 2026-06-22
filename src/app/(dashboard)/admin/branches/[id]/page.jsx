"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth/tokens"
import toast from "react-hot-toast"

const API = process.env.NEXT_PUBLIC_API_URL

export default function EditBranchPage({ params }) {
  const router = useRouter()
  const { id } = params

  const [form,     setForm]     = useState({ name: "", code: "", location: "", contact: "" })
  const [active,   setActive]   = useState(true)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toggling, setToggling] = useState(false)
  const [errors,   setErrors]   = useState({})
  const [notFound, setNotFound] = useState(false)

  // ─── load branch ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`${API}/branches/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (res.status === 404) { setNotFound(true); return }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const j = await res.json()
        const b = j.data ?? j
        setForm({
          name:     b.name         ?? "",
          code:     b.code         ?? "",
          location: b.location     ?? "",
          contact:  b.contactInfo  ?? b.contact ?? "",
        })
        setActive(b.active ?? true)
      } catch (err) {
        toast.error("Failed to load branch")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // ─── helpers ────────────────────────────────────────────────────────────────
  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())     e.name     = "Branch name is required"
    if (!form.code.trim())     e.code     = "Branch code is required"
    if (!form.location.trim()) e.location = "Location is required"
    return e
  }

  // ─── save ────────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const res = await fetch(`${API}/branches/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name:        form.name.trim(),
          code:        form.code.trim().toUpperCase(),
          location:    form.location.trim(),
          contactInfo: form.contact.trim(),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        if (j.errors) { setErrors(j.errors); throw new Error("Fix the errors below") }
        throw new Error(j.message ?? `HTTP ${res.status}`)
      }
      toast.success("Branch updated")
      router.push("/admin/branches")
    } catch (err) {
      toast.error(err.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  // ─── suspend / activate ──────────────────────────────────────────────────────
  async function handleToggle() {
    const action = active ? "deactivate" : "activate"
    const label  = active ? "suspended"  : "activated"
    setToggling(true)
    try {
      const res = await fetch(`${API}/branches/${id}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.message ?? `HTTP ${res.status}`)
      }
      setActive(!active)
      toast.success(`Branch ${label}`)
    } catch (err) {
      toast.error(err.message ?? `Failed to ${action} branch`)
    } finally {
      setToggling(false)
    }
  }

  // ─── states ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "48px 0", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#9ca3af" }}>
      <div style={{
        width: 16, height: 16, borderRadius: "50%",
        border: "2px solid #dde0d4", borderTopColor: "#3d7a2b",
        animation: "spin 0.7s linear infinite",
      }} />
      Loading branch…
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ maxWidth: 480 }}>
      <div style={{
        background: "#fef2f2", border: "1px solid #fecaca",
        padding: "20px 24px", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#dc2626",
      }}>
        Branch #{id} not found.
      </div>
      <button onClick={() => router.push("/admin/branches")} style={ghostBtn}>
        ← Back to branches
      </button>
    </div>
  )

  const fields = [
    { label: "Branch Name", key: "name",     placeholder: "Kigali HQ",         required: true  },
    { label: "Branch Code", key: "code",     placeholder: "KGL",               required: true  },
    { label: "Location",    key: "location", placeholder: "KG 11 Ave, Kigali", required: true  },
    { label: "Contact",     key: "contact",  placeholder: "+250 7xx xxx xxx",  required: false },
  ]

  return (
    <div style={{ maxWidth: 480 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 600, color: "#1a1f0e", margin: "0 0 4px" }}>
            Edit Branch
          </h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", margin: 0 }}>
            {form.name || `Branch #${id}`}
            {" · "}
            <span style={{ color: active ? "#3d7a2b" : "#dc2626" }}>
              {active ? "Active" : "Suspended"}
            </span>
          </p>
        </div>

        {/* Suspend / Activate toggle */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          style={{
            background: active ? "#fef2f2" : "#f0f7ed",
            color:      active ? "#dc2626" : "#3d7a2b",
            border:     `1px solid ${active ? "#fecaca" : "#bbf7d0"}`,
            padding: "8px 16px", cursor: toggling ? "default" : "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            textTransform: "uppercase", letterSpacing: "0.08em",
            opacity: toggling ? 0.6 : 1, flexShrink: 0,
          }}
        >
          {toggling ? "…" : active ? "Suspend Branch" : "Activate Branch"}
        </button>
      </div>

      {/* Form card */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4" }}>
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

          {fields.map(({ label, key, placeholder, required }) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{
                fontFamily: "'DM Mono', monospace", fontSize: 10,
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: errors[key] ? "#dc2626" : "#6b7260",
              }}>
                {label}{required && <span style={{ color: "#dc2626" }}> *</span>}
              </label>
              <input
                value={form[key]}
                onChange={(e) => set(key, key === "code" ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={placeholder}
                style={{
                  width: "100%", boxSizing: "border-box",
                  border: `1px solid ${errors[key] ? "#fca5a5" : "#dde0d4"}`,
                  background: errors[key] ? "#fef2f2" : "#fafaf8",
                  padding: "9px 12px",
                  fontFamily: "'DM Mono', monospace", fontSize: 13,
                  color: "#1a1f0e", outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#3d7a2b"; e.target.style.background = "#fff" }}
                onBlur={(e)  => {
                  e.target.style.borderColor = errors[key] ? "#fca5a5" : "#dde0d4"
                  e.target.style.background  = errors[key] ? "#fef2f2" : "#fafaf8"
                }}
              />
              {errors[key] && (
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#dc2626" }}>
                  {errors[key]}
                </span>
              )}
            </div>
          ))}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                background: saving ? "#b0b5a0" : "#1a1f0e",
                color: "#fff", border: "none",
                padding: "10px 0",
                cursor: saving ? "default" : "pointer",
                fontFamily: "'DM Mono', monospace", fontSize: 12,
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/branches")}
              style={ghostBtn}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

const ghostBtn = {
  background: "#f7f8f4", color: "#6b7260",
  border: "1px solid #dde0d4", padding: "10px 20px",
  cursor: "pointer",
  fontFamily: "'DM Mono', monospace", fontSize: 12,
  letterSpacing: "0.08em",
}