"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PageHeader from "@/components/ui/PageHeader"
import toast from "react-hot-toast"

export default function NewItemPage() {
  const router = useRouter()
  const [form, setForm] = useState({ 
    name: "", 
    code: "", 
    category: "", 
    unit: "" 
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.code || !form.category || !form.unit) {
      toast.error("Please fill in all mandatory catalogue parameters.")
      return
    }

    // Success transaction tracking loop
    toast.success(`Master Catalogue Item [${form.code}] created successfully.`)
    router.push("/ho-admin/inventory")
  }

  const renderInputField = (label, key, placeholder) => (
    <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ 
        fontFamily: "'DM Mono', monospace", 
        fontSize: 10, 
        textTransform: "uppercase", 
        letterSpacing: "0.08em",
        color: "#6b7260",
        fontWeight: 600
      }}>
        {label} *
      </label>
      <input 
        required 
        type="text"
        placeholder={placeholder}
        value={form[key]} 
        onChange={e => setForm({ ...form, [key]: e.target.value })} 
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: "#1a1f0e",
          padding: "8px 12px",
          border: "1px solid #dde0d4",
          background: "#fff",
          outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = "#1a1f0e"}
        onBlur={(e) => e.currentTarget.style.borderColor = "#dde0d4"}
      />
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: "680px" }}>
      
      {/* ── Page Header Component ── */}
      <PageHeader
        title="Add Master Catalogue Item"
        subtitle="Register global SKU identifiers and baseline attributes inside corporate log arrays."
      />

      {/* ── Form Sheet Container ── */}
      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
        
        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#3d7a2b",
          margin: "0 0 20px"
        }}>
          Catalogue Specifications Manifest
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {/* Identity Grid Section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {renderInputField("Item Nomenclature / Name", "name", "e.g. Cement 42.5N")}
            {renderInputField("System Unique Code (SKU)", "code", "e.g. CMNT-425")}
          </div>

          {/* Classification Grid Section */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {renderInputField("Category Assignment Group", "category", "e.g. Materials")}
            {renderInputField("Unit of Measure", "unit", "e.g. Bags / Pieces / Buckets")}
          </div>

          {/* ── Action Triggers Footer Row ── */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 12, 
            marginTop: 12, 
            paddingTop: 20, 
            borderTop: "1px solid #f0f1ec" 
          }}>
            {/* Commit Button */}
            <button 
              type="submit" 
              style={{
                fontFamily: "'DM Mono', monospace", 
                fontSize: 12, 
                fontWeight: 600, 
                textTransform: "uppercase",
                background: "#1a1f0e", 
                color: "#fff", 
                padding: "10px 24px", 
                border: "1px solid #1a1f0e",
                cursor: "pointer", 
                transition: "background 0.15s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#3d7a2b"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#1a1f0e"}
            >
              Commit Item Variant
            </button>

            {/* Cancel Button */}
            <button 
              type="button" 
              onClick={() => router.back()} 
              style={{
                fontFamily: "'DM Mono', monospace", 
                fontSize: 12, 
                fontWeight: 500, 
                textTransform: "uppercase",
                background: "#f7f8f4", 
                color: "#6b7260", 
                padding: "10px 20px", 
                border: "1px solid #dde0d4",
                cursor: "pointer", 
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#9ca3af"
                e.currentTarget.style.color = "#1a1f0e"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#dde0d4"
                e.currentTarget.style.color = "#6b7260"
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