"use client"

import { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/browser"
import { useRouter } from "next/navigation"

export default function ScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let controls: { stop: () => void } | undefined

    async function start() {
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            // Some browsers accept focusMode via advanced constraints
            // @ts-expect-error non-standard constraint
            advanced: [{ focusMode: "continuous" }],
          },
          audio: false,
        }

        controls = await reader.decodeFromConstraints(
          constraints as any,
          videoRef.current!,
          (result) => {
            const text = result?.getText?.()
            if (text) {
              controls?.stop()
              router.replace(`/amostra?codigo=${encodeURIComponent(text)}`)
            }
          },
        )

        const stream = (videoRef.current as any)?.srcObject as MediaStream | undefined
        const track = stream?.getVideoTracks?.()[0]
        const capabilities = track?.getCapabilities?.()

        const adv: any[] = []
        if (capabilities?.focusMode && (capabilities.focusMode as any[]).includes("continuous")) {
          adv.push({ focusMode: "continuous" })
        }
        if (capabilities?.zoom) {
          const min = (capabilities as any).zoom?.min ?? 1
          const max = (capabilities as any).zoom?.max ?? 1
          const target = Math.min(max, Math.max(min, 2))
          adv.push({ zoom: target })
        }
        if (adv.length && track?.applyConstraints) {
          await track.applyConstraints({ advanced: adv } as any)
          setHint("Autofocus enabled when supported.")
        }
      } catch (e) {
        console.error(e)
        setHint("Failed to start camera/reader. Check permissions.")
      }
    }

    start()
    return () => {
      try {
        controls?.stop()
      } catch {}
    }
  }, [router])

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", top: 12, left: 12 }}>
        <button onClick={() => router.back()} style={{ padding: 8 }}>Back</button>
      </div>
      <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, color: "#fff" }}>
        {hint || "Point the camera at the barcode."}
      </div>
    </div>
  )
}

