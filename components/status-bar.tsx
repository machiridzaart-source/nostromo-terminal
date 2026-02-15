"use client"

import { useState, useEffect } from "react"
import { StarburstIcon, DiamondHUD } from "./hud-elements"

export function StatusBar({ currentSection }: { currentSection: string }) {
  const [time, setTime] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      )
      setDate(
        now
          .toLocaleDateString("en-US", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })
          .toUpperCase()
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex items-center justify-between px-4 py-2 panel-border bg-background/80">
      <div className="flex items-center gap-3">
        <StarburstIcon size={20} className="text-foreground" />
        <span className="text-xs text-foreground text-glow tracking-widest uppercase">
          NOSTROMO SYSTEMS
        </span>
        <span className="text-xs text-muted-foreground">{"///"}</span>
        <span className="text-xs text-accent text-glow-bright tracking-wider uppercase">
          {currentSection}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-2 h-2 bg-accent animate-pulse-glow" />
          <span className="text-[10px] text-muted-foreground tracking-wider">SYS NOMINAL</span>
        </div>
        <DiamondHUD size={16} className="text-foreground hidden sm:block" />
        <div className="text-right">
          <div className="text-xs text-foreground text-glow tracking-widest font-bold tabular-nums">
            {time}
          </div>
          <div className="text-[9px] text-muted-foreground tracking-wider">{date}</div>
        </div>
      </div>
    </header>
  )
}
