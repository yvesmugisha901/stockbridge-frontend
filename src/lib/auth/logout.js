/**
 * logout.js
 * Tells Spring to revoke the refresh token and clear the httpOnly cookie,
 * then redirects to /login.
 *
 * Token clearing and state reset are handled by the caller (AuthContext)
 * before this is called, so the UI updates immediately even if the
 * network request is slow.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL

export async function logout() {
  await fetch(`${BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",   // sends the httpOnly refresh_token cookie
  }).catch(() => {})           // best-effort — redirect regardless

  window.location.href = "/login"
}
