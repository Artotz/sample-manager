"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error || `Falha ao autenticar (${res.status})`)
        return
      }
      router.replace("/amostra")
    } catch (e: any) {
      setError(e?.message ?? "Erro inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: "40px auto", padding: 16 }}>
      <h1>Login S360</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Usuário
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="senha"
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        {error ? <div style={{ color: "#c00" }}>{error}</div> : null}
        <button type="submit" disabled={loading} style={{ padding: 10 }}>
          {loading ? "Autenticando..." : "Entrar"}
        </button>
      </form>
    </div>
  )
}

