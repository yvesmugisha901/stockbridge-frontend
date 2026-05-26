"use client"
import PageHeader from "@/components/ui/PageHeader"

export default function SystemConfigPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="System Config" subtitle="Transfer approval thresholds and system-wide settings." />
      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, padding: 32, textAlign: "center", color: "#9ca3af", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
        System configuration — coming soon
      </div>
    </div>
  )
}