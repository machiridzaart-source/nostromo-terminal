"use client"

import { useState, useEffect } from "react"

const BOOT_LINES = [
  { text: "NOSTROMO CLASS M FREIGHTER - MASTER BOOT SEQUENCE", delay: 0 },
  { text: "REACTOR STATUS: NOMINAL", delay: 200 },
  { text: "HYPERDRIVE CORE: ONLINE", delay: 400 },
  { text: "LIFE SUPPORT SYSTEMS... OK", delay: 600 },
  { text: "NAVIGATION ARRAY CALIBRATION... OK", delay: 900 },
  { text: "CARGO MANIFEST [=========>] 100%", delay: 1200 },
  { text: "EXTERNAL PROXIMITY SENSORS... OK", delay: 1500 },
  { text: "ACTIVATING MAIN COMPUTER SYSTEMS... OK", delay: 1700 },
  { text: "", delay: 1900 },
  { text: "ALL SYSTEMS NOMINAL", delay: 2000 },
  { text: "WELCOME ABOARD NOSTROMO", delay: 2200 },
  { text: 'TYPE "HELP" FOR CREW MANIFEST', delay: 2500 },
]

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [complete, setComplete] = useState(false)
  const [operatorName, setOperatorName] = useState<string>("LOADING...")
  const [operatorStatus, setOperatorStatus] = useState<string>("SCANNING...")

  useEffect(() => {
    // Fetch operator name
    async function fetchOperatorName() {
      try {
        const response = await fetch('/api/content')
        if (response.ok) {
          const data = await response.json()
          if (data.home?.title) {
            setOperatorName(data.home.title.toUpperCase())
            setOperatorStatus("IDENTIFIED")
          }
        }
      } catch (error) {
        console.error("Failed to fetch operator name", error)
        setOperatorName("UNKNOWN OPERATOR")
        setOperatorStatus("ERROR")
      }
    }
    fetchOperatorName()
  }, [])

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    BOOT_LINES.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(index + 1)
      }, line.delay)
      timers.push(timer)
    })

    const completeTimer = setTimeout(() => {
      setComplete(true)
      setTimeout(onComplete, 500)
    }, 3000)
    timers.push(completeTimer)

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 relative">
      {/* User identification in top left */}
      <div className="absolute top-4 left-4 border border-accent/50 p-3 bg-background/40 backdrop-blur-sm max-w-xs">
        <div className="text-[9px] text-muted-foreground tracking-widest mb-1">OPERATOR PROFILE</div>
        <div className="text-xs text-accent text-glow-bright font-bold tracking-wider mb-2">
          {operatorName}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${operatorStatus === "IDENTIFIED" ? "bg-accent animate-pulse-glow" : "bg-yellow-500"}`} />
          <span className="text-[8px] text-foreground/70 tracking-widest">
            {operatorStatus}
          </span>
        </div>
      </div>

      <div className="max-w-2xl w-full">
        <div className="mb-8 text-center">
          <pre className="text-foreground text-glow text-xs leading-tight">
{`
███╗   ██╗ ██████╗ ███████╗████████╗██████╗ ███████╗ ██████╗ ███╗   ███╗ ██████╗ 
████╗  ██║██╔═══██╗██╔════╝╚══██╔══╝██╔══██╗██╔════╝██╔═══██╗████╗ ████║██╔═══██╗
██╔██╗ ██║██║   ██║███████╗   ██║   ██████╔╝█████╗  ██║   ██║██╔████╔██║██║   ██║
██║╚██╗██║██║   ██║╚════██║   ██║   ██╔══██╗██╔══╝  ██║   ██║██║╚██╔╝██║██║   ██║
██║ ╚████║╚██████╔╝███████║   ██║   ██║  ██║███████╗╚██████╔╝██║ ╚═╝ ██║╚██████╔╝
╚═╝  ╚═══╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝ ╚═════╝
`}
          </pre>
        </div>

        <div className="space-y-1 text-sm">
          {BOOT_LINES.slice(0, visibleLines).map((line, index) => (
            <div
              key={index}
              className="text-foreground text-glow animate-boot-flicker"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {line.text === "" ? (
                <br />
              ) : line.text.includes("OK") || line.text.includes("100%") ? (
                <span>
                  {line.text.replace("OK", "").replace("100%", "")}
                  <span className="text-accent text-glow-bright">
                    {line.text.includes("OK") ? "OK" : "100%"}
                  </span>
                </span>
              ) : (
                line.text
              )}
            </div>
          ))}
          {!complete && visibleLines > 0 && (
            <span className="inline-block w-2 h-4 bg-foreground cursor-blink" />
          )}
        </div>

        {complete && (
          <div className="mt-6 text-center text-foreground/50 text-xs animate-pulse-glow">
            INITIALIZING INTERFACE...
          </div>
        )}
      </div>
    </div>
  )
}
