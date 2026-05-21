import { NextResponse } from "next/server"
import { jwtDecode } from "jwt-decode"

const PUBLIC_PATHS = ["/login"]

const ROLE_PATHS = {
  STAFF:      "/staff",
  MANAGER:    "/manager",
  HO_ADMIN:   "/ho-admin",
  ACCOUNTANT: "/accountant",
  ADMIN:      "/admin",
}

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth_token")?.value

  if (PUBLIC_PATHS.includes(pathname)) {
    if (token) {
      try {
        const user = jwtDecode(token)
        const role = user.role?.replace("ROLE_", "")
        const home = ROLE_PATHS[role] || "/"
        return NextResponse.redirect(new URL(home, request.url))
      } catch {
        return NextResponse.next()
      }
    }
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}