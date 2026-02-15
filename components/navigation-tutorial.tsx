"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface NavigationTutorialProps {
  onComplete: () => void
  onClose: () => void
}

export function NavigationTutorial({ onComplete, onClose }: NavigationTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const steps = [
    {
      title: "WELCOME TO NOSTROMO TERMINAL",
      description: "Crew station interface for accessing vessel systems and communications.",
      highlight: "center",
    },
    {
      title: "NAVIGATION METHOD 1: COMMANDS",
      description: "Type commands in the terminal input at the bottom:\n\nHOME - Return to main directory\nGALLERY - View art gallery\nPROJECTS - Browse projects\nABOUT - Visit operator profile\nSKILLS - View skill matrix\nCONTACT - Send a message",
      highlight: "terminal",
    },
    {
      title: "NAVIGATION METHOD 2: SIDEBAR",
      description: "Use the left sidebar to click on any module. Quick icons provide visual feedback on system status.",
      highlight: "sidebar",
    },
    {
      title: "HELPFUL COMMANDS",
      description: "HELP - Show available commands\nCLEAR - Clear terminal output\nSTATUS - View system diagnostics\nVERSION - Check Nostromo version\nLS - List all modules\nTUTORIAL - Show this guide again",
      highlight: "center",
    },
    {
      title: "WHY THE RETRO LOOK?",
      description: "This interface channels classic 1980s computer terminals for an immersive experience. The green monospace text, scanlines, and CRT effects create authentic retro vibes while showcasing modern web technology.",
      highlight: "center",
    },
    {
      title: "YOU'RE ALL SET!",
      description: "Feel free to explore the portfolio. You can access this tutorial anytime by typing TUTORIAL in the terminal.",
      highlight: "center",
    },
  ]

  const step = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => onComplete(), 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-background border-2 border-foreground rounded-lg shadow-2xl max-w-2xl w-full">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-foreground/20">
          <h2 className="text-xl font-bold text-foreground text-glow">
            [{currentStep + 1}/{steps.length}] {step.title}
          </h2>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition-colors p-1"
            aria-label="Close tutorial"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-mono leading-relaxed mb-8">
            {step.description}
          </pre>

          {/* Visual indicator for steps */}
          <div className="flex gap-2 mb-8 justify-center">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-accent text-glow-bright"
                    : index < currentStep
                      ? "bg-foreground/40"
                      : "bg-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="flex items-center justify-between p-6 border-t border-foreground/20 bg-foreground/5">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 font-mono text-sm border border-foreground/30 text-foreground hover:bg-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← PREVIOUS
          </button>

          <button
            onClick={() => setCurrentStep(0)}
            className="px-3 py-2 font-mono text-xs text-foreground/60 hover:text-foreground transition-colors"
          >
            RESTART
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleComplete}
              className="px-4 py-2 font-mono text-sm bg-accent text-background font-bold hover:opacity-90 transition-opacity text-glow"
            >
              START EXPLORING →
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 font-mono text-sm bg-accent text-background font-bold hover:opacity-90 transition-opacity text-glow"
            >
              NEXT →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
