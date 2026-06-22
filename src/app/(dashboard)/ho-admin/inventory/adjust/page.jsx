"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"

export default function StockAdjustPage() {
  const router = useRouter()

  const [items, setItems]           = useState([])
  const [branches, setBranches]     = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadError, setLoadError]   = useState(null)

  const [itemId, setItemId]         = useState("")
  const [branchId, setBranchId]     = useState("")
  const [adjustType, setAdjustType] = useState("ADD")
  const [quantity, setQuantity]     = useState("")
  const [reason, setReason]         = useState("")
  const [submitting, setSubmitting] = useState(false)

  const selectedItem = items.find(i => String(i.id) === String(itemId)) ?? null

  useEffect(() => {
    async function load() {
      try {
        setLoadingData(true)

        const [itemsRaw, branchesRaw] = await Promise.all([
          api.get("/items?size=200&sort=name,asc"),
          api.get("/branches"),
        ])

        // ── DEBUG: remove these after confirming it works ──
        console.log("itemsRaw:", JSON.stringify(itemsRaw))
        console.log("branchesRaw:", JSON.stringify(branchesRaw))

        // Handle every possible response shape
        const itemList =
          Array.isArray(itemsRaw?.data?.content) ? itemsRaw.data.content :
          Array.isArray(itemsRaw?.content)        ? itemsRaw.content :
          Array.isArray(itemsRaw?.data)           ? itemsRaw.data :
          Array.isArray(itemsRaw)                 ? itemsRaw : []

        const branchList =
          Array.isArray(branchesRaw?.data?.content) ? branchesRaw.data.content :
          Array.isArray(branchesRaw?.data)           ? branchesRaw.data :
          Array.isArray(branchesRaw?.content)        ? branchesRaw.content :
          Array.isArray(branchesRaw)                 ? branchesRaw : []

        console.log("itemList:", itemList.length, "branchList:", branchList.length)

        setItems(itemList)
        setBranches(branchList)
      } catch (err) {
        console.error("Load error:", err)
        setLoadError(err.message)
        toast.error("Failed to load data.")
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const qty = parseInt(quantity)
    if (!qty || qty <= 0) { toast.error("Quantity must be a positive number."); return }
    try {
      setSubmitting(true)
      await api.post("/stock/adjust", {
        itemId:             Number(itemId),
        branchId:           Number(branchId),
        adjustmentQuantity: adjustType === "ADD" ? qty : -qty,
        reason:             reason.trim(),
      })
      toast.success("Stock adjustment applied successfully.")
      router.push("/ho-admin/stock")
    } catch (err) {
      toast.error(err.message || "Adjustment failed.")
    } finally {
      setSubmitting(false)
    }
  }

  const labelStyle = {
    fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase",
    letterSpacing: "0.12em", color: "#6b7260", fontWeight: 600,
  }
  const inputBase = {
    fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e",
    padding: "9px 12px", border: "1px solid #dde0d4", background: "#fff",
    outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s",
  }
  const focus = e => (e.currentTarget.style.borderColor = "#1a1f0e")
  const blur  = e => (e.currentTarget.style.borderColor = "#dde0d4")

  function Field({ label: lbl, required, hint, children }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <span style={labelStyle}>{lbl}{required && " *"}</span>
        {children}
        {hint && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9ca3af" }}>{hint}</span>}
      </div>
    )
  }

  if (loadingData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "72px 0" }}>
        <div style={{ width: 20, height: 20, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase" }}>Loading...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ padding: "16px 20px", background: "#fef2f2", border: "1px solid #fecaca", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#dc2626" }}>
        Failed to load data: {loadError}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 640 }}>
      <PageHeader
        title="Manual Stock Adjustment"
        subtitle="Add or deduct stock for a specific item at a branch. All adjustments are logged with a mandatory reason."
      />

      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: "28px 28px 24px" }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", color: "#3d7a2b", margin: "0 0 22px" }}>
          Adjustment Parameters
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Item" required>
              <select required value={itemId} onChange={e => setItemId(e.target.value)}
                style={{ ...inputBase, background: "#f7f8f4" }} onFocus={focus} onBlur={blur}>
                <option value="">Select item... ({items.length})</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.code} — {i.name}</option>)}
              </select>
            </Field>

            <Field label="Target Branch" required>
              <select required value={branchId} onChange={e => setBranchId(e.target.value)}
                style={{ ...inputBase, background: "#f7f8f4" }} onFocus={focus} onBlur={blur}>
                <option value="">Select branch... ({branches.length})</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Adjustment Type" required>
              <div style={{ display: "flex", gap: 0 }}>
                {["ADD", "DEDUCT"].map(type => (
                  <button key={type} type="button" onClick={() => setAdjustType(type)}
                    style={{
                      flex: 1, fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 600,
                      textTransform: "uppercase", padding: "9px 0", border: "1px solid", cursor: "pointer", transition: "all 0.15s",
                      ...(adjustType === type
                        ? type === "ADD" ? { background: "#f0f7ed", color: "#3d7a2b", borderColor: "#3d7a2b" }
                                        : { background: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" }
                        : { background: "#f7f8f4", color: "#9ca3af", borderColor: "#dde0d4" }),
                    }}>
                    {type === "ADD" ? "+ Add" : "- Deduct"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={`Quantity${selectedItem?.unitOfMeasure ? ` (${selectedItem.unitOfMeasure})` : ""}`} required
              hint="Enter a positive number. Sign is set by adjustment type.">
              <input required type="number" min="1" step="1" placeholder="e.g. 50"
                value={quantity} onChange={e => setQuantity(e.target.value)}
                style={{ ...inputBase, fontFamily: "'DM Mono', monospace" }} onFocus={focus} onBlur={blur} />
            </Field>
          </div>

          {itemId && branchId && quantity && parseInt(quantity) > 0 && (
            <div style={{
              padding: "10px 14px",
              background: adjustType === "ADD" ? "#f0f7ed" : "#fef2f2",
              border: `1px solid ${adjustType === "ADD" ? "#e1eedb" : "#fecaca"}`,
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              color: adjustType === "ADD" ? "#3d7a2b" : "#dc2626",
            }}>
              {adjustType === "ADD" ? "+" : "-"}{quantity} {selectedItem?.unitOfMeasure ?? "units"} of{" "}
              <strong>{selectedItem?.name ?? "item"}</strong> at{" "}
              <strong>{branches.find(b => String(b.id) === String(branchId))?.name ?? "branch"}</strong>
            </div>
          )}

          <Field label="Reason" required hint="Required. Logged against this adjustment permanently.">
            <textarea required rows={3}
              placeholder="e.g. Physical count correction, damaged goods write-off, initial stock load..."
              value={reason} onChange={e => setReason(e.target.value)}
              style={{ ...inputBase, resize: "vertical", lineHeight: 1.5 }} onFocus={focus} onBlur={blur} />
          </Field>

          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 20, marginTop: 4, borderTop: "1px solid #f0f1ec" }}>
            <button type="submit" disabled={submitting}
              style={{
                fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, textTransform: "uppercase",
                background: submitting ? "#9ca3af" : "#1a1f0e", color: "#fff", padding: "10px 28px",
                border: "1px solid transparent", cursor: submitting ? "wait" : "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#3d7a2b" }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#1a1f0e" }}>
              {submitting ? "Applying..." : "Apply Adjustment"}
            </button>

            <button type="button" onClick={() => router.back()}
              style={{
                fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 500, textTransform: "uppercase",
                background: "#f7f8f4", color: "#6b7260", padding: "10px 20px",
                border: "1px solid #dde0d4", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#1a1f0e" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#dde0d4"; e.currentTarget.style.color = "#6b7260" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
