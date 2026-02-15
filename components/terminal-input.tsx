"use client"

import { useState, useRef, useEffect } from "react"

interface TerminalInputProps {
  onCommand: (command: string) => void
  history: string[]
}

export function TerminalInput({ onCommand, history }: TerminalInputProps) {
  const [input, setInput] = useState("")
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      onCommand(input.trim())
      setInput("")
      setHistoryIndex(-1)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex] || "")
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex] || "")
      } else {
        setHistoryIndex(-1)
        setInput("")
      }
    }
  }

  return (
    <div
      className="flex items-center gap-2 text-sm text-glow"
      onClick={() => inputRef.current?.focus()}
      role="textbox"
      tabIndex={-1}
    >
      <span className="text-accent text-glow-bright shrink-0">{"NOSTROMO>"}</span>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border-none outline-none text-foreground font-mono text-sm caret-transparent"
          autoComplete="off"
          spellCheck="false"
          aria-label="Terminal command input"
        />
        <span
          className="absolute top-0 pointer-events-none text-foreground"
          style={{ left: `${input.length}ch` }}
        >
          <span className="inline-block w-2 h-4 bg-foreground cursor-blink" />
        </span>
      </div>
    </div>
  )
}
