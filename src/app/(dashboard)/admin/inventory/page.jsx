"use client"
import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { getToken } from "@/lib/auth/tokens"

const API = process.env.NEXT_PUBLIC_API_URL

const EMPTY = { content: [], totalElements: 0 }

export default function ItemCataloguePage() {
  const [data,    setData]    = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`${API}/inventory/items?page=0&size=50`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!cancelled && res.ok) {
          const j = await res.json()
          setData(j.data ?? j)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const items = data.content ?? data ?? []

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        title="Item Catalogue"
        subtitle="Master list of all inventory items across the system."
      />

      {error && <ErrorBanner msg={error} />}

      <div style={{
        background: "#fff", border: "1px solid #e8ebe3",
        borderRadius: 8, overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
          <thead>
            <tr style={{ background: "#f7f8f4", borderBottom: "1px solid #e8ebe3" }}>
              {["Code", "Name", "Category", "Unit", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No items found</td></tr>
            ) : items.map((item, i) => (
              <tr key={item.id ?? i} style={{ borderBottom: "1px solid #f3f4f0" }}>
                <td style={{ padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#6b7280" }}>{item.code}</td>
                <td style={{ padding: "10px 16px", fontWeight: 500, color: "#1a1f0e" }}>{item.name}</td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{item.category}</td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{item.unitOfMeasure}</td>
                <td style={{ padding: "10px 16px" }}>
                  <StatusBadge active={item.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ active }) {
  return (
    <span style={{
      fontSize: 10, fontFamily: "'DM Mono', monospace", textTransform: "uppercase",
      letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 3,
      background: active ? "#e4f0df" : "#fef2f2",
      color: active ? "#3d7a2b" : "#dc2626",
    }}>
      {active ? "Active" : "Inactive"}
    </span>
  )
}

function ErrorBanner({ msg }) {
  return (
    <div style={{
      background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626",
      padding: "10px 16px", fontFamily: "'DM Mono', monospace", fontSize: 12,
    }}>
      {msg}
    </div>
  )
}