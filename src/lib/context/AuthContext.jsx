"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { getUser, isAuthenticated, removeToken } from "@/lib/auth/session"

const AuthContext = createContext(null)

function normalizeUser(raw) {
  if (!raw) return null
  return {
    ...raw,
    role: raw.role?.replace("ROLE_", "") ?? raw.role,
  }
}

// Read user from token synchronously so it's available on the very first render.
// This prevents branchName/fullName from being undefined before useEffect fires.
function getInitialUser() {
  if (typeof window === "undefined") return null  // SSR guard
  if (!isAuthenticated()) return null
  return normalizeUser(getUser())
}

export function AuthProvider({ children }) {
  const [user, setUserRaw] = useState(getInitialUser)  // ← runs once synchronously
  const [loading, setLoading] = useState(true)

  function setUser(raw) {
    setUserRaw(normalizeUser(raw))
  }

  useEffect(() => {
    // Re-read on mount in case the cookie changed since SSR
    if (isAuthenticated()) {
      setUser(getUser())
    } else {
      setUserRaw(null)
    }
    setLoading(false)
  }, [])

  function logout() {
    removeToken()
    setUserRaw(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}