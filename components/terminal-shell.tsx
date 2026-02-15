"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { StatusBar } from "./status-bar"
import { NavSidebar } from "./nav-sidebar"
import { TerminalInput } from "./terminal-input"
import { HomeSection } from "./sections/home-section"
import { GallerySection } from "./sections/gallery-section"
import { AboutSection } from "./sections/about-section"
import { SkillsSection } from "./sections/skills-section"
import { ContactSection } from "./sections/contact-section"
import { ProjectsSection } from "./sections/projects-section"
import { CustomPage } from "./sections/custom-page"
import { NavigationTutorial } from "./navigation-tutorial"
import { ScanlineBar, DataStream, StarburstIcon, HexagonNode, DiamondHUD } from "./hud-elements"

type Section = "home" | "gallery" | "about" | "skills" | "contact" | "projects" | string

interface TerminalLine {
  type: "command" | "response" | "error" | "system"
  text: string
}

interface CustomPageData {
  id: string
  title: string
  content: string
}

interface TerminalShellProps {
  showTutorial?: boolean
  onTutorialComplete?: () => void
  onSkipTutorial?: () => void
}

const HELP_TEXT = `AVAILABLE COMMANDS:
  HOME      - Crew quarters directory
  GALLERY   - Visual mission logs
  PROJECTS  - Engineering database
  ABOUT     - Captain's manifest
  SKILLS    - Vessel systems index
  CONTACT   - Communications relay
  HELP      - Show this message
  CLEAR     - Clear terminal output
  STATUS    - Vessel diagnostics
  VERSION   - System information
  DATE      - Current ship time
  LS        - List vessel modules
  TUTORIAL  - Show navigation guide`

const STATUS_TEXT = `VESSEL SYSTEMS DIAGNOSTICS:
  REACTOR:        NOMINAL [98.7%]
  LIFE SUPPORT:   OPERATIONAL
  NAVIGATION:     ONLINE [65.2K AWAY]
  EXTERNAL SENSORS: ACTIVE
  CARGO BAY:      SEALED
  CREW QUARTERS:  NOMINAL
  UPTIME:         847:23:41
  HULL INTEGRITY: CONFIRMED`

