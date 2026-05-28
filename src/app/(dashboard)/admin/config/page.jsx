"use client"
import { useState, useEffect } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { api } from "@/lib/api/client"

const CONFIG_LABELS = {
  APPROVAL_QUANTITY_THRESHOLD: { label: "Quantity approval threshold",    hint: "Transfers above this quantity require HO_ADMIN approval (FR-15)" },
  APPROVAL_VALUE_THRESHOLD:    { label: "Value approval threshold (RWF)", hint: "Transfers above this value require HO_ADMIN approval (FR-15)" },
  DEFAULT_CURRENCY:            { label: "Default currency",               hint: "Currency used across cost recording and finance reports" },
  MAX_TRANSFER_QUANTITY:       { label: "Max transfer quantity",          hint: "Hard limit on quantity per transfer request" },
  LOW_STOCK_ALERT_ENABLED:     { label: "Low stock alerts",               hint: "Show alerts when stock falls below minimum threshold (FR-12)" },
}

export default function SystemConfigPage() {
  const [configs,  setConfigs]  = useState([])
  const [editing,  setEditing]  = useState({})
  const [saving,   setSaving]   = useState({})
  const [saved,    setSaved]    = useState({})
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    api.get("/config")                                    // ← was /api/v1/config
      .then(j => setConfigs(j.data ?? j))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function startEdit(id, currentValue) {
    setEditing(prev => ({ ...prev, [id]: currentValue }))
    setSaved(prev => ({ ...prev, [id]: false }))
  }

  function cancelEdit(id) {
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  async function saveConfig(id) {
    setSaving(prev => ({ ...prev, [id]: true }))
    try {
      const updated = await api.put(`/config/${id}`, { configValue: editing[id] })  // ← was /api/v1/config/${id}
      setConfigs(prev => prev.map(c => c.id === id ? (updated.data ?? updated) : c))
      setSaved(prev => ({ ...prev, [id]: true }))
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n })
      setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 2000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }))
    }
  }

  const isBoolean = (val) => val === "true" || val === "false"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader title="System Config" subtitle="Transfer approval thresholds and system-wide settings." />

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 16px", borderRadius: 6, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
          {error}
        </div>
      )}

      <div style={{ background: "#fff", border: "1px solid #e8ebe3", borderRadius: 8, overflow: "hidden" }}>
        <SectionHeader title="Approval thresholds" subtitle="Controls when HO_ADMIN second-level approval is required (FR-15)" />
        {loading ? <Skeleton /> : configs
          .filter(c => c.configKey.startsWith("APPROVAL"))
          .map(c => (
            <ConfigRow key={c.id} config={c} meta={CONFIG_LABELS[c.configKey]}
              editing={editing} saving={saving} saved={saved} isBoolean={isBoolean}
              onEdit={startEdit} onCancel={cancelEdit} onSave={saveConfig}
              onChange={(id, val) => setEditing(prev => ({ ...prev, [id]: val }))} />
          ))
        }

        <SectionHeader title="Transfer rules" subtitle="Constraints applied when creating transfer requests" />
        {loading ? <Skeleton /> : configs
          .filter(c => c.configKey.startsWith("MAX_TRANSFER"))
          .map(c => (
            <ConfigRow key={c.id} config={c} meta={CONFIG_LABELS[c.configKey]}
              editing={editing} saving={saving} saved={saved} isBoolean={isBoolean}
              onEdit={startEdit} onCancel={cancelEdit} onSave={saveConfig}
              onChange={(id, val) => setEditing(prev => ({ ...prev, [id]: val }))} />
          ))
        }

        <SectionHeader title="Finance & alerts" subtitle="Currency and notification settings" />
        {loading ? <Skeleton /> : configs
          .filter(c => ["DEFAULT_CURRENCY", "LOW_STOCK_ALERT_ENABLED"].includes(c.configKey))
          .map(c => (
            <ConfigRow key={c.id} config={c} meta={CONFIG_LABELS[c.configKey]}
              editing={editing} saving={saving} saved={saved} isBoolean={isBoolean}
              onEdit={startEdit} onCancel={cancelEdit} onSave={saveConfig}
              onChange={(id, val) => setEditing(prev => ({ ...prev, [id]: val }))} />
          ))
        }
      </div>
    </div>
  )
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ padding: "14px 24px 10px", borderBottom: "1px solid #e8ebe3", background: "#f7f8f4" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1f0e", textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{subtitle}</div>
    </div>
  )
}

function ConfigRow({ config, meta, editing, saving, saved, isBoolean, onEdit, onCancel, onSave, onChange }) {
  const isEditing = editing[config.id] !== undefined
  const isSaving  = saving[config.id]
  const isSaved   = saved[config.id]
  const bool      = isBoolean(config.configValue)

  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #f3f4f0", gap: 16 }}>
      <div style={{ flex: "0 0 260px" }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1f0e" }}>{meta?.label ?? config.configKey}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{config.configKey}</div>
      </div>
      <div style={{ flex: 1, fontSize: 12, color: "#6b7280" }}>{meta?.hint}</div>
      <div style={{ flex: "0 0 200px", display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
        {isEditing ? (
          bool ? (
            <select value={editing[config.id]} onChange={e => onChange(config.id, e.target.value)} style={inputStyle}>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          ) : (
            <input type="text" value={editing[config.id]} onChange={e => onChange(config.id, e.target.value)} style={inputStyle} autoFocus />
          )
        ) : (
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: 13,
            color: bool ? (config.configValue === "true" ? "#16a34a" : "#dc2626") : "#1a1f0e",
            background: bool ? (config.configValue === "true" ? "#f0fdf4" : "#fef2f2") : "#f7f8f4",
            padding: "3px 10px", borderRadius: 4
          }}>
            {bool ? (config.configValue === "true" ? "Enabled" : "Disabled") : config.configValue}
          </span>
        )}
        {isEditing ? (
          <>
            <button onClick={() => onSave(config.id)} disabled={isSaving} style={btnPrimary}>{isSaving ? "…" : "Save"}</button>
            <button onClick={() => onCancel(config.id)} style={btnGhost}>Cancel</button>
          </>
        ) : (
          <button onClick={() => onEdit(config.id, config.configValue)} style={btnGhost}>{isSaved ? "✓ Saved" : "Edit"}</button>
        )}
      </div>
    </div>
  )
}

function Skeleton() {
  return [1, 2].map(i => (
    <div key={i} style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f0" }}>
      <div style={{ height: 14, width: 200, background: "#f3f4f0", borderRadius: 4 }} />
    </div>
  ))
}

const inputStyle = { border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 13, fontFamily: "'DM Mono', monospace", width: 120, outline: "none", color: "#1a1f0e" }
const btnPrimary = { background: "#1a1f0e", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif" }
const btnGhost   = { background: "transparent", color: "#6b7280", border: "1px solid #e8ebe3", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif" }