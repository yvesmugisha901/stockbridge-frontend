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
  const [stockInfo, setStockInfo]     = useState(null)   // StockLevelResponse
  const [stockLoading, setStockLoading] = useState(false)
  const [loadingDeps, setLoadingDeps] = useState(true)
  const [submitting, setSubmitting]   = useState(false)

  const [form, setForm] = useState({
    sourceBranchId: "",
    destinationBranchId: "",
    itemId: "",
    quantity: "",
    justification: "",
  })

  // ── Load branches + items in parallel ───────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoadingDeps(true)
        const [bRes, iRes] = await Promise.all([
          api.get("/branches"),          // → ApiResponse<List<BranchSummaryResponse>>
          api.get("/items?size=200"),    // → ApiResponse<Page<ItemResponse>> or List
        ])

        if (bRes?.success) {
          // GET /api/v1/branches returns List (not Page) — data is the array directly
          const list = Array.isArray(bRes.data) ? bRes.data : (bRes.data?.content ?? [])
          setBranches(list.filter(b => b.active)) // only active branches in dropdown
        }

        if (iRes?.success) {
          // Guard for both Page and List shapes
          const list = Array.isArray(iRes.data) ? iRes.data : (iRes.data?.content ?? [])
          setItems(list.filter(i => i.active))
        }
      } catch {
        toast.error("Failed to load form data")
      } finally {
        setLoadingDeps(false)
      }
    }
    load()
  }, [])

  // ── Pre-fill source branch from auth context ─────────────────────────────────
  useEffect(() => {
    if (user?.branchId) {
      setForm(f => ({ ...f, sourceBranchId: String(user.branchId) }))
    }
  }, [user])

  // ── Check available stock whenever item or source branch changes ─────────────
  useEffect(() => {
    async function checkStock() {
      if (!form.itemId || !form.sourceBranchId) {
        setStockInfo(null)
        return
      }
      try {
        setStockLoading(true)
        // GET /api/v1/stock?branchId=X&itemId=Y → ApiResponse<Page<StockLevelResponse>>
        const res = await api.get(
          `/stock?branchId=${form.sourceBranchId}&itemId=${form.itemId}`
        )
        if (res?.success && res.data?.content?.length > 0) {
          setStockInfo(res.data.content[0])
        } else {
          setStockInfo(null)
        }
      } catch {
        setStockInfo(null)
      } finally {
        setStockLoading(false)
      }
    }
    checkStock()
  }, [form.itemId, form.sourceBranchId])

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  // ── Derived validation ───────────────────────────────────────────────────────
  // Available = on hand minus reserved
  const availableQty = stockInfo
    ? stockInfo.quantityOnHand - (stockInfo.reservedQuantity ?? 0)
    : null

  const qtyExceeds = availableQty !== null
    && form.quantity !== ""
    && Number(form.quantity) > availableQty

  const sameBranch = Boolean(
    form.destinationBranchId && form.destinationBranchId === form.sourceBranchId
  )

  const canSubmit = !submitting
    && !qtyExceeds
    && !sameBranch
    && availableQty !== 0
    && form.destinationBranchId
    && form.itemId
    && form.quantity
    && form.justification.trim().length > 0

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    if (qtyExceeds) { toast.error("Quantity exceeds available stock"); return }
    if (sameBranch) { toast.error("Source and destination cannot be the same"); return }
    if (!form.justification.trim()) { toast.error("Justification is required"); return }

    try {
      setSubmitting(true)
      // POST /api/v1/transfers — CreateTransferRequest
      // Fields: sourceBranchId, destinationBranchId, itemId, quantity, justification
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
      } else {
        toast.error(res?.message || "Submission failed")
      }
    } catch (err) {
      toast.error(err.message || "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Styles ───────────────────────────────────────────────────────────────────
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

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loadingDeps) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "80px 0" }}>
      <div style={{
        width: 24, height: 24,
        border: "2px solid #dde0d4", borderTopColor: "#3d7a2b",
        borderRadius: "50%", animation: "sb-spin 0.7s linear infinite",
      }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#6b7260", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Loading form data...
      </span>
      <style>{`@keyframes sb-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>

      <PageHeader
        title="New Transfer Request"
        subtitle="Request stock to be transferred from your branch to another location."
      />

      <div style={{
        background: "#fff", border: "1px solid #dde0d4",
        padding: 28, display: "flex", flexDirection: "column", gap: 20,
      }}>

        {/* ── Source branch — locked to user's branch ── */}
        <div>
          <span style={labelStyle}>Source Branch</span>
          <div style={{
            ...inputStyle,
            color: "#9ca3af", cursor: "not-allowed",
            background: "#f0f1ec", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>
              {branches.find(b => String(b.id) === form.sourceBranchId)?.name
                ?? user?.branchName
                ?? "Your branch"}
            </span>
            <span style={{ fontSize: 11, color: "#c4c9bb" }}>(auto-assigned)</span>
          </div>
        </div>

        {/* ── Destination branch ── */}
        <div>
          <span style={labelStyle}>
            Destination Branch <span style={{ color: "#dc2626" }}>*</span>
          </span>
          <select
            required
            value={form.destinationBranchId}
            onChange={e => set("destinationBranchId", e.target.value)}
            style={inputStyle}
          >
            <option value="">Select destination branch...</option>
            {/* BranchSummaryResponse: id, name, code — exclude own branch */}
            {branches
              .filter(b => String(b.id) !== form.sourceBranchId)
              .map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}{b.code ? ` — ${b.code}` : ""}
                </option>
              ))}
          </select>
          {sameBranch && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#dc2626", marginTop: 4 }}>
              Source and destination cannot be the same branch.
            </p>
          )}
        </div>

        {/* ── Item ── */}
        <div>
          <span style={labelStyle}>
            Item <span style={{ color: "#dc2626" }}>*</span>
          </span>
          <select
            required
            value={form.itemId}
            onChange={e => set("itemId", e.target.value)}
            style={inputStyle}
          >
            <option value="">Select item...</option>
            {/* ItemResponse: id, name, code, unitOfMeasure */}
            {items.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}{item.code ? ` (${item.code})` : ""}
              </option>
            ))}
          </select>

          {/* ── Stock availability pill ── */}
          {form.itemId && (
            <div style={{
              marginTop: 8, padding: "8px 12px", fontSize: 12,
              fontFamily: "'DM Mono', monospace",
              ...(stockLoading
                ? { background: "#f7f8f4", border: "1px solid #dde0d4", color: "#9ca3af" }
                : stockInfo === null
                ? { background: "#fef9c3", border: "1px solid #fde68a", color: "#92400e" }
                : availableQty === 0
                ? { background: "#fef2f2", border: "1px solid #fee2e2", color: "#dc2626" }
                : { background: "#f0f7ed", border: "1px solid #e1eedb", color: "#3d7a2b" }),
            }}>
              {stockLoading
                ? "Checking availability..."
                : stockInfo === null
                // Item exists in catalogue but no stock record at this branch
                ? "⚠ This item has no stock record at your branch."
                : availableQty === 0
                ? "⚠ No available stock at your branch for this item."
                // unitOfMeasure comes from StockLevelResponse (no field) — use ItemResponse instead
                : `✓ Available: ${availableQty} ${
                    items.find(i => String(i.id) === form.itemId)?.unitOfMeasure ?? "units"
                  }`
              }
            </div>
          )}
        </div>

        {/* ── Quantity ── */}
        <div>
          <span style={labelStyle}>
            Quantity <span style={{ color: "#dc2626" }}>*</span>
          </span>
          <input
            type="number"
            required
            min={1}
            max={availableQty ?? undefined}
            value={form.quantity}
            placeholder="Enter quantity..."
            onChange={e => set("quantity", e.target.value)}
            style={{
              ...inputStyle,
              ...(qtyExceeds
                ? { border: "1px solid #dc2626", background: "#fef2f2", color: "#dc2626" }
                : {}),
            }}
          />
          {qtyExceeds && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#dc2626", marginTop: 4 }}>
              Exceeds available stock ({availableQty} available).
            </p>
          )}
        </div>

        {/* ── Justification ── */}
        <div>
          <span style={labelStyle}>
            Justification <span style={{ color: "#dc2626" }}>*</span>
          </span>
          <textarea
            required
            rows={4}
            maxLength={500}
            value={form.justification}
            placeholder="Explain why this transfer is needed..."
            onChange={e => set("justification", e.target.value)}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
          />
          <div style={{
            textAlign: "right",
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: form.justification.length > 450 ? "#ca8a04" : "#9ca3af",
            marginTop: 4,
          }}>
            {form.justification.length} / 500
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              background: canSubmit ? "#3d7a2b" : "#9ca3af",
              color: "#fff", border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              padding: "10px 24px", fontSize: 13,
              fontFamily: "'Inter', sans-serif", fontWeight: 500,
            }}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              background: "#fff", border: "1px solid #dde0d4",
              cursor: "pointer", padding: "10px 20px", fontSize: 13,
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