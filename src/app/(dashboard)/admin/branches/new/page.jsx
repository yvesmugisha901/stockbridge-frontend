"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { getToken } from "@/lib/auth/tokens"
import toast from "react-hot-toast"

const API = process.env.NEXT_PUBLIC_API_URL

const EMPTY = { name: "", code: "", location: "", contact: "" }

export default function NewBranchPage() {
  const router  = useRouter()
  const [form,   setForm]   = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim())     e.name = "Branch name is required"
    if (!form.code.trim())     e.code = "Branch code is required"
    if (!form.location.trim()) e.location = "Location is required"
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const res = await fetch(`${API}/branches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name:        form.name.trim(),
          code:        form.code.trim().toUpperCase(),
          location:    form.location.trim(),
          contactInfo: form.contact.trim(),   // API field name is contactInfo
        }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        // Surface per-field validation errors from Spring if available
        if (j.errors) {
          setErrors(j.errors)
          throw new Error("Please fix the errors below")
        }
        throw new Error(j.message ?? `HTTP ${res.status}`)
      }

      toast.success("Branch created")
      router.push("/admin/branches")
    } catch (err) {
      toast.error(err.message ?? "Failed to create branch")
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { label: "Branch Name", key: "name",     placeholder: "Kigali HQ",          required: true  },
    { label: "Branch Code", key: "code",     placeholder: "KGL",                required: true  },
    { label: "Location",    key: "location", placeholder: "KG 11 Ave, Kigali",  required: true  },
    { label: "Contact",     key: "contact",  placeholder: "+250 7xx xxx xxx",   required: false },
  ]

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 600, color: "#1a1f0e", margin: "0 0 4px" }}>
          New Branch
        </h1>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", margin: 0 }}>
          Add a new branch location to the system
        </p>
      </div>

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
              {saving ? "Saving…" : "Create Branch"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                background: "#f7f8f4", color: "#6b7260",
                border: "1px solid #dde0d4", padding: "10px 20px",
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace", fontSize: 12,
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