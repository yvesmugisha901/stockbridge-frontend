"use client";

/**
 * LowStockAlert
 * Displays a dismissible banner or compact badge for low/out-of-stock items.
 * FR-12: Low Stock Alerts
 *
 * Props:
 *   items      {Array}    - items where quantity <= minThreshold
 *   variant    {string}   - "banner" (full width) | "badge" (compact count)
 *   onDismiss  {function} - called when banner is closed
 *   onViewAll  {function} - called when "View All" is clicked
 */
export default function LowStockAlert({ items = [], variant = "banner", onDismiss, onViewAll }) {
  const outOfStock = items.filter((i) => (i.quantity - (i.reserved || 0)) <= 0);
  const lowStock   = items.filter((i) => {
    const avail = i.quantity - (i.reserved || 0);
    return avail > 0 && avail <= i.minThreshold;
  });

  if (items.length === 0) return null;

  /* ── Badge variant ── */
  if (variant === "badge") {
    return (
      <div className="lsa-badge-group">
        {outOfStock.length > 0 && (
          <span className="lsa-badge lsa-badge--out" title="Out of Stock">
            ⬤ {outOfStock.length} Out
          </span>
        )}
        {lowStock.length > 0 && (
          <span className="lsa-badge lsa-badge--low" title="Low Stock">
            ⬤ {lowStock.length} Low
          </span>
        )}
        <style>{`
          .lsa-badge-group { display: inline-flex; gap: 0.4rem; }
          .lsa-badge {
            font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem;
            border-radius: 20px; font-family: 'DM Sans', sans-serif;
            display: inline-flex; align-items: center; gap: 0.3rem;
          }
          .lsa-badge--out { background: #3a1a1a; color: #f87171; }
          .lsa-badge--low { background: #3a2a0a; color: #fbbf24; }
        `}</style>
      </div>
    );
  }

  /* ── Banner variant ── */
  return (
    <div className="lsa-banner">
      <div className="lsa-icon">⚠</div>
      <div className="lsa-content">
        <p className="lsa-title">
          {outOfStock.length > 0 && (
            <span className="lsa-count lsa-count--out">{outOfStock.length} item{outOfStock.length !== 1 ? "s" : ""} out of stock</span>
          )}
          {outOfStock.length > 0 && lowStock.length > 0 && " · "}
          {lowStock.length > 0 && (
            <span className="lsa-count lsa-count--low">{lowStock.length} item{lowStock.length !== 1 ? "s" : ""} running low</span>
          )}
        </p>
        <ul className="lsa-list">
          {[...outOfStock.slice(0, 2), ...lowStock.slice(0, 2)].map((item) => {
            const avail = item.quantity - (item.reserved || 0);
            const isOut = avail <= 0;
            return (
              <li key={item.id} className="lsa-list-item">
                <span className="lsa-item-name">{item.name}</span>
                <span className={`lsa-item-qty ${isOut ? "lsa-item-qty--out" : "lsa-item-qty--low"}`}>
                  {isOut ? "0" : avail} / {item.minThreshold} min
                </span>
                {item.branch && <span className="lsa-item-branch">· {item.branch}</span>}
              </li>
            );
          })}
          {items.length > 4 && (
            <li className="lsa-more">+{items.length - 4} more</li>
          )}
        </ul>
      </div>
      <div className="lsa-actions">
        {onViewAll && (
          <button className="lsa-view-btn" onClick={onViewAll}>View All</button>
        )}
        {onDismiss && (
          <button className="lsa-dismiss" onClick={onDismiss} aria-label="Dismiss">✕</button>
        )}
      </div>

      <style>{`
        .lsa-banner {
          display: flex; align-items: flex-start; gap: 1rem;
          background: #1a1500; border: 1px solid #fbbf2444;
          border-left: 4px solid #fbbf24;
          border-radius: 10px; padding: 1rem 1.25rem;
          font-family: 'DM Sans', sans-serif;
        }
        .lsa-icon { font-size: 1.1rem; color: #fbbf24; flex-shrink: 0; line-height: 1.4; }
        .lsa-content { flex: 1; }
        .lsa-title { margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600; color: #e8edf5; }
        .lsa-count { }
        .lsa-count--out { color: #f87171; }
        .lsa-count--low { color: #fbbf24; }
        .lsa-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.25rem; }
        .lsa-list-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; }
        .lsa-item-name { color: #cbd5e1; font-weight: 500; }
        .lsa-item-qty { font-size: 0.75rem; font-family: monospace; }
        .lsa-item-qty--out { color: #f87171; }
        .lsa-item-qty--low { color: #fbbf24; }
        .lsa-item-branch { color: #4a5568; font-size: 0.72rem; }
        .lsa-more { font-size: 0.75rem; color: #4a5568; margin-top: 0.1rem; }
        .lsa-actions { display: flex; align-items: flex-start; gap: 0.5rem; flex-shrink: 0; }
        .lsa-view-btn {
          background: transparent; border: 1px solid #fbbf2466; color: #fbbf24;
          border-radius: 6px; padding: 0.3rem 0.8rem; font-size: 0.78rem;
          font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .lsa-view-btn:hover { background: #fbbf2422; }
        .lsa-dismiss {
          background: none; border: none; color: #4a5568;
          cursor: pointer; font-size: 0.85rem; padding: 0.2rem;
          transition: color 0.15s;
        }
        .lsa-dismiss:hover { color: #e8edf5; }
      `}</style>
    </div>
  );
}