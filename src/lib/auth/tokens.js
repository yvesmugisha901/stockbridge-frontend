// src/lib/auth/tokens.js
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

const TOKEN_KEY = "auth_token"

export function saveToken(token) {
  Cookies.set(TOKEN_KEY, token, {
    expires: 1,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
}

export function getToken() {
  return Cookies.get(TOKEN_KEY)
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY)
}

export function getUser() {
  const token = getToken()
  if (!token) return null
  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}

export function isAuthenticated() {
  const user = getUser()
  if (!user) return false
  return user.exp * 1000 > Date.now()
}