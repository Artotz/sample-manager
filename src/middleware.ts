import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("s360_token")?.value
  const path = req.nextUrl.pathname
  const isProtected = path.startsWith("/amostra") || path.startsWith("/planilha")
  if (isProtected && !token) {
    const url = new URL("/login", req.url)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/amostra/:path*", "/planilha/:path*"],
}

