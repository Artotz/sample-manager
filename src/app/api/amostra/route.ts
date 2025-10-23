import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const numero = url.searchParams.get("numero")
  const cookieStore = await cookies()
  const token = cookieStore.get("s360_token")?.value
  if (!token) return NextResponse.json({ error: "unauthenticated" }, { status: 401 })
  if (!numero) return NextResponse.json({ error: "missing_numero" }, { status: 400 })

  const upstream = await fetch(
    "https://api.s360web.com/api/v1/amostra/view?numeroAmostra=" + encodeURIComponent(numero),
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const data = await upstream.json().catch(() => ({}))
  return NextResponse.json(data, { status: upstream.status || 200 })
}
