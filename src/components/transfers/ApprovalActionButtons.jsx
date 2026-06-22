"use client";
import { useState } from "react";

/**
 * ApprovalActionButtons
 * Approve / Reject buttons with an inline comments panel for rejections.
 * Used by Branch Manager (Level 1) and HO_ADMIN (Level 2).
 * FR-16, FR-17, FR-20
 *
 * Props:
 *   transferId  {string}
 *   level       {number}  - 1 (manager) | 2 (ho_admin)
 *   onApprove   {function} - called with { transferId, comments }
 *   onReject    {function} - called with { transferId, comments } (comments required)
 *   disabled    {boolean}
 */
export default function ApprovalActionButtons({
  transferId,
  level = 1,
  onApprove,
  onReject,
  disabled = false,
}) {
  const [mode, setMode] = useState(null); // null | "approve" | "reject"
  const [comments, setComments] = useState("");
  const [commentError, setCommentError] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirm() {
    if (mode === "reject" && !comments.trim()) {
      setCommentError("Rejection reason is required.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "approve") await onApprove?.({ transferId, comments });
      if (mode === "reject")  await onReject?.({ transferId, comments });
      setMode(null);
      setComments("");
    } finally {
      setLoading(false);
    }
  }

  function cancel() { setMode(null); setComments(""); setCommentError(""); }

  const levelLabel = level === 1 ? "Level 1 — Branch Manager" : "Level 2 — Head Office";

  /* ── Idle state ── */
  if (!mode) {
    return (
      <div className="aab-idle">
        <span className="aab-level">{levelLabel}</span>
        <div className="aab-btns">
          <button
            className="aab-btn aab-btn--reject"
            onClick={() => setMode("reject")}
            disabled={disabled}
          >
            ✕ Reject
          </button>
          <button
            className="aab-btn aab-btn--approve"
            onClick={() => setMode("approve")}
            disabled={disabled}
          >
            ✓ Approve
          </button>
        </div>
        <style>{AAB_STYLE}</style>
      </div>
    );
  }

  /* ── Confirmation panel ── */
  return (
    <div className={`aab-panel aab-panel--${mode}`}>
      <p className="aab-panel-title">
        {mode === "approve" ? "✓ Confirm Approval" : "✕ Confirm Rejection"}
      </p>
      <p className="aab-panel-sub">Transfer #{transferId}</p>

      <div className="aab-comment-field">
        <label className="aab-comment-label">
          {mode === "reject" ? "Rejection Reason *" : "Comments (optional)"}
        </label>
        <textarea
          className={`aab-textarea ${commentError ? "aab-textarea--error" : ""}`}
          rows={3}
          placeholder={mode === "reject" ? "State the reason for rejection…" : "Optional comments…"}
          value={comments}
          onChange={(e) => { setComments(e.target.value); setCommentError(""); }}
        />
        {commentError && <span className="aab-c-error">{commentError}</span>}
      </div>

      <div className="aab-confirm-btns">
        <button className="aab-btn aab-btn--ghost" onClick={cancel} disabled={loading}>
          Back
        </button>
        <button
          className={`aab-btn ${mode === "approve" ? "aab-btn--approve" : "aab-btn--reject"}`}
          onClick={confirm}
          disabled={loading}
        >
          {loading ? "Processing…" : mode === "approve" ? "Confirm Approval" : "Confirm Rejection"}
        </button>
      </div>

      <style>{AAB_STYLE}</style>
    </div>
  );
}

const AAB_STYLE = `
  .aab-idle { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
  .aab-level { font-size: 0.72rem; color: #8899b0; text-transform: uppercase; letter-spacing: 0.08em; font-family: 'DM Sans', sans-serif; }
  .aab-btns  { display: flex; gap: 0.5rem; }
  .aab-btn {
    padding: 0.5rem 1.1rem; border-radius: 8px; font-size: 0.85rem;
    font-weight: 600; cursor: pointer; border: none; transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
  }
  .aab-btn--approve { background: #166534; color: #4ade80; border: 1px solid #4ade8044; }
  .aab-btn--approve:hover:not(:disabled) { background: #14532d; }
  .aab-btn--reject  { background: #3a1a1a; color: #f87171; border: 1px solid #f8717144; }
  .aab-btn--reject:hover:not(:disabled)  { background: #450a0a; }
  .aab-btn--ghost   { background: transparent; color: #8899b0; border: 1px solid #1e2d45; }
  .aab-btn--ghost:hover { background: #1a2436; }
  .aab-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .aab-panel {
    border-radius: 10px; padding: 1.1rem; font-family: 'DM Sans', sans-serif;
  }
  .aab-panel--approve { background: #0d1f12; border: 1px solid #4ade8033; }
  .aab-panel--reject  { background: #1a0d0d; border: 1px solid #f8717133; }
  .aab-panel-title { font-size: 0.9rem; font-weight: 700; color: #e8edf5; margin: 0 0 0.15rem; }
  .aab-panel-sub   { font-size: 0.75rem; color: #8899b0; margin: 0 0 0.85rem; font-family: monospace; }
  .aab-comment-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.85rem; }
  .aab-comment-label { font-size: 0.75rem; font-weight: 600; color: #8899b0; }
  .aab-textarea {
    background: #161f2e; border: 1px solid #1e2d45; border-radius: 7px;
    padding: 0.55rem 0.8rem; color: #e8edf5; font-size: 0.875rem;
    font-family: inherit; resize: vertical; width: 100%; box-sizing: border-box;
  }
  .aab-textarea:focus { outline: none; border-color: #3b82f6; }
  .aab-textarea--error { border-color: #ef4444; }
  .aab-c-error { font-size: 0.72rem; color: #ef4444; }
  .aab-confirm-btns { display: flex; justify-content: flex-end; gap: 0.5rem; }
`;