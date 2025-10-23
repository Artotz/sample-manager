import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get("s360_token")?.value
  redirect(token ? "/amostra" : "/login")
}
