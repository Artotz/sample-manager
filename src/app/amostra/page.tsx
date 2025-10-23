"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PlanilhaItem, toPlanilhaItem } from "@/lib/planilha"

const K_PLANILHA = "s360_planilha"

export default function AmostraPage() {
  const router = useRouter()
  const search = useSearchParams()
  const [numero, setNumero] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const codigo = search.get("codigo")
    if (codigo) {
      setNumero(codigo)
      consultar(codigo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function consultar(n?: string) {
    const num = n ?? numero
    setError(null)
    setResult(null)
    if (!num) {
      setError("Informe o número da amostra ou leia o código de barras.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/amostra?numero=${encodeURIComponent(num)}`)
      if (!res.ok) {
        setError(`Erro ao consultar (${res.status})`)
        return
      }
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e?.message ?? "Erro inesperado")
    } finally {
      setLoading(false)
    }
  }

  function addToPlanilha() {
    if (!result) return
    const item = toPlanilhaItem(result)
    try {
      const raw = localStorage.getItem(K_PLANILHA)
      const list: PlanilhaItem[] = raw ? JSON.parse(raw) : []
      const exists = list.some((x) => x?.amostra === item.amostra)
      const next = exists ? list : [...list, item]
      localStorage.setItem(K_PLANILHA, JSON.stringify(next))
    } catch {
      localStorage.setItem(K_PLANILHA, JSON.stringify([item]))
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h1>Consulta de Amostra</h1>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <label style={{ flex: 1 }}>
          Número da amostra
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Ex: 123456789"
            style={{ width: "100%", padding: 8 }}
          />
        </label>
        <button onClick={() => consultar()} disabled={loading} style={{ padding: 10, minWidth: 120 }}>
          {loading ? "Consultando..." : "Consultar"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => router.push("/scan")} style={{ padding: 10 }}>Ler código</button>
        <button onClick={addToPlanilha} disabled={!result} style={{ padding: 10 }}>Adicionar à planilha</button>
        <button onClick={() => router.push("/planilha")} style={{ padding: 10 }}>Ver planilha</button>
      </div>

      {error ? <div style={{ color: "#c00", marginBottom: 12 }}>{error}</div> : null}
      {result ? (
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 6, overflowX: "auto" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  )
}

