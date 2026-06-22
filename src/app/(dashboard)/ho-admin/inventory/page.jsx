"use client"
import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import Link from "next/link"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

const IconAdjust = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

export default function InventoryPage() {
  const [items, setItems]               = useState([])
  const [branches, setBranches]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  const [selectedItem, setSelectedItem]     = useState(null)
  const [adjustBranchId, setAdjustBranchId] = useState("")
  const [adjustQty, setAdjustQty]           = useState("")
  const [adjustType, setAdjustType]         = useState("ADD")
  const [adjustReason, setAdjustReason]     = useState("")
  const [submitting, setSubmitting]         = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [itemsRes, branchesRes] = await Promise.all([
          api.get("/items?size=200&sort=name,asc"),
          api.get("/branches"),   // plain list — no pagination params
        ])

        // Items: ApiResponse<Page<Item>> → .data.content[]
        const itemList =
          Array.isArray(itemsRes?.data?.content) ? itemsRes.data.content :
          Array.isArray(itemsRes?.content)        ? itemsRes.content :
          Array.isArray(itemsRes?.data)           ? itemsRes.data :
          Array.isArray(itemsRes)                 ? itemsRes : []

        // Branches: ApiResponse<List<Branch>> → .data[]  (NOT paginated, no .content)
        const branchList =
          Array.isArray(branchesRes?.data)        ? branchesRes.data :
          Array.isArray(branchesRes?.data?.content) ? branchesRes.data.content :
          Array.isArray(branchesRes?.content)     ? branchesRes.content :
          Array.isArray(branchesRes)              ? branchesRes : []

        setItems(itemList)
        setBranches(branchList)
      } catch (err) {
        setError(err.message)
        toast.error("Failed to load catalogue")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function openAdjust(item) {
    setSelectedItem(item)
    setAdjustBranchId("")
    setAdjustQty("")
    setAdjustType("ADD")
    setAdjustReason("")
  }

  async function handleApplyAdjustment(e) {
    e.preventDefault()
    const qty = parseInt(adjustQty)
    if (!qty || qty <= 0) { toast.error("Please enter a valid quantity greater than 0."); return }
    if (!adjustBranchId)  { toast.error("Please select a branch."); return }
    if (!adjustReason.trim()) { toast.error("A reason is required for stock adjustments."); return }

    try {
      setSubmitting(true)
      await api.post("/stock/adjust", {
        itemId:             selectedItem.id,
        branchId:           Number(adjustBranchId),
        adjustmentQuantity: adjustType === "ADD" ? qty : -qty,
        reason:             adjustReason.trim(),
      })
      toast.success(`Stock adjustment applied: ${adjustType} ${qty} ${selectedItem.unitOfMeasure ?? "units"} of ${selectedItem.name}`)
      setSelectedItem(null)
    } catch (err) {
      toast.error(err.message || "Adjustment failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <PageHeader
          title="Item Catalogue"
          subtitle="Manage your global system master item indexes, categories, and direct baseline adjustments."
        />
        <Link
          href="/ho-admin/inventory/new"
          style={{ display: "inline-flex", alignItems: "center", padding: "8px 16px", border: "1px solid #3d7a2b", background: "#3d7a2b", color: "#fff", fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, textTransform: "uppercase", textDecoration: "none", transition: "background 0.15s, border-color 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2f5e21"; e.currentTarget.style.borderColor = "#2f5e21" }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#3d7a2b"; e.currentTarget.style.borderColor = "#3d7a2b" }}
        >
          + Add New Item
        </Link>
      </div>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "48px 0", background: "#fff", border: "1px solid #dde0d4" }}>
          <div style={{ width: 20, height: 20, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase" }}>Loading catalogue...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: "16px 24px", background: "#fef2f2", border: "1px solid #fecaca", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#dc2626" }}>
          Failed to load catalogue: {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: selectedItem ? "1fr 360px" : "1fr", gap: 16, alignItems: "start" }}>

          {/* Catalogue table */}
          <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1.5fr 1fr 100px 110px 100px 90px", padding: "6px 0", borderBottom: "1px solid #e8ebe3", gap: 8 }}>
              {["Code", "Name", "Category", "Unit", "Unit Price", "Status", "Actions"].map(h => (
                <span key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af" }}>{h}</span>
              ))}
            </div>

            {items.length === 0 ? (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "40px 0" }}>
                No items in the catalogue yet.{" "}
                <Link href="/ho-admin/inventory/new" style={{ color: "#3d7a2b" }}>Add the first item →</Link>
              </div>
            ) : (
              items.map((entry, idx) => (
                <div key={entry.id} style={{ display: "grid", gridTemplateColumns: "120px 1.5fr 1fr 100px 110px 100px 90px", padding: "12px 0", borderBottom: idx < items.length - 1 ? "1px solid #f0f1ec" : "none", gap: 8, alignItems: "center" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#3d7a2b", fontWeight: 600 }}>{entry.code}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>{entry.name}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>{entry.category ?? "—"}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1a1f0e" }}>{entry.unitOfMeasure ?? "—"}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#1a1f0e" }}>
                    {entry.unitPrice != null
                      ? new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(entry.unitPrice)
                      : "—"}
                  </span>
                  <div>
                    <span style={{ display: "inline-block", fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", padding: "1px 6px", ...(entry.active !== false && entry.status !== "INACTIVE" ? { background: "#f0f7ed", color: "#3d7a2b", border: "1px solid #e1eedb" } : { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }) }}>
                      {entry.active !== false && entry.status !== "INACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div>
                    <button
                      onClick={() => openAdjust(entry)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'DM Mono', monospace", fontSize: 10, textTransform: "uppercase", color: "#6b7260", background: "#f7f8f4", border: "1px solid #dde0d4", padding: "4px 8px", cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3d7a2b"; e.currentTarget.style.color = "#3d7a2b"; e.currentTarget.style.background = "#f0f7ed" }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#dde0d4"; e.currentTarget.style.color = "#6b7260"; e.currentTarget.style.background = "#f7f8f4" }}
                    >
                      <IconAdjust /> Adjust
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Adjustment Panel */}
          {selectedItem && (
            <div style={{ background: "#fff", border: "1px solid #3d7a2b", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #dde0d4", paddingBottom: 10 }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#1a1f0e", margin: 0 }}>Stock Adjustment</p>
                <button onClick={() => setSelectedItem(null)} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                  ✕ Close
                </button>
              </div>

              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260" }}>
                Adjusting: <strong style={{ color: "#1a1f0e", fontFamily: "'DM Mono', monospace" }}>{selectedItem.code}</strong> — {selectedItem.name}
              </div>

              <form onSubmit={handleApplyAdjustment} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", color: "#6b7260" }}>
                    Target Branch * ({branches.length} available)
                  </span>
                  <select
                    required
                    value={adjustBranchId}
                    onChange={(e) => setAdjustBranchId(e.target.value)}
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", padding: "6px 10px", border: "1px solid #dde0d4", background: "#f7f8f4", outline: "none" }}
                  >
                    <option value="">Select branch...</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", color: "#6b7260" }}>Adjustment Type *</span>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", padding: "6px 10px", border: "1px solid #dde0d4", background: "#f7f8f4", outline: "none" }}
                  >
                    <option value="ADD">Add Stock (+)</option>
                    <option value="DEDUCT">Deduct Stock (−)</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", color: "#6b7260" }}>
                    Quantity ({selectedItem.unitOfMeasure ?? "units"}) *
                  </span>
                  <input
                    type="number" min="1" required placeholder="e.g. 50"
                    value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)}
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", padding: "6px 10px", border: "1px solid #dde0d4", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", color: "#6b7260" }}>Reason *</span>
                  <textarea
                    rows={2} required placeholder="e.g. Physical count correction"
                    value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)}
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e", padding: "6px 10px", border: "1px solid #dde0d4", outline: "none", resize: "vertical" }}
                  />
                </div>

                <button
                  type="submit" disabled={submitting}
                  style={{ marginTop: 6, fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, textTransform: "uppercase", background: submitting ? "#9ca3af" : "#1a1f0e", color: "#fff", padding: "10px", border: "1px solid #1a1f0e", cursor: submitting ? "wait" : "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#3d7a2b" }}
                  onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#1a1f0e" }}
                >
                  {submitting ? "Applying..." : "Apply Adjustment"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
