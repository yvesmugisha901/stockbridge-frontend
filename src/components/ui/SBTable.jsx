/**
 * SBTable — reusable table shell
 * Props:
 *   columns: [{ key, label, width? }]
 *   children: <tr> rows
 *   empty: string shown when no rows
 */
export default function SBTable({ columns, children, empty = "No records found." }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
      }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #dde0d4", background: "#f7f8f4" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: "10px 16px",
                  color: "#6b7260",
                  fontWeight: 500,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  whiteSpace: "nowrap",
                  width: col.width ?? "auto",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children ?? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  color: "#6b7260",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 13,
                }}
              >
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/** Convenience: a standard <tr> with hover */
export function SBRow({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: "1px solid #f0f1ec",
        cursor: onClick ? "pointer" : "default",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#f7f8f4" }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
    >
      {children}
    </tr>
  )
}

/** Standard <td> */
export function SBCell({ children, muted, style: extra }) {
  return (
    <td style={{
      padding: "12px 16px",
      color: muted ? "#6b7260" : "#1a1f0e",
      verticalAlign: "middle",
      ...extra,
    }}>
      {children}
    </td>
  )
}