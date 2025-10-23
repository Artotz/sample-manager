export type PlanilhaItem = {
  amostra: string
  dataEntrega: string
  compartimento: string
  chassi: string
  cliente: string
  horasEquipamento: string
  tipoOleo: string
  status: string
  dataColeta: string
  tecnico: string
}

export function toPlanilhaItem(apiData: any): PlanilhaItem {
  const numero: string = apiData?.numero ?? ""
  const cliente: string = apiData?.cliente?.nome ?? ""
  const compartimento: string = apiData?.coleta?.dadosColetaEquipamento?.compartimento?.nome ?? ""
  const chassi: string = apiData?.coleta?.dadosColetaEquipamento?.equipamento?.chassiSerie ?? ""

  const horasEquipamentoVal =
    apiData?.coleta?.dadosColetaEquipamento?.horasEquipamentoColeta ?? apiData?.coleta?.dadosColetaGeral?.horasOleo
  const horasEquipamento: string = horasEquipamentoVal != null ? String(horasEquipamentoVal) : ""

  const fabricante = apiData?.coleta?.dadosColetaGeral?.oleo?.fabricanteOleo?.nome
  const viscosidade = apiData?.coleta?.dadosColetaGeral?.oleo?.viscosidade?.nome
  const tipoOleo = [fabricante, viscosidade].filter(Boolean).join(" ")

  const status: string = apiData?.situacao ?? ""
  const dataColeta: string = apiData?.coleta?.dadosColetaGeral?.dataColeta ?? ""

  const entregaIso: string =
    apiData?.dataRecebimento ?? apiData?.dataEntradaLaboratorio ?? apiData?.dataFinalizacao ?? ""
  const dataEntrega = entregaIso ? formatDate(entregaIso) : ""

  const tecnico: string = apiData?.responsavelRegistro ?? "-"

  return {
    amostra: numero,
    dataEntrega,
    compartimento,
    chassi,
    cliente,
    horasEquipamento,
    tipoOleo,
    status,
    dataColeta,
    tecnico,
  }
}

export function planilhaToCsv(items: PlanilhaItem[]): string {
  const headers = [
    "Amostra",
    "Data de entrega",
    "Compartimento",
    "Chassi",
    "Cliente",
    "Horas do equipamento",
    "Tipo do óleo",
    "Status",
    "Data de coleta",
    "Técnico",
  ]
  const rows = items.map((i) =>
    [
      i.amostra,
      i.dataEntrega,
      i.compartimento,
      i.chassi,
      i.cliente,
      i.horasEquipamento,
      i.tipoOleo,
      i.status,
      i.dataColeta,
      i.tecnico,
    ]
      .map((v) => escapeCsv(v ?? ""))
      .join(","),
  )
  return [headers.join(","), ...rows].join("\n")
}

function escapeCsv(value: string) {
  const needsQuotes = [",", '"', "\n", "\r"].some((c) => value.includes(c))
  const escaped = value.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  } catch {
    return ""
  }
}

