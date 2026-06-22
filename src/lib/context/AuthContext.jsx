"use client"
import { createContext, useContext, useState } from "react"
import { getUser, saveToken, removeToken } from "@/lib/auth/tokens"
import { logout as doLogout } from "@/lib/auth/logout"

const AuthContext = createContext(null)

function normalizeUser(raw) {
  if (!raw) return null
  return {
    ...raw,
    role: raw.role?.replace("ROLE_", "") ?? raw.role,
  }
}

export function AuthProvider({ children }) {
  const [user, setUserRaw] = useState(() => normalizeUser(getUser()))

  function setUser(raw) {
    setUserRaw(normalizeUser(raw))
  }

  async function logout() {
    setUserRaw(null)   // clear UI immediately
    removeToken()      // clear in-memory access token
    await doLogout()   // calls Spring /auth/logout to revoke + clear cookie, then redirects
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  return useContext(AuthContext)
}
