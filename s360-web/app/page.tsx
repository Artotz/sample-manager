import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function Page() {
  const token = cookies().get("s360_token")?.value
  redirect(token ? "/amostra" : "/login")
}

