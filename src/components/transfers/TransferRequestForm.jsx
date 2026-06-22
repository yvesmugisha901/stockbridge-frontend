"use client";
import { useState } from "react";

/**
 * TransferRequestForm
 * Staff/Manager submits a new inter-branch stock transfer request.
 * FR-14, FR-15: Submit Transfer Request + Approval Routing Logic
 *
 * Props:
 *   currentBranch  {object}   - { id, name } — pre-fills source branch
 *   branches       {Array}    - [{ id, name }]
 *   items          {Array}    - [{ id, name, code, unit, quantity, branch }]
 *   thresholds     {object}   - { quantity: number, value: number } for routing logic display
 *   onSubmit       {function} - called with request payload
 *   onCancel       {function}
 */
export default function TransferRequestForm({
  currentBranch,
  branches = [],
  items = [],
  thresholds = { quantity: 50, value: 500000 },
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    sourceBranchId: currentBranch?.id || "",
    destinationBranchId: "",
    itemId: "",
    quantity: "",
    justification: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const selectedItem = items.find((i) => String(i.id) === String(form.itemId));
  const sourceItems = items.filter(
    (i) => String(i.branch?.id ?? i.branchId) === String(form.sourceBranchId)
  );

  const numQty = Number(form.quantity);
  const approvalTier =
    numQty > 0 && selectedItem
      ? numQty >= thresholds.quantity
        ? "dual"
        : "single"
      : null;

  function validate() {
    const e = {};
    if (!form.sourceBranchId) e.sourceBranchId = "Select source branch.";
    if (!form.destinationBranchId) e.destinationBranchId = "Select destination branch.";
    if (form.sourceBranchId === form.destinationBranchId)
      e.destinationBranchId = "Source and destination must differ.";
    if (!form.itemId) e.itemId = "Select an item.";
    if (!form.quantity || isNaN(form.quantity) || numQty <= 0)
      e.quantity = "Enter a valid positive quantity.";
    if (selectedItem && numQty > selectedItem.quantity)
      e.quantity = `Only ${selectedItem.quantity} ${selectedItem.unit} available.`;
    if (!form.justification.trim()) e.justification = "Justification is required.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await onSubmit?.({ ...form, quantity: numQty });
    } finally {
      setLoading(false);
    }
  }

  function f(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  }

  return (
    <div className="trf-overlay">
      <div className="trf-card">
        <div className="trf-header">
          <div>
            <p className="trf-eyebrow">New Request</p>
            <h2 className="trf-title">Stock Transfer</h2>
          </div>
          <button className="trf-close" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Route row */}
          <div className="trf-route-row">
            <div className="trf-field trf-field--grow">
              <label className="trf-label">From Branch *</label>
              <select
                className={`trf-select ${errors.sourceBranchId ? "trf-input--error" : ""}`}
                value={form.sourceBranchId}
                onChange={(e) => { f("sourceBranchId", e.target.value); f("itemId", ""); }}
              >
                <option value="">Select…</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.sourceBranchId && <span className="trf-error">{errors.sourceBranchId}</span>}
            </div>
            <div className="trf-route-arrow">→</div>
            <div className="trf-field trf-field--grow">
              <label className="trf-label">To Branch *</label>
              <select
                className={`trf-select ${errors.destinationBranchId ? "trf-input--error" : ""}`}
                value={form.destinationBranchId}
                onChange={(e) => f("destinationBranchId", e.target.value)}
              >
                <option value="">Select…</option>
                {branches
                  .filter((b) => String(b.id) !== String(form.sourceBranchId))
                  .map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.destinationBranchId && <span className="trf-error">{errors.destinationBranchId}</span>}
            </div>
          </div>

          {/* Item */}
          <div className="trf-field">
            <label className="trf-label">Item *</label>
            <select
              className={`trf-select ${errors.itemId ? "trf-input--error" : ""}`}
              value={form.itemId}
              onChange={(e) => f("itemId", e.target.value)}
              disabled={!form.sourceBranchId}
            >
              <option value="">
                {form.sourceBranchId ? "Select item…" : "Select source branch first"}
              </option>
              {sourceItems.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.code}) — {i.quantity} {i.unit} available
                </option>
              ))}
            </select>
            {errors.itemId && <span className="trf-error">{errors.itemId}</span>}
          </div>

          {/* Quantity */}
          <div className="trf-field">
            <label className="trf-label">Quantity *</label>
            <div className="trf-qty-row">
              <input
                type="number"
                min="1"
                className={`trf-input ${errors.quantity ? "trf-input--error" : ""}`}
                placeholder="0"
                value={form.quantity}
                onChange={(e) => f("quantity", e.target.value)}
              />
              {selectedItem && (
                <span className="trf-unit">{selectedItem.unit}</span>
              )}
            </div>
            {errors.quantity && <span className="trf-error">{errors.quantity}</span>}
          </div>

          {/* Approval tier indicator */}
          {approvalTier && (
            <div className={`trf-tier trf-tier--${approvalTier}`}>
              {approvalTier === "single" ? (
                <>✓ Manager approval only (below threshold)</>
              ) : (
                <>⚑ Requires Manager + Head Office approval (quantity ≥ {thresholds.quantity})</>
              )}
            </div>
          )}

          {/* Justification */}
          <div className="trf-field">
            <label className="trf-label">Justification *</label>
            <textarea
              className={`trf-textarea ${errors.justification ? "trf-input--error" : ""}`}
              rows={3}
              placeholder="Explain why this transfer is needed…"
              value={form.justification}
              onChange={(e) => f("justification", e.target.value)}
            />
            {errors.justification && <span className="trf-error">{errors.justification}</span>}
          </div>

          <div className="trf-actions">
            <button type="button" className="trf-btn trf-btn--ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="trf-btn trf-btn--primary" disabled={loading}>
              {loading ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .trf-overlay {
          position: fixed; inset: 0; background: rgba(10,14,20,0.72);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; z-index: 50; padding: 1rem;
        }
        .trf-card {
          background: #0f1623; border: 1px solid #1e2d45; border-radius: 14px;
          padding: 2rem; width: 100%; max-width: 520px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.6); font-family: 'DM Sans', sans-serif;
          max-height: 90vh; overflow-y: auto;
        }
        .trf-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .trf-eyebrow { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #3b82f6; margin: 0 0 0.2rem; }
        .trf-title { font-size: 1.25rem; font-weight: 700; color: #e8edf5; margin: 0; }
        .trf-close { background: none; border: none; color: #4a5568; font-size: 1rem; cursor: pointer; }
        .trf-close:hover { color: #e8edf5; }
        .trf-route-row { display: flex; gap: 0.5rem; align-items: flex-end; margin-bottom: 1.1rem; }
        .trf-route-arrow { color: #3b82f6; font-size: 1.1rem; padding-bottom: 0.7rem; flex-shrink: 0; }
        .trf-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.1rem; }
        .trf-field--grow { flex: 1; }
        .trf-label { font-size: 0.78rem; font-weight: 600; color: #8899b0; letter-spacing: 0.04em; }
        .trf-select, .trf-input, .trf-textarea {
          background: #161f2e; border: 1px solid #1e2d45; border-radius: 8px;
          padding: 0.6rem 0.85rem; color: #e8edf5; font-size: 0.875rem;
          font-family: inherit; width: 100%; box-sizing: border-box; transition: border-color 0.15s;
        }
        .trf-select:focus, .trf-input:focus, .trf-textarea:focus { outline: none; border-color: #3b82f6; }
        .trf-select:disabled { opacity: 0.5; }
        .trf-input--error { border-color: #ef4444 !important; }
        .trf-textarea { resize: vertical; }
        .trf-error { font-size: 0.75rem; color: #ef4444; }
        .trf-qty-row { display: flex; align-items: center; gap: 0.5rem; }
        .trf-qty-row .trf-input { flex: 1; }
        .trf-unit { font-size: 0.8rem; color: #8899b0; white-space: nowrap; }
        .trf-tier {
          padding: 0.6rem 0.9rem; border-radius: 8px; font-size: 0.8rem;
          font-weight: 600; margin-bottom: 1.1rem;
        }
        .trf-tier--single { background: #1a3a2a; color: #4ade80; border: 1px solid #4ade8044; }
        .trf-tier--dual   { background: #3a2a0a; color: #fbbf24; border: 1px solid #fbbf2444; }
        .trf-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
        .trf-btn {
          padding: 0.6rem 1.35rem; border-radius: 8px; font-size: 0.875rem;
          font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: inherit;
        }
        .trf-btn--primary { background: #3b82f6; color: #fff; }
        .trf-btn--primary:hover:not(:disabled) { background: #2563eb; }
        .trf-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .trf-btn--ghost { background: transparent; color: #8899b0; border: 1px solid #1e2d45; }
        .trf-btn--ghost:hover { background: #1a2436; }
      `}</style>
    </div>
  );
}