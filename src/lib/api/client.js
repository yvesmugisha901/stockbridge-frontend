import { getToken } from "@/lib/auth/session"

const BASE = process.env.NEXT_PUBLIC_API_URL

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }))
    throw new Error(error.message || "Something went wrong")
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    (path, body)   => request(path, { method: "PUT",    body: JSON.stringify(body) }),
  patch:  (path, body)   => request(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: "DELETE" }),
}