"use client"

import { HexagonNode, TriangleWarning, DataStream } from "./hud-elements"

const NAV_ITEMS = [
  { id: "home", label: "DIRECTORY", cmd: "HOME" },
  { id: "gallery", label: "ART GALLERY", cmd: "GALLERY" },
  { id: "projects", label: "PROJECTS DB", cmd: "PROJECTS" },
  { id: "about", label: "ABOUT UNIT", cmd: "ABOUT" },
  { id: "skills", label: "SKILL MATRIX", cmd: "SKILLS" },
  { id: "contact", label: "TRANSMIT MSG", cmd: "CONTACT" },
]

interface NavSidebarProps {
  currentSection: string
  onNavigate: (section: string) => void
  customPages?: { id: string; title: string }[]
}

export function NavSidebar({ currentSection, onNavigate, customPages = [] }: NavSidebarProps) {
  return (
    <aside className="w-48 shrink-0 hidden lg:flex flex-col panel-border bg-background/50 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <TriangleWarning size={14} className="text-foreground" />
          <span className="text-[10px] text-muted-foreground tracking-widest">NAVIGATION</span>
        </div>
        <div className="text-[9px] text-muted-foreground/50">SELECT MODULE</div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = currentSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full text-left px-3 py-2 text-sm tracking-wider transition-all relative
                ${isActive
                  ? "bg-foreground/10 text-accent text-glow-bright panel-border-bright"
                  : "text-foreground/60 hover:text-foreground hover:bg-foreground/5 border border-transparent"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 ${isActive ? "bg-accent animate-pulse-glow" : "bg-foreground/20"}`} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground">
                  {"<"}
                </div>
              )}
            </button>
          )
        })}

        {/* Custom Pages Separator */}
        {customPages.length > 0 && (
          <div className="my-2 px-3">
            <div className="h-px bg-border/50" />
          </div>
        )}

        {/* Custom Pages */}
        {customPages.map((page) => {
          const isActive = currentSection === page.id
          return (
            <button
              key={page.id}
              onClick={() => onNavigate(page.id)}
              className={`
                w-full text-left px-3 py-2 text-sm tracking-wider transition-all relative
                ${isActive
                  ? "bg-foreground/10 text-accent text-glow-bright panel-border-bright"
                  : "text-foreground/60 hover:text-foreground hover:bg-foreground/5 border border-transparent"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 ${isActive ? "bg-accent animate-pulse-glow" : "bg-foreground/20"}`} />
                <span>{page.title.toUpperCase()}</span>
              </div>
              {isActive && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-muted-foreground">
                  {"<"}
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom decorations */}
      <div className="p-3 border-t border-border flex flex-col items-center gap-3">
        <HexagonNode size={30} className="text-foreground/30" />
        <DataStream className="self-start" />
      </div>
    </aside>
  )
}
