"use client"

import { useEffect, useRef } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { useRouter } from "next/navigation"

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const router = useRouter()

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let controls: { stop: () => void } | undefined
    ;(async () => {
      try {
        controls = await reader.decodeFromVideoDevice(null, videoRef.current!, (result) => {
          const text = result?.getText()
          if (text) {
            controls?.stop()
            router.replace(`/amostra?codigo=${encodeURIComponent(text)}`)
          }
        })
      } catch (e) {
        console.error(e)
      }
    })()
    return () => controls?.stop()
  }, [router])

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 12, left: 12 }}>
        <button onClick={() => router.back()} style={{ padding: 8 }}>Cancelar</button>
      </div>
      <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, color: "#fff" }}>
        Aponte a câmera para o código de barras.
      </div>
    </div>
  )
}

