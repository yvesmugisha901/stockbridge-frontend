"use client"
import { useState } from "react"

function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function XIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function DollarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}

const INITIAL = [
  { id: "TRF-0091", from: "Branch A", to: "Branch C", item: "Office Chairs", qty: 10, status: "COMPLETED",   date: "2026-05-20", cost: 320000,  costType: "Transport",   notes: "Hired truck"   },
  { id: "TRF-0089", from: "Branch B", to: "Branch A", item: "Laptops",       qty: 3,  status: "IN_TRANSIT",  date: "2026-05-19", cost: null,    costType: "",            notes: ""              },
  { id: "TRF-0085", from: "HQ",       to: "Branch D", item: "Stationery",    qty: 50, status: "HO_APPROVED", date: "2026-05-18", cost: null,    costType: "",            notes: ""              },
  { id: "TRF-0082", from: "Branch C", to: "Branch B", item: "Desks",         qty: 5,  status: "COMPLETED",   date: "2026-05-15", cost: 750000,  costType: "Handling",    notes: ""              },
  { id: "TRF-0078", from: "Branch D", to: "HQ",       item: "Monitors",      qty: 8,  status: "COMPLETED",   date: "2026-05-12", cost: null,    costType: "",            notes: ""              },
  { id: "TRF-0074", from: "Branch A", to: "Branch B", item: "Printers",      qty: 2,  status: "IN_TRANSIT",  date: "2026-05-10", cost: null,    costType: "",            notes: ""              },
]

const STATUS_STYLE = {
  COMPLETED:   { color: "#3d7a2b", bg: "#f0f7ed" },
  IN_TRANSIT:  { color: "#1d6fa8", bg: "#eaf3fb" },
  HO_APPROVED: { color: "#b45309", bg: "#fef3e2" },
  RECEIVED:    { color: "#6b7260", bg: "#f3f4f0" },
}

const COST_TYPES = ["Transport", "Handling", "Insurance", "Labour", "Other"]

export default function AccountantTransfers() {
  const [transfers, setTransfers] = useState(INITIAL)
  const [search, setSearch]       = useState("")
  const [statusFilter, setStatus] = useState("ALL")
  const [modal, setModal]         = useState(null)   // transfer being costed
  const [form, setForm]           = useState({ amount: "", costType: "Transport", notes: "" })
  const [saved, setSaved]         = useState(null)

  const filtered = transfers.filter(t => {
    const matchSearch = !search || [t.id, t.item, t.from, t.to].some(v => v.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const openModal = (t) => {
    setModal(t)
    setForm({ amount: t.cost || "", costType: t.costType || "Transport", notes: t.notes || "" })
  }

  const saveCost = () => {
    setTransfers(prev => prev.map(t =>
      t.id === modal.id
        ? { ...t, cost: Number(form.amount), costType: form.costType, notes: form.notes }
        : t
    ))
    setSaved(modal.id)
    setModal(null)
    setTimeout(() => setSaved(null), 2500)
  }

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #e8ebe3",
    borderRadius: 6,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 13,
    color: "#1a1f0e",
    outline: "none",
    background: "#fff",
  }

  return (
    <div style={{ maxWidth: 960 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#1a1f0e", margin: "0 0 4px" }}>
          Approved Transfers
        </h1>
        <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: "#6b7260", margin: 0 }}>
          View all approved transfers and attach cost records.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
            <SearchIcon />
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, item, branch…"
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>
        {["ALL", "HO_APPROVED", "IN_TRANSIT", "RECEIVED", "COMPLETED"].map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{
            padding: "7px 14px",
            borderRadius: 6,
            border: `1px solid ${statusFilter === s ? "#3d7a2b" : "#e8ebe3"}`,
            background: statusFilter === s ? "#f0f7ed" : "#fff",
            color: statusFilter === s ? "#3d7a2b" : "#6b7260",
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}>
            {s === "ALL" ? "All" : s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Toast */}
      {saved && (
        <div style={{
          background: "#f0f7ed",
          border: "1px solid #c6ddbf",
          borderRadius: 7,
          padding: "10px 16px",
          marginBottom: 16,
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: "#3d7a2b",
        }}>
          ✓ Cost saved for {saved}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9faf7" }}>
              {["Transfer ID", "Date", "Route", "Item", "Qty", "Status", "Cost", "Action"].map(h => (
                <th key={h} style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#9ca3af",
                  padding: "10px 16px",
                  textAlign: "left",
                  fontWeight: 400,
                  borderBottom: "1px solid #e8ebe3",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
                  No transfers match your filters.
                </td>
              </tr>
            ) : filtered.map((r, i) => {
              const s = STATUS_STYLE[r.status] || { color: "#6b7260", bg: "#f3f4f0" }
              const hasCost = r.cost !== null && r.cost !== ""
              return (
                <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f0" : "none" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#3d7a2b" }}>{r.id}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af" }}>{r.date}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#4b5563" }}>{r.from} → {r.to}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1a1f0e" }}>{r.item}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#4b5563" }}>{r.qty}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 10,
                      textTransform: "uppercase", letterSpacing: "0.08em",
                      color: s.color, background: s.bg, padding: "3px 8px", borderRadius: 4,
                    }}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: hasCost ? "#1a1f0e" : "#9ca3af" }}>
                    {hasCost ? `RWF ${r.cost.toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => openModal(r)} style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "5px 12px",
                      borderRadius: 5,
                      border: `1px solid ${hasCost ? "#e8ebe3" : "#3d7a2b"}`,
                      background: hasCost ? "#f9faf7" : "#f0f7ed",
                      color: hasCost ? "#6b7260" : "#3d7a2b",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      cursor: "pointer",
                    }}>
                      <DollarIcon />
                      {hasCost ? "Edit cost" : "Add cost"}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Cost modal */}
      {modal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 12,
            width: 420,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}>
            {/* Modal header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", borderBottom: "1px solid #e8ebe3",
            }}>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: "#1a1f0e", margin: 0 }}>
                  Record Transfer Cost
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
                  {modal.id} · {modal.item}
                </p>
              </div>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
                <XIcon />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", display: "block", marginBottom: 5 }}>
                  Amount (RWF)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="e.g. 250000"
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", display: "block", marginBottom: 5 }}>
                  Cost Type
                </label>
                <select
                  value={form.costType}
                  onChange={e => setForm(f => ({ ...f, costType: e.target.value }))}
                  style={inputStyle}
                >
                  {COST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6b7260", display: "block", marginBottom: 5 }}>
                  Notes <span style={{ color: "#b8bead" }}>(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="e.g. Hired truck from local vendor"
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button onClick={() => setModal(null)} style={{
                  padding: "8px 18px", borderRadius: 6, border: "1px solid #e8ebe3",
                  background: "#fff", color: "#6b7260",
                  fontFamily: "'Inter', sans-serif", fontSize: 13, cursor: "pointer",
                }}>
                  Cancel
                </button>
                <button
                  onClick={saveCost}
                  disabled={!form.amount}
                  style={{
                    padding: "8px 18px", borderRadius: 6, border: "none",
                    background: form.amount ? "#3d7a2b" : "#d1d5db",
                    color: "#fff",
                    fontFamily: "'Inter', sans-serif", fontSize: 13,
                    cursor: form.amount ? "pointer" : "not-allowed",
                  }}
                >
                  Save Cost
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}