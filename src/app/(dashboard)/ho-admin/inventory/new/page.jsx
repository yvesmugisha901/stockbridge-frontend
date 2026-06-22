"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

// ── Field MUST be outside the page component so it isn't re-created on every keystroke ──
const labelStyle = {
  fontFamily: "'DM Mono', monospace",
  fontSize: 9,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "#6b7260",
  fontWeight: 600,
}

function Field({ label, required, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={labelStyle}>{label}{required && " *"}</span>
      {children}
    </div>
  )
}

export default function NewItemPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name:          "",
    code:          "",
    description:   "",
    category:      "",
    unitOfMeasure: "",
    unitPrice:     "",
  })

  const [submitting, setSubmitting] = useState(false)

  function setField(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  const inputStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: "#1a1f0e",
    padding: "8px 12px",
    border: "1px solid #dde0d4",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.15s",
    width: "100%",
    boxSizing: "border-box",
  }
  const focus = e => (e.currentTarget.style.borderColor = "#1a1f0e")
  const blur  = e => (e.currentTarget.style.borderColor = "#dde0d4")

  async function handleSubmit(e) {
    e.preventDefault()
    const price = parseFloat(form.unitPrice)
    if (!price || price <= 0) {
      toast.error("Unit price must be a positive number.")
      return
    }
    try {
      setSubmitting(true)
      await api.post("/items", {
        name:          form.name.trim(),
        code:          form.code.trim().toUpperCase(),
        description:   form.description.trim() || undefined,
        category:      form.category.trim(),
        unitOfMeasure: form.unitOfMeasure.trim() || undefined,
        unitPrice:     price,
      })
      toast.success(`Item [${form.code.toUpperCase()}] added to catalogue.`)
      router.push("/ho-admin/inventory")
    } catch (err) {
      toast.error(err.message || "Failed to create item.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720 }}>
      <PageHeader
        title="Add Catalogue Item"
        subtitle="Register a new item in the global master catalogue. It will be available across all branches."
      />

      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "28px 28px 24px" }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: "#3d7a2b", margin: "0 0 22px" }}>
          Item Specifications
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Item Name" required>
              <input
                required type="text" placeholder="e.g. Cement 42.5N"
                value={form.name}
                onChange={e => setField("name", e.target.value)}
                style={inputStyle} onFocus={focus} onBlur={blur}
              />
            </Field>
            <Field label="Item Code (SKU)" required>
              <input
                required type="text" placeholder="e.g. CMNT-425"
                value={form.code}
                onChange={e => setField("code", e.target.value.toUpperCase())}
                style={{ ...inputStyle, fontFamily: "'DM Mono', monospace", textTransform: "uppercase" }}
                onFocus={focus} onBlur={blur}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Category" required>
              <input
                required type="text" placeholder="e.g. Materials, Equipment"
                value={form.category}
                onChange={e => setField("category", e.target.value)}
                style={inputStyle} onFocus={focus} onBlur={blur}
              />
            </Field>
            <Field label="Unit of Measure">
              <input
                type="text" placeholder="e.g. Bags, Pieces, Litres"
                value={form.unitOfMeasure}
                onChange={e => setField("unitOfMeasure", e.target.value)}
                style={inputStyle} onFocus={focus} onBlur={blur}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Unit Price (RWF)" required>
              <input
                required type="number" min="0.01" step="0.01" placeholder="e.g. 12500"
                value={form.unitPrice}
                onChange={e => setField("unitPrice", e.target.value)}
                style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }}
                onFocus={focus} onBlur={blur}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={3} placeholder="Optional — brief description of this item."
              value={form.description}
              onChange={e => setField("description", e.target.value)}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              onFocus={focus} onBlur={blur}
            />
          </Field>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, paddingTop: 20, borderTop: "1px solid #f0f1ec" }}>
            <button
              type="submit" disabled={submitting}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, textTransform: "uppercase", background: submitting ? "#9ca3af" : "#1a1f0e", color: "#fff", padding: "10px 28px", border: "1px solid transparent", cursor: submitting ? "wait" : "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#3d7a2b" }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#1a1f0e" }}
            >
              {submitting ? "Creating..." : "Create Item"}
            </button>
            <button
              type="button" onClick={() => router.back()}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500, textTransform: "uppercase", background: "#f7f8f4", color: "#6b7260", padding: "10px 20px", border: "1px solid #dde0d4", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#1a1f0e" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#dde0d4"; e.currentTarget.style.color = "#6b7260" }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
