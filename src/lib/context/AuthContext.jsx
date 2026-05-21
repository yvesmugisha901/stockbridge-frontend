"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { getUser, isAuthenticated, removeToken } from "@/lib/auth/session"

const AuthContext = createContext(null)

// JWT stores role as "ROLE_ADMIN" but the app uses "ADMIN" everywhere.
// This strips the prefix so user.role always matches ROLES.* constants.
function normalizeUser(raw) {
  if (!raw) return null
  return {
    ...raw,
    role: raw.role?.replace("ROLE_", "") ?? raw.role,
  }
}

export function AuthProvider({ children }) {
  const [user, setUserRaw] = useState(null)
  const [loading, setLoading] = useState(true)

  // Wrap setUser so anything stored via setUser is also normalized
  function setUser(raw) {
    setUserRaw(normalizeUser(raw))
  }

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser())   // getUser() decodes JWT → may have "ROLE_ADMIN", gets normalized here
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