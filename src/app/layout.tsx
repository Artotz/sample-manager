export const metadata = {
  title: "S360 Web",
  description: "Consulta de amostras S360",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>{children}</body>
    </html>
  )
}

