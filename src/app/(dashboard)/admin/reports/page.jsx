"use client"
import PageHeader from "@/components/ui/PageHeader"

export default function ReportsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="Reports" subtitle="Stock levels, transfer history, and low stock reports." />
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, padding: 32, textAlign: "center", color: "#9ca3af", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
        Reports module — coming soon
      </div>
    </div>
  )
}