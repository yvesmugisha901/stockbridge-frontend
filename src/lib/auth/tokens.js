/**
 * tokens.js — In-memory access token store
 *
 * The access token (15 min JWT) lives only in a JS variable — never written
 * to localStorage or a JS-readable cookie, so it can't be stolen by XSS.
 *
 * The refresh token is an httpOnly cookie set/cleared by Spring — JS never
 * touches it directly. The browser sends it automatically on /auth/refresh
 * and /auth/logout because credentials: "include" is used.
 */

import { jwtDecode } from "jwt-decode"

let _accessToken = null   // in-memory only

// ── Store / retrieve / clear ──────────────────────────────────────────────────

export function saveToken(token) {
  _accessToken = token
}

export function getToken() {
  return _accessToken
}

export function removeToken() {
  _accessToken = null
}

// ── User info from the access token ──────────────────────────────────────────

export function getUser() {
  if (!_accessToken) return null
  try {
    return jwtDecode(_accessToken)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  const user = getUser()
  if (!user) return false
  return user.exp * 1000 > Date.now()
}

/**
 * Returns true if the access token expires within the next 2 minutes.
 * The api client calls this before every request to decide whether to
 * proactively refresh instead of waiting for a 401.
 */
export function isTokenExpiringSoon() {
  const user = getUser()
  if (!user) return true
  const twoMinutes = 2 * 60 * 1000
  return user.exp * 1000 - Date.now() < twoMinutes
}