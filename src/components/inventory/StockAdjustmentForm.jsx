"use client";
import { useState } from "react";

/**
 * StockAdjustmentForm
 * HO_ADMIN can manually add or remove stock for an item at a branch.
 * FR-11: Manual Stock Adjustment
 *
 * Props:
 *   item     {object}   - { id, name, code, quantity, unit, branch }
 *   onSubmit {function} - called with { itemId, type, quantity, reason }
 *   onCancel {function}
 */
export default function StockAdjustmentForm({ item = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({ type: "ADD", quantity: "", reason: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
      e.quantity = "Enter a valid positive quantity.";
    if (!form.reason.trim()) e.reason = "A reason is required.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await onSubmit?.({ itemId: item.id, ...form, quantity: Number(form.quantity) });
    } finally {
      setLoading(false);
    }
  }

  const newQty =
    form.quantity && !isNaN(form.quantity)
      ? form.type === "ADD"
        ? item.quantity + Number(form.quantity)
        : item.quantity - Number(form.quantity)
      : null;

  return (
    <div className="saf-overlay">
      <div className="saf-card">
        <div className="saf-header">
          <div>
            <p className="saf-eyebrow">{item.code} · {item.branch}</p>
            <h2 className="saf-title">Adjust Stock</h2>
            <p className="saf-subtitle">{item.name}</p>
          </div>
          <button className="saf-close" onClick={onCancel}>✕</button>
        </div>

        {/* Current qty display */}
        <div className="saf-current">
          <span className="saf-current-label">Current</span>
          <span className="saf-current-qty">{item.quantity} {item.unit}</span>
          {newQty !== null && (
            <>
              <span className="saf-arrow">→</span>
              <span className={`saf-new-qty ${newQty < 0 ? "saf-new-qty--neg" : ""}`}>
                {newQty} {item.unit}
              </span>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Type toggle */}
          <div className="saf-field">
            <label className="saf-label">Adjustment Type</label>
            <div className="saf-toggle">
              {["ADD", "REMOVE"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`saf-toggle-btn ${form.type === t ? "saf-toggle-btn--active" : ""} ${t === "REMOVE" ? "saf-toggle-btn--remove" : ""}`}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                >
                  {t === "ADD" ? "+ Add Stock" : "− Remove Stock"}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="saf-field">
            <label className="saf-label">Quantity *</label>
            <input
              type="number"
              min="1"
              className={`saf-input ${errors.quantity ? "saf-input--error" : ""}`}
              placeholder="0"
              value={form.quantity}
              onChange={(e) => {
                setForm((f) => ({ ...f, quantity: e.target.value }));
                setErrors((er) => ({ ...er, quantity: undefined }));
              }}
            />
            {errors.quantity && <span className="saf-error">{errors.quantity}</span>}
          </div>

          {/* Reason */}
          <div className="saf-field">
            <label className="saf-label">Reason *</label>
            <textarea
              className={`saf-textarea ${errors.reason ? "saf-input--error" : ""}`}
              rows={3}
              placeholder="Describe why this adjustment is being made…"
              value={form.reason}
              onChange={(e) => {
                setForm((f) => ({ ...f, reason: e.target.value }));
                setErrors((er) => ({ ...er, reason: undefined }));
              }}
            />
            {errors.reason && <span className="saf-error">{errors.reason}</span>}
          </div>

          <div className="saf-actions">
            <button type="button" className="saf-btn saf-btn--ghost" onClick={onCancel}>Cancel</button>
            <button
              type="submit"
              className={`saf-btn ${form.type === "REMOVE" ? "saf-btn--danger" : "saf-btn--primary"}`}
              disabled={loading || (newQty !== null && newQty < 0)}
            >
              {loading ? "Saving…" : `Confirm ${form.type === "ADD" ? "Addition" : "Removal"}`}
            </button>
          </div>
          {newQty !== null && newQty < 0 && (
            <p className="saf-neg-warn">⚠ Resulting quantity cannot be negative.</p>
          )}
        </form>
      </div>

      <style>{`
        .saf-overlay {
          position: fixed; inset: 0; background: rgba(10,14,20,0.72);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; z-index: 50; padding: 1rem;
        }
        .saf-card {
          background: #0f1623; border: 1px solid #1e2d45; border-radius: 14px;
          padding: 2rem; width: 100%; max-width: 460px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6); font-family: 'DM Sans', sans-serif;
        }
        .saf-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
        .saf-eyebrow { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #3b82f6; margin: 0 0 0.2rem; }
        .saf-title { font-size: 1.2rem; font-weight: 700; color: #e8edf5; margin: 0 0 0.1rem; }
        .saf-subtitle { font-size: 0.85rem; color: #8899b0; margin: 0; }
        .saf-close { background: none; border: none; color: #4a5568; font-size: 1rem; cursor: pointer; }
        .saf-close:hover { color: #e8edf5; }
        .saf-current {
          display: flex; align-items: center; gap: 0.75rem;
          background: #0a0e14; border: 1px solid #1e2d45; border-radius: 8px;
          padding: 0.75rem 1rem; margin-bottom: 1.25rem;
        }
        .saf-current-label { font-size: 0.72rem; text-transform: uppercase; color: #4a5568; letter-spacing: 0.08em; }
        .saf-current-qty { font-size: 1.1rem; font-weight: 700; color: #e8edf5; }
        .saf-arrow { color: #3b82f6; }
        .saf-new-qty { font-size: 1.1rem; font-weight: 700; color: #4ade80; }
        .saf-new-qty--neg { color: #f87171; }
        .saf-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
        .saf-label { font-size: 0.78rem; font-weight: 600; color: #8899b0; letter-spacing: 0.04em; }
        .saf-toggle { display: flex; gap: 0.5rem; }
        .saf-toggle-btn {
          flex: 1; padding: 0.55rem; border-radius: 8px; font-size: 0.85rem;
          font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit;
          background: #0a0e14; border: 1px solid #1e2d45; color: #8899b0;
        }
        .saf-toggle-btn--active { background: #1a2e4a; border-color: #3b82f6; color: #60a5fa; }
        .saf-toggle-btn--remove.saf-toggle-btn--active { background: #3a1a1a; border-color: #ef4444; color: #f87171; }
        .saf-input, .saf-textarea {
          background: #161f2e; border: 1px solid #1e2d45; border-radius: 8px;
          padding: 0.6rem 0.85rem; color: #e8edf5; font-size: 0.9rem;
          font-family: inherit; transition: border-color 0.15s; width: 100%; box-sizing: border-box;
        }
        .saf-input:focus, .saf-textarea:focus { outline: none; border-color: #3b82f6; }
        .saf-input--error { border-color: #ef4444 !important; }
        .saf-textarea { resize: vertical; }
        .saf-error { font-size: 0.75rem; color: #ef4444; }
        .saf-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
        .saf-btn {
          padding: 0.6rem 1.35rem; border-radius: 8px; font-size: 0.875rem;
          font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit;
        }
        .saf-btn--primary { background: #3b82f6; color: #fff; }
        .saf-btn--primary:hover:not(:disabled) { background: #2563eb; }
        .saf-btn--danger { background: #ef4444; color: #fff; }
        .saf-btn--danger:hover:not(:disabled) { background: #dc2626; }
        .saf-btn--ghost { background: transparent; color: #8899b0; border: 1px solid #1e2d45; }
        .saf-btn--ghost:hover { background: #1a2436; }
        .saf-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .saf-neg-warn { font-size: 0.78rem; color: #f87171; text-align: right; margin: 0.25rem 0 0; }
      `}</style>
    </div>
  );
}