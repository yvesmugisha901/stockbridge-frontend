"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/lib/context/AuthContext"
import { api } from "@/lib/api/client"
import toast from "react-hot-toast"
import PageHeader from "@/components/ui/PageHeader"

export default function NewTransferPage() {
  const router = useRouter()
  const { user } = useAuthContext()

  const [branches, setBranches]       = useState([])
  const [items, setItems]             = useState([])
  const [stockInfo, setStockInfo]     = useState(null)
  const [loadingDeps, setLoadingDeps] = useState(true)
  const [submitting, setSubmitting]   = useState(false)

  const [form, setForm] = useState({
    sourceBranchId: "", destinationBranchId: "",
    itemId: "", quantity: "", justification: "",
  })

  useEffect(() => {
    async function load() {
      try {
        setLoadingDeps(true)
        const [bRes, iRes] = await Promise.all([
          api.get("/branches?size=100"),
          api.get("/items?size=200"),
        ])
        if (bRes?.success) setBranches(bRes.data.content || [])
        if (iRes?.success) setItems(iRes.data.content || [])
      } catch { toast.error("Failed to load form data") }
      finally { setLoadingDeps(false) }
    }
    load()
  }, [])

  useEffect(() => {
    if (user?.branchId) setForm(f => ({ ...f, sourceBranchId: String(user.branchId) }))
  }, [user])

  useEffect(() => {
    async function checkStock() {
      if (!form.itemId || !form.sourceBranchId) { setStockInfo(null); return }
      try {
        const res = await api.get(`/stock?branchId=${form.sourceBranchId}&itemId=${form.itemId}`)
        if (res?.success && res.data.content?.length > 0) setStockInfo(res.data.content[0])
        else setStockInfo(null)
      } catch { setStockInfo(null) }
    }
    checkStock()
  }, [form.itemId, form.sourceBranchId])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  const availableQty = stockInfo ? stockInfo.quantityOnHand - (stockInfo.reservedQuantity ?? 0) : null
  const qtyExceeds   = availableQty !== null && form.quantity !== "" && Number(form.quantity) > availableQty
  const sameBranch   = form.destinationBranchId && form.destinationBranchId === form.sourceBranchId

  async function handleSubmit(e) {
    e.preventDefault()
    if (qtyExceeds)  { toast.error("Quantity exceeds available stock"); return }
    if (sameBranch)  { toast.error("Source and destination cannot be the same"); return }
    try {
      setSubmitting(true)
      const res = await api.post("/transfers", {
        sourceBranchId:      Number(form.sourceBranchId),
        destinationBranchId: Number(form.destinationBranchId),
        itemId:              Number(form.itemId),
        quantity:            Number(form.quantity),
        justification:       form.justification.trim(),
      })
      if (res?.success) {
        toast.success("Transfer request submitted")
        router.push("/dashboard/staff/transfers")
      } else toast.error(res?.message || "Submission failed")
    } catch (err) {
      toast.error(err.message || "Submission failed")
    } finally { setSubmitting(false) }
  }

  const labelStyle = {
    fontFamily: "'DM Mono', monospace", fontSize: 9,
    textTransform: "uppercase", letterSpacing: "0.12em",
    color: "#9ca3af", marginBottom: 6, display: "block",
  }

  const inputStyle = {
    width: "100%", border: "1px solid #dde0d4", background: "#f7f8f4",
    padding: "10px 14px", fontSize: 13, fontFamily: "'Inter', sans-serif",
    color: "#1a1f0e", outline: "none", boxSizing: "border-box",
  }

  const inputFocusStyle = { border: "1px solid #3d7a2b", background: "#fff" }

  if (loadingDeps) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "80px 0" }}>
      <div style={{ width: 24, height: 24, border: "2px solid #dde0d4", borderTopColor: "#3d7a2b", borderRadius: "50%", animation: "sb-spin 0.7s linear infinite" }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>Loading form data...</span>
      <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>

      <PageHeader
        title="New Transfer Request"
        subtitle="Request stock to be transferred from your branch to another location."
      />

      <div style={{ background: "#fff", border: "1px solid #dde0d4", padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Source branch — locked */}
        <div>
          <span style={labelStyle}>Source Branch</span>
          <div style={{ ...inputStyle, color: "#9ca3af", cursor: "not-allowed", background: "#f0f1ec" }}>
            {branches.find(b => String(b.id) === form.sourceBranchId)?.name ?? user?.branchName ?? "Your branch"}
            <span style={{ marginLeft: 8, fontSize: 11, color: "#c4c9bb" }}>(auto-assigned)</span>
          </div>
        </div>

        {/* Destination branch */}
        <div>
          <span style={labelStyle}>Destination Branch <span style={{ color: "#dc2626" }}>*</span></span>
          <select
            required value={form.destinationBranchId}
            onChange={e => set("destinationBranchId", e.target.value)}
            style={inputStyle}
          >
            <option value="">Select destination branch...</option>
            {branches.filter(b => String(b.id) !== form.sourceBranchId).map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {sameBranch && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#dc2626", marginTop: 4 }}>
              Source and destination cannot be the same branch.
            </p>
          )}
        </div>

        {/* Item */}
        <div>
          <span style={labelStyle}>Item <span style={{ color: "#dc2626" }}>*</span></span>
          <select
            required value={form.itemId}
            onChange={e => set("itemId", e.target.value)}
            style={inputStyle}
          >
            <option value="">Select item...</option>
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}{item.code ? ` (${item.code})` : ""}
              </option>
            ))}
          </select>

          {/* Stock availability pill */}
          {form.itemId && (
            <div style={{
              marginTop: 8, padding: "8px 12px", fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              ...(stockInfo === null
                ? { background: "#f7f8f4", border: "1px solid #dde0d4", color: "#9ca3af" }
                : availableQty === 0
                ? { background: "#fef2f2", border: "1px solid #fee2e2", color: "#dc2626" }
                : { background: "#f0f7ed", border: "1px solid #e1eedb", color: "#3d7a2b" }),
            }}>
              {stockInfo === null
                ? "Checking availability..."
                : availableQty === 0
                ? "⚠ No available stock at your branch for this item."
                : `✓ Available: ${availableQty} ${stockInfo.unitOfMeasure ?? "units"}`}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div>
          <span style={labelStyle}>Quantity <span style={{ color: "#dc2626" }}>*</span></span>
          <input
            type="number" required min={1} max={availableQty ?? undefined}
            value={form.quantity} placeholder="Enter quantity..."
            onChange={e => set("quantity", e.target.value)}
            style={{
              ...inputStyle,
              ...(qtyExceeds ? { border: "1px solid #dc2626", background: "#fef2f2", color: "#dc2626" } : {}),
            }}
          />
          {qtyExceeds && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#dc2626", marginTop: 4 }}>
              Exceeds available stock ({availableQty} available).
            </p>
          )}
        </div>

        {/* Justification */}
        <div>
          <span style={labelStyle}>Justification <span style={{ color: "#dc2626" }}>*</span></span>
          <textarea
            required rows={4} value={form.justification}
            placeholder="Explain why this transfer is needed..."
            onChange={e => set("justification", e.target.value)}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
          />
          <div style={{ textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
            {form.justification.length} / 500
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
          <button
            onClick={handleSubmit}
            disabled={submitting || qtyExceeds || sameBranch || availableQty === 0}
            style={{
              background: submitting || qtyExceeds || sameBranch || availableQty === 0 ? "#9ca3af" : "#3d7a2b",
              color: "#fff", border: "none", cursor: submitting ? "wait" : "pointer",
              padding: "10px 24px", fontSize: 13,
              fontFamily: "'Inter', sans-serif", fontWeight: 500,
            }}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
          <button
            onClick={() => router.back()}
            style={{
              background: "#fff", border: "1px solid #dde0d4", cursor: "pointer",
              padding: "10px 20px", fontSize: 13,
              fontFamily: "'Inter', sans-serif", color: "#6b7260",
            }}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}