export function TerminalShell({ showTutorial = false, onTutorialComplete, onSkipTutorial }: TerminalShellProps) {
  const [section, setSection] = useState<Section>("home")
  const [terminalOutput, setTerminalOutput] = useState<TerminalLine[]>([
    { type: "system", text: 'NOSTROMO READY. TYPE "HELP" FOR AVAILABLE COMMANDS.' },
  ])
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [showTerminalUI, setShowTerminalUI] = useState(false)
  const [customPages, setCustomPages] = useState<CustomPageData[]>([])
  const [displayTutorial, setDisplayTutorial] = useState(showTutorial)
  const outputRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [terminalOutput])

  useEffect(() => {
    async function fetchCustomPages() {
      try {
        const response = await fetch('/api/content')
        if (response.ok) {
          const data = await response.json()
          if (data.customPages) {
            setCustomPages(data.customPages)
          }
        }
      } catch (error) {
        console.error("Failed to fetch custom pages", error)
      }
    }
    fetchCustomPages()
  }, [])

  const navigate = useCallback((newSection: string) => {
    const s = newSection.toLowerCase()
    const validSections = ["home", "gallery", "about", "skills", "contact", "projects"]
    const customIds = customPages.map((p: CustomPageData) => p.id)

    if (validSections.includes(s) || customIds.includes(s)) {
      setSection(s)
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0
      }
    }
  }, [customPages])

  const handleCommand = useCallback(
    (cmd: string) => {
      const upper = cmd.toUpperCase().trim()
      setCommandHistory((prev: string[]) => [...prev, cmd])

      const newLines: TerminalLine[] = [{ type: "command", text: `NOSTROMO> ${cmd}` }]

      // Check for custom page commands first
      const customPage = customPages.find((p: CustomPageData) => p.id.toUpperCase() === upper || p.title.toUpperCase() === upper)
      if (customPage) {
        setSection(customPage.id)
        newLines.push({ type: "response", text: `LOADING ${customPage.title.toUpperCase()}...` })
        setTerminalOutput((prev: TerminalLine[]) => [...prev, ...newLines])
        return
      }

      switch (upper) {
        case "HOME":
        case "DIRECTORY":
        case "DIR":
          setSection("home")
          newLines.push({ type: "response", text: "NAVIGATING TO DIRECTORY..." })
          break
        case "GALLERY":
        case "ART":
        case "PORTFOLIO":
          setSection("gallery")
          newLines.push({ type: "response", text: "LOADING ART GALLERY..." })
          break
        case "PROJECTS":
        case "PRJ":
        case "WORKS":
          setSection("projects")
          newLines.push({ type: "response", text: "LOADING PROJECT DATABASE..." })
          break
        case "ABOUT":
        case "BIO":
        case "PROFILE":
          setSection("about")
          newLines.push({ type: "response", text: "LOADING OPERATOR PROFILE..." })
          break
        case "SKILLS":
        case "MATRIX":
        case "ABILITIES":
          setSection("skills")
          newLines.push({ type: "response", text: "LOADING SKILL MATRIX..." })
          break
        case "CONTACT":
        case "MSG":
        case "MESSAGE":
        case "TRANSMIT":
          setSection("contact")
          newLines.push({ type: "response", text: "OPENING COMMUNICATION CHANNEL..." })
          break
        case "HELP":
        case "?":
          newLines.push({ type: "response", text: HELP_TEXT })
          break
        case "CLEAR":
        case "CLS":
          setTerminalOutput([])
          return
        case "STATUS":
        case "DIAG":
        case "DIAGNOSTICS":
          newLines.push({ type: "response", text: STATUS_TEXT })
          break
        case "VERSION":
        case "VER":
          newLines.push({ type: "response", text: "NOSTROMO CLASS M FREIGHTER\nMASTER SYSTEMS BUILD: 2026.02.15\nWEYLAND-YUTANI CORPORATION" })
          break
        case "DATE":
        case "TIME":
          newLines.push({ type: "response", text: new Date().toString().toUpperCase() })
          break
        case "LS":
        case "LIST":
          let modulesText = "VESSEL MODULES:\n  [01] CREW QUARTERS (HOME)\n  [02] MISSION LOGS  (GALLERY)\n  [03] ENGINEERING   (PROJECTS)\n  [04] MANIFEST      (ABOUT)\n  [05] SHIP SYSTEMS  (SKILLS)\n  [06] COMMUNICATIONS(CONTACT)"
          if (customPages.length > 0) {
            modulesText += "\n\nCUSTOM MODULES:"
            customPages.forEach((page: CustomPageData, index: number) => {
              modulesText += `\n  [${String(index + 7).padStart(2, '0')}] ${page.title.toUpperCase()} (${page.id.toUpperCase()})`
            })
          }
          newLines.push({
            type: "response",
            text: modulesText,
          })
          break
        case "TUTORIAL":
        case "INTRO":
        case "GUIDE":
          setDisplayTutorial(true)
          newLines.push({ type: "response", text: "TUTORIAL SYSTEM ACTIVATED...\nLOADING NAVIGATION INTERFACE..." })
          break
        default:
          newLines.push({ type: "error", text: `UNKNOWN COMMAND: "${upper}"\nTYPE "HELP" FOR AVAILABLE COMMANDS.` })
      }

      setTerminalOutput((prev: TerminalLine[]) => [...prev, ...newLines])

      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0
      }
    },
    [customPages]
  )

  const renderSection = () => {
    switch (section) {
      case "home":
        return <HomeSection onNavigate={navigate} />
      case "gallery":
        return <GallerySection />
      case "projects":
        return <ProjectsSection />
      case "about":
        return <AboutSection />
      case "skills":
        return <SkillsSection />
      case "contact":
        return <ContactSection />
      default:
        const customPage = customPages.find(p => p.id === section)
        if (customPage) {
          return <CustomPage data={customPage} />
        }
        return <HomeSection onNavigate={navigate} />
    }
  }

  const sectionLabel: Record<string, string> = {
    home: "DIRECTORY",
    gallery: "ART GALLERY",
    projects: "PROJECTS DB",
    about: "ABOUT UNIT",
    skills: "SKILL MATRIX",
    contact: "TRANSMIT MSG",
  }

  // Add custom page labels
  customPages.forEach((p: CustomPageData) => {
    sectionLabel[p.id] = p.title.toUpperCase()
  })

  return (
    <div className="flex flex-col h-screen crt-screen">
      {/* Navigation Tutorial */}
      {displayTutorial && (
        <NavigationTutorial 
          onComplete={() => {
            setDisplayTutorial(false)
            onTutorialComplete?.()
          }}
          onClose={() => {
            setDisplayTutorial(false)
            onSkipTutorial?.()
          }}
        />
      )}

      {/* Status bar */}
      <StatusBar currentSection={sectionLabel[section] || "UNKNOWN"} />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar nav */}
        <NavSidebar currentSection={section} onNavigate={navigate} customPages={customPages.map((p: CustomPageData) => ({ id: p.id, title: p.title }))} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content */}
          <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
            {renderSection()}
          </main>

          {/* Terminal toggle + output */}
          <div className="border-t border-border">
            {/* Toggle bar */}
            <button
              onClick={() => setShowTerminalUI((p: boolean) => !p)}
              className="w-full flex items-center justify-between px-4 py-1.5 bg-background/50 hover:bg-foreground/5 transition-all text-[10px] text-muted-foreground tracking-widest"
            >
              <span className="flex items-center gap-2">
                <DiamondHUD size={12} className="text-foreground/40" />
                TERMINAL
              </span>
              <span>{showTerminalUI ? "[ COLLAPSE ]" : "[ EXPAND ]"}</span>
            </button>

            {/* Terminal output + input */}
            {showTerminalUI && (
              <div className="bg-background/80 panel-border border-t-0">
                <div ref={outputRef} className="max-h-40 overflow-y-auto p-3 space-y-1 text-xs">
                  {terminalOutput.map((line: TerminalLine, i: number) => (
                    <div
                      key={i}
                      className={`whitespace-pre-wrap font-mono ${line.type === "command"
                        ? "text-foreground text-glow"
                        : line.type === "error"
                          ? "text-destructive"
                          : line.type === "system"
                            ? "text-accent text-glow-bright"
                            : "text-foreground/60"
                        }`}
                    >
                      {line.text}
                    </div>
                  ))}
                </div>
                <div className="px-3 pb-3">
                  <TerminalInput onCommand={handleCommand} history={commandHistory} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right decorative sidebar */}
        <aside className="w-16 shrink-0 hidden xl:flex flex-col items-center py-4 gap-6 panel-border border-l bg-background/30">
          <StarburstIcon size={24} className="text-foreground/30" />
          <HexagonNode size={24} className="text-foreground/20" />
          <div className="flex-1 flex items-center">
            <DataStream />
          </div>
          <DiamondHUD size={20} className="text-foreground/20" />
          <StarburstIcon size={20} className="text-foreground/15" />
        </aside>
      </div>

      {/* Bottom status bar */}
      <footer className="flex items-center justify-between px-4 py-1 panel-border bg-background/80 text-[8px] text-muted-foreground/60 tracking-widest">
        <span>NOSTROMO // WEYLAND-YUTANI CORPORATION</span>
        <div className="hidden sm:flex items-center gap-4">
          <span>MEM: 64K</span>
          <span>CPU: 98.7%</span>
          <span className="text-accent/50">NOMINAL</span>
        </div>
        <span>BUILD 2026.02.14</span>
      </footer>

      {/* Mobile nav */}
      <nav className="lg:hidden flex items-center panel-border bg-background/90 overflow-x-auto" aria-label="Mobile navigation">
        {[
          { id: "home", label: "DIR" },
          { id: "gallery", label: "ART" },
          { id: "projects", label: "PRJ" },
          { id: "about", label: "BIO" },
          { id: "skills", label: "SKILL" },
          { id: "contact", label: "MSG" },
          ...customPages.map((p: CustomPageData) => ({ id: p.id, label: p.title.substring(0, 3).toUpperCase() }))
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`flex-1 min-w-[60px] py-2 text-[9px] tracking-widest text-center transition-all ${section === item.id
              ? "text-accent text-glow-bright bg-accent/5"
              : "text-muted-foreground hover:text-foreground"
              }`}
            aria-current={section === item.id ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
