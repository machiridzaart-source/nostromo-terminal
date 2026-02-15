"use client"

import { useState, useCallback, useEffect } from "react"
import { GeometricPreloader } from "@/components/geometric-preloader"
import { BootSequence } from "@/components/boot-sequence"
import { TerminalShell } from "@/components/terminal-shell"

type AppPhase = "preloader" | "boot" | "ready"

export default function Page() {
  const [phase, setPhase] = useState<AppPhase>("preloader")
  const [showTutorial, setShowTutorial] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem("nostromo-visited")
    if (!hasVisited) {
      setIsFirstTime(true)
      setShowTutorial(true)
    }
  }, [])

  const handlePreloaderComplete = useCallback(() => {
    setPhase("boot")
  }, [])

  const handleBootComplete = useCallback(() => {
    setPhase("ready")
  }, [])

  const handleTutorialComplete = useCallback(() => {
    localStorage.setItem("nostromo-visited", "true")
    setShowTutorial(false)
  }, [])

  const handleSkipTutorial = useCallback(() => {
    localStorage.setItem("nostromo-visited", "true")
    setShowTutorial(false)
  }, [])

  return (
    <>
      {/* CRT overlay effects */}
      <div className="crt-scanlines" />
      <div className="noise-overlay" />

      {/* Geometric preloader */}
      {phase === "preloader" && <GeometricPreloader onComplete={handlePreloaderComplete} />}

      {/* Main content with CRT flicker */}
      <div className="crt-flicker">
        {phase === "boot" && <BootSequence onComplete={handleBootComplete} />}
        {phase === "ready" && (
          <TerminalShell 
            showTutorial={showTutorial} 
            onTutorialComplete={handleTutorialComplete}
            onSkipTutorial={handleSkipTutorial}
          />
        )}
      </div>
    </>
  )
}
