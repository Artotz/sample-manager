"use client"

import { useEffect, useRef, useState } from "react"
import Quagga from "@ericblade/quagga2"
import { useRouter } from "next/navigation"

export default function ScanPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hint, setHint] = useState<string | null>(null)
  const area = { top: 25, right: 10, left: 10, bottom: 25 }

  useEffect(() => {
    let stopped = false

    async function start() {
      try {
        setHint(null)
        const ua = navigator.userAgent || ""
        const isIOS = /iP(hone|od|ad)/.test(ua) || (/(Macintosh).*Version\/\d+.*Safari/.test(ua) && (navigator as any).maxTouchPoints > 1)
        // Aguarda 2 frames para garantir layout do container
        await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())))
        if (!containerRef.current) {
          setHint("Inicializando câmera...")
          return
        }
        await new Promise<void>((resolve, reject) => {
          Quagga.init(
            ({
              inputStream: {
                name: "Live",
                type: "LiveStream",
                target: containerRef.current ?? undefined,
                constraints: {
                  facingMode: "environment",
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                  advanced: [{ focusMode: "continuous" as any }],
                } as any,
                // Garante que Quagga tenha uma área válida para calcular
                area: { top: "25%", right: "10%", left: "10%", bottom: "25%" },
              },
              decoder: {
                // Otimizado para 1D Code 128
                readers: ["code_128_reader"],
              },
              locate: true,
              locator: { patchSize: "medium", halfSample: true } as any,
              frequency: 10 as any,
              // Evita problemas com WebWorkers no iOS
              numOfWorkers: isIOS ? 0 : undefined,
              // Desativa desenhos/overlays internos para evitar acessos nulos
              draw: {
                box: false,
                boxes: false,
                canvas: false,
                labels: false,
              } as any,
            }) as any,
            (err) => {
              if (err) return reject(err)
              try {
                Quagga.start()
                resolve()
              } catch (e) {
                reject(e)
              }
            },
          )
        })

        setHint("Aponte a câmera para o código de barras.")

        let handled = false
        const onDetected = (data: any) => {
          if (handled) return
          const text: string | undefined = data?.codeResult?.code
          if (text && text.length > 0) {
            handled = true
            try {
              Quagga.stop()
            } catch {}
            if (!stopped) {
              router.replace(`/amostra?codigo=${encodeURIComponent(text)}`)
            }
          }
        }

        const onProcessed = (_: any) => {
          // noop: could show boxes on overlay if needed
        }

        Quagga.onDetected(onDetected)
        Quagga.onProcessed(onProcessed)

        // Tentar ativar zoom/autofoco quando disponível
        try {
          const track = Quagga.CameraAccess.getActiveTrack?.()
          const caps = track?.getCapabilities?.()
          const adv: any[] = []
          if ((caps as any)?.focusMode && ((caps as any).focusMode as any[])?.includes?.("continuous")) {
            adv.push({ focusMode: "continuous" })
          }
          if ((caps as any)?.zoom) {
            const min = (caps as any).zoom?.min ?? 1
            const max = (caps as any).zoom?.max ?? 1
            const target = Math.min(max, Math.max(min, 2))
            adv.push({ zoom: target })
          }
          if (adv.length && track?.applyConstraints) {
            await track.applyConstraints({ advanced: adv } as any)
            setHint("Autofoco/zoom habilitados quando suportado.")
          }
        } catch {
          // Ignore if not supported
        }
      } catch (e) {
        console.error(e)
        setHint("Falha ao iniciar câmera/leitor. Verifique permissões.")
      }
    }

    start()
    return () => {
      stopped = true
      try {
        // Remove listeners if API available
        // @ts-ignore
        if (Quagga.offDetected && Quagga.offProcessed) {
          // We can't reference the local handlers here after unmount in TS easily;
          // stopping the camera is sufficient to stop callbacks.
        }
      } catch {}
      try {
        Quagga.stop()
      } catch {}
    }
  }, [router])

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }} />
      {/* Overlay central de enquadramento */}
      <div
        style={{
          position: "absolute",
          top: `${area.top}%`,
          bottom: `${area.bottom}%`,
          left: `${area.left}%`,
          right: `${area.right}%`,
          border: "2px solid rgba(0,255,0,0.85)",
          borderRadius: 8,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.35)",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 2,
            background: "rgba(0,255,0,0.85)",
            transform: "translateY(-1px)",
          }}
        />
      </div>
      <div style={{ position: "absolute", top: 12, left: 12 }}>
        <button onClick={() => router.back()} style={{ padding: 8 }}>Voltar</button>
      </div>
      <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, color: "#fff" }}>
        {hint || "Aponte a câmera para o código de barras."}
      </div>
    </div>
  )
}
