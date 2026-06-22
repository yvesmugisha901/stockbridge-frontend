import ChangePasswordForm from "@/components/auth/ChangePasswordForm"

export default function ChangePasswordPage() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');`}</style>

      <div style={{ width: "100%", maxWidth: 420, fontFamily: "'DM Mono', monospace" }}>

        {/* Header */}
        <div style={{
          background: "#fff", border: "1px solid #dde0d4",
          borderBottom: "none", padding: "28px 32px 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
            <span style={{
              width: 30, height: 30, background: "#3d7a2b", flexShrink: 0,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 10, fontWeight: 500,
              clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
            }}>SB</span>
            <span style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 18, color: "#1a1f0e" }}>
              StockBridge
            </span>
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 26, lineHeight: 1.2, color: "#1a1f0e", margin: "0 0 6px",
          }}>
            Change your password
          </h1>
          <p style={{ fontSize: 12, color: "#6b7260", margin: 0 }}>
            Choose a strong password with at least 6 characters
          </p>
        </div>

        <ChangePasswordForm />
      </div>
    </>
  )
}