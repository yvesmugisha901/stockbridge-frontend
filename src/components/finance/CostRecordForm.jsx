"use client";
import { useState } from "react";

/**
 * CostRecordForm
 * Modal form to attach a cost record to a completed transfer.
 * Matches the accountant dashboard light theme:
 *   – white/green palette  (#3d7a2b accent, #e8ebe3 borders)
 *   – DM Serif Display headings, Inter body, DM Mono data
 */

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

const COST_TYPES = ["Transport", "Handling", "Insurance", "Labour", "Other"];
const CURRENCIES = ["RWF", "USD", "EUR", "GBP"];

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
  boxSizing: "border-box",
};

const inputErrorStyle = { ...inputStyle, border: "1px solid #e05252" };

export default function CostRecordForm({ transferId, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    amount: "",
    currency: "RWF",
    costType: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      e.amount = "Enter a valid positive amount.";
    if (!form.costType) e.costType = "Select a cost type.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onSubmit?.({ transferId, ...form, amount: Number(form.amount) });
    } finally {
      setLoading(false);
    }
  }

  function field(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.28)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: "1rem",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 12,
        width: "100%",
        maxWidth: 440,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #e8ebe3",
        }}>
          <div>
            <p style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              color: "#9ca3af", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {transferId}
            </p>
            <h2 style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 18, fontWeight: 400, color: "#1a1f0e", margin: 0,
            }}>
              Record Transfer Cost
            </h2>
          </div>
          <button onClick={onCancel} aria-label="Close" style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#9ca3af", padding: 4, display: "flex",
          }}>
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate style={{ padding: "20px" }}>

          {/* Amount + Currency */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12,
                color: "#6b7260", display: "block", marginBottom: 5,
              }}>
                Amount *
              </label>
              <input
                type="number" min="0" step="0.01"
                placeholder="e.g. 250000"
                value={form.amount}
                onChange={(e) => field("amount", e.target.value)}
                style={errors.amount ? inputErrorStyle : inputStyle}
              />
              {errors.amount && (
                <span style={{ fontSize: 11, color: "#e05252", marginTop: 3, display: "block" }}>
                  {errors.amount}
                </span>
              )}
            </div>
            <div style={{ width: 100 }}>
              <label style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12,
                color: "#6b7260", display: "block", marginBottom: 5,
              }}>
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => field("currency", e.target.value)}
                style={inputStyle}
              >
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Cost Type */}
          <div style={{ marginBottom: 14 }}>
            <label style={{
              fontFamily: "'Inter', sans-serif", fontSize: 12,
              color: "#6b7260", display: "block", marginBottom: 5,
            }}>
              Cost Type *
            </label>
            <select
              value={form.costType}
              onChange={(e) => field("costType", e.target.value)}
              style={errors.costType ? inputErrorStyle : inputStyle}
            >
              <option value="">Select type…</option>
              {COST_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.costType && (
              <span style={{ fontSize: 11, color: "#e05252", marginTop: 3, display: "block" }}>
                {errors.costType}
              </span>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              fontFamily: "'Inter', sans-serif", fontSize: 12,
              color: "#6b7260", display: "block", marginBottom: 5,
            }}>
              Notes <span style={{ color: "#b8bead" }}>(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Hired truck from local vendor"
              value={form.notes}
              onChange={(e) => field("notes", e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button" onClick={onCancel}
              style={{
                padding: "8px 18px", borderRadius: 6,
                border: "1px solid #e8ebe3", background: "#fff",
                color: "#6b7260", fontFamily: "'Inter', sans-serif",
                fontSize: 13, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              style={{
                padding: "8px 18px", borderRadius: 6, border: "none",
                background: loading ? "#d1d5db" : "#3d7a2b",
                color: "#fff", fontFamily: "'Inter', sans-serif",
                fontSize: 13, cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving…" : "Save Cost Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}