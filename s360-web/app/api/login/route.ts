import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}))
  if (!username || !password) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 400 })
  }

  const upstream = await fetch("https://api.s360web.com/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password }),
  })

  const data = await upstream.json().catch(() => ({}))
  const token = (data as any)?.token ?? (data as any)?.access_token

  if (!upstream.ok || !token) {
    return NextResponse.json({ error: "auth_failed", data }, { status: upstream.status || 400 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set("s360_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  })
  return res
}

