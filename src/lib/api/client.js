/**
 * api/client.js
 */

import { getToken, saveToken, removeToken, isTokenExpiringSoon } from "@/lib/auth/tokens"

const BASE = process.env.NEXT_PUBLIC_API_URL

// ── Single in-flight refresh promise (prevents parallel refresh storms) ──────
let refreshPromise = null

/**
 * Attempts to get a new access token using the httpOnly refresh cookie.
 * Does NOT redirect — callers decide what to do on failure.
 */
async function doRefresh() {
  if (refreshPromise) return refreshPromise

  refreshPromise = fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Refresh failed")
      const data = await res.json()
      saveToken(data.token)
      return data.token
    })
    .catch((err) => {
      removeToken()
      throw err          // let the caller handle redirect
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

/** Redirect to login — only called from authenticated contexts, never from /login itself */
function redirectToLogin() {
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login"
  }
}

// ── Core request ──────────────────────────────────────────────────────────────

async function request(path, options = {}, _retry = false) {
  // Proactively refresh if token is about to expire
  if (!_retry && isTokenExpiringSoon()) {
    try { await doRefresh() } catch { redirectToLogin(); return null }
  }

  const token = getToken()
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  // Silent refresh on 401 — try once
  if (res.status === 401 && !_retry) {
    try {
      await doRefresh()
      return request(path, options, true)
    } catch {
      redirectToLogin()
      return null
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || "Something went wrong")
  }

  if (res.status === 204) return null
  return res.json()
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: "PUT",    body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: "DELETE" }),
}

/**
 * Call on app startup to restore the in-memory access token from the
 * httpOnly cookie. Returns true if session was restored, false if not
 * (unauthenticated — caller should redirect to /login if needed).
 */
export async function restoreSession() {
  try {
    await doRefresh()
    return true
  } catch {
    return false        // no redirect here — SessionProvider decides
  }
}
