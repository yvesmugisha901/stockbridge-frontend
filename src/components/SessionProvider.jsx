"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { restoreSession } from "@/lib/api/client"
import { useAuthContext } from "@/lib/context/AuthContext"
import { getUser } from "@/lib/auth/tokens"

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"]

export default function SessionProvider({ children }) {
  const pathname  = usePathname()
  const isPublic  = PUBLIC_PATHS.some((p) => pathname?.startsWith(p))
  const { setUser } = useAuthContext()

  const [ready, setReady] = useState(isPublic)

  useEffect(() => {
    if (isPublic) {
      setReady(true)
      return
    }

    restoreSession().then((restored) => {
      if (!restored) {
        window.location.href = "/login"
      } else {
        // Restore AuthContext user from the freshly-loaded access token
        const user = getUser()
        if (user) setUser(user)
        setReady(true)
      }
    })
  }, [isPublic])

  if (!ready) return null

  return children
}

