export default function AuthLayout({ children }) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#f7f8f4" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(61,122,43,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,122,43,0.055) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(61,122,43,0.07) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 w-full flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  )
}