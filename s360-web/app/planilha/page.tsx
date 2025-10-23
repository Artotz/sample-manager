"use client"

import { useEffect, useMemo, useState } from "react"
import { PlanilhaItem, planilhaToCsv } from "@/lib/planilha"

const K_PLANILHA = "s360_planilha"

export default function PlanilhaPage() {
  const [items, setItems] = useState<PlanilhaItem[]>([])
  const [showCsv, setShowCsv] = useState(false)

  function loadItems() {
    try {
      const raw = localStorage.getItem(K_PLANILHA)
      const list: PlanilhaItem[] = raw ? JSON.parse(raw) : []
      setItems(list)
    } catch {
      setItems([])
    }
  }

  function clearItems() {
    localStorage.setItem(K_PLANILHA, JSON.stringify([]))
    setItems([])
  }

  useEffect(() => {
    loadItems()
  }, [])

  const csv = useMemo(() => planilhaToCsv(items), [items])

  function downloadCsv() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "planilha-amostras.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
      <h1>Planilha de Amostras</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={loadItems} style={{ padding: 10 }}>Atualizar</button>
        <button onClick={() => setShowCsv((s) => !s)} style={{ padding: 10 }}>
          {showCsv ? "Ocultar CSV" : "Exibir CSV"}
        </button>
        <button onClick={downloadCsv} style={{ padding: 10 }}>Baixar CSV</button>
        <button onClick={clearItems} style={{ padding: 10 }}>Limpar planilha</button>
        <button onClick={() => window.print()} style={{ padding: 10 }}>Imprimir</button>
      </div>

      {!showCsv ? (
        <div style={{ overflowX: "auto", border: "1px solid #eee" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Amostra","Data de entrega","Compartimento","Chassi","Cliente","Horas do equipamento","Tipo do óleo","Status","Data de coleta","Técnico"].map((h) => (
                  <th key={h} style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.amostra}>
                  {[i.amostra,i.dataEntrega,i.compartimento,i.chassi,i.cliente,i.horasEquipamento,i.tipoOleo,i.status,i.dataColeta,i.tecnico].map((v, idx) => (
                    <td key={idx} style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 6, overflowX: "auto" }}>{csv}</pre>
      )}
    </div>
  )
}

