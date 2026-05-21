import { AuthProvider } from "@/lib/context/AuthContext"
import { Toaster } from "react-hot-toast"
import "./globals.css"

export const metadata = {
  title: "StockBridge",
  description: "Multi-branch inventory and transfer management",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                border: "1px solid #dde0d4",
                borderRadius: 0,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              },
              success: { iconTheme: { primary: "#3d7a2b", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}