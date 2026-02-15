"use client"

import { useState, useEffect } from "react"

export function GeometricPreloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"assembling" | "loading" | "ready">("assembling")

  useEffect(() => {
    const assembleTimer = setTimeout(() => setPhase("loading"), 1200)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 40)

    const readyTimer = setTimeout(() => {
      setPhase("ready")
      setTimeout(onComplete, 600)
    }, 3400)

    return () => {
      clearTimeout(assembleTimer)
      clearTimeout(readyTimer)
      clearInterval(interval)
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[200]">
      {/* Central geometric assembly */}
      <div className="relative w-60 h-60 flex items-center justify-center">
        {/* Outer octagon - spins slowly */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 240 240"
          fill="none"
          aria-hidden="true"
          style={{
            animation: "spin-slow 6s linear infinite",
            opacity: phase === "assembling" ? 0 : 1,
            transition: "opacity 0.5s ease",
          }}
        >
          <polygon
            points="120,10 195,40 230,120 195,200 120,230 45,200 10,120 45,40"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-foreground/30"
            strokeDasharray="8 4"
          />
        </svg>

        {/* Middle hexagon - spins opposite */}
        <svg
          className="absolute w-44 h-44"
          viewBox="0 0 180 180"
          fill="none"
          aria-hidden="true"
          style={{
            animation: "spin-reverse 4s linear infinite",
            opacity: phase === "assembling" ? 0 : 1,
            transition: "opacity 0.6s ease 0.15s",
          }}
        >
          <polygon
            points="90,10 160,45 160,135 90,170 20,135 20,45"
            stroke="currentColor"
            strokeWidth="1"
            className="text-foreground/40"
          />
          {/* Dashed inner ring */}
          <circle
            cx="90"
            cy="90"
            r="60"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="6 6"
            className="text-foreground/20"
          />
        </svg>

        {/* Inner diamond rotates + pulses */}
        <svg
          className="absolute w-28 h-28"
          viewBox="0 0 112 112"
          fill="none"
          aria-hidden="true"
          style={{
            animation: "spin-slow 3s linear infinite",
            opacity: phase === "assembling" ? 0 : 1,
            transition: "opacity 0.6s ease 0.3s",
          }}
        >
          <rect
            x="22"
            y="22"
            width="68"
            height="68"
            transform="rotate(45 56 56)"
            stroke="currentColor"
            strokeWidth="1.2"
            className="text-accent/60"
          />
          <rect
            x="32"
            y="32"
            width="48"
            height="48"
            transform="rotate(45 56 56)"
            stroke="currentColor"
            strokeWidth="0.6"
            className="text-foreground/30"
          />
        </svg>

        {/* Crosshairs */}
        <svg
          className="absolute w-60 h-60"
          viewBox="0 0 240 240"
          fill="none"
          aria-hidden="true"
          style={{
            opacity: phase === "assembling" ? 0 : 1,
            transition: "opacity 0.5s ease 0.2s",
          }}
        >
          <line x1="120" y1="30" x2="120" y2="80" stroke="currentColor" strokeWidth="0.5" className="text-foreground/25" />
          <line x1="120" y1="160" x2="120" y2="210" stroke="currentColor" strokeWidth="0.5" className="text-foreground/25" />
          <line x1="30" y1="120" x2="80" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-foreground/25" />
          <line x1="160" y1="120" x2="210" y2="120" stroke="currentColor" strokeWidth="0.5" className="text-foreground/25" />
        </svg>

        {/* Center core dot - pulses */}
        <svg
          className="absolute w-16 h-16"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="32"
            cy="32"
            r="6"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-accent animate-pulse-glow"
          />
          <circle
            cx="32"
            cy="32"
            r="2"
            fill="currentColor"
            className="text-accent"
          />
          {/* Tick marks at cardinal points */}
          <line x1="32" y1="18" x2="32" y2="23" stroke="currentColor" strokeWidth="1" className="text-foreground/50" />
          <line x1="32" y1="41" x2="32" y2="46" stroke="currentColor" strokeWidth="1" className="text-foreground/50" />
          <line x1="18" y1="32" x2="23" y2="32" stroke="currentColor" strokeWidth="1" className="text-foreground/50" />
          <line x1="41" y1="32" x2="46" y2="32" stroke="currentColor" strokeWidth="1" className="text-foreground/50" />
        </svg>

        {/* Corner accent brackets */}
        <svg className="absolute top-2 left-2" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: phase !== "assembling" ? 1 : 0, transition: "opacity 0.4s ease 0.5s" }}>
          <path d="M0 24 L0 0 L24 0" stroke="currentColor" strokeWidth="1" className="text-foreground/30" />
        </svg>
        <svg className="absolute top-2 right-2" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: phase !== "assembling" ? 1 : 0, transition: "opacity 0.4s ease 0.5s" }}>
          <path d="M0 0 L24 0 L24 24" stroke="currentColor" strokeWidth="1" className="text-foreground/30" />
        </svg>
        <svg className="absolute bottom-2 left-2" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: phase !== "assembling" ? 1 : 0, transition: "opacity 0.4s ease 0.5s" }}>
          <path d="M0 0 L0 24 L24 24" stroke="currentColor" strokeWidth="1" className="text-foreground/30" />
        </svg>
        <svg className="absolute bottom-2 right-2" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ opacity: phase !== "assembling" ? 1 : 0, transition: "opacity 0.4s ease 0.5s" }}>
          <path d="M24 0 L24 24 L0 24" stroke="currentColor" strokeWidth="1" className="text-foreground/30" />
        </svg>
      </div>

      {/* Loading bar */}
      <div className="mt-8 w-60">
        <div className="h-px w-full bg-foreground/10 relative overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-100 ease-linear"
            style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(0, 255, 65, 0.8)" }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[9px] tracking-widest text-muted-foreground">
          <span className="text-glow">
            {phase === "assembling" ? "ASSEMBLING HUD" : phase === "loading" ? "INITIALIZING SYSTEMS" : "READY"}
          </span>
          <span className="text-foreground/50">{Math.min(progress, 100)}%</span>
        </div>
      </div>

      {/* System label */}
      <div className="mt-6 text-[10px] text-muted-foreground/40 tracking-[0.3em]">
        NOSTROMO // WEYLAND-YUTANI CORPORATION
      </div>

      {/* Ready flash */}
      {phase === "ready" && (
        <div
          className="absolute inset-0 bg-foreground/5 pointer-events-none"
          style={{ animation: "boot-flicker 0.5s ease-out forwards" }}
        />
      )}
    </div>
  )
}
