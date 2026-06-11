import { NextResponse, type NextRequest } from "next/server"

const publicPaths = ["/login", "/register", "/api/auth"]

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }

  const hasSession = request.cookies.getAll().some((c) =>
    c.name.startsWith("better-auth")
  )

  if (!hasSession && !pathname.startsWith("/api/")) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
