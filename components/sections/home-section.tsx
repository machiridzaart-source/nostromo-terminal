"use client"

import { useState, useEffect } from "react"
import { WireframeGlobe, TargetReticle, CornerBrackets, ScanlineBar } from "../hud-elements"
import { FeaturedCarousel } from "../featured-carousel"

interface HomeContent {
  title: string
  subtitle: string
  description: string
  modules: { id: string; label: string; status: string; desc: string }[]
  tags: string[]
  stats: { label: string; value: string }[]
}

const DEFAULT_CONTENT: HomeContent = {
  title: "CREATIVE OPERATOR",
  subtitle: "GROUP: CREATIVE // MODULE: PORTFOLIO",
  description: "Digital artist and creative technologist. Specializing in visual design, illustration, and experimental digital media. Navigating the intersection of art and technology.",
  modules: [
    { id: "gallery", label: "ART GALLERY", status: "ONLINE", desc: "VIEW CREATIVE WORKS" },
    { id: "projects", label: "PROJECTS DB", status: "ONLINE", desc: "CREATIVE WORKS DATABASE" },
    { id: "about", label: "ABOUT UNIT", status: "ONLINE", desc: "OPERATOR INFORMATION" },
    { id: "skills", label: "SKILL MATRIX", status: "ACTIVE", desc: "TECHNICAL CAPABILITIES" },
    { id: "contact", label: "TRANSMIT MSG", status: "STANDBY", desc: "COMMUNICATION CHANNEL" },
  ],
  tags: ["DIGITAL ART", "ILLUSTRATION", "3D DESIGN", "MOTION"],
  stats: [
    { label: "MEM", value: "64K/128K" },
    { label: "CPU", value: "98.7%" },
    { label: "UPTIME", value: "847:23:41" },
    { label: "TEMP", value: "42C" },
    { label: "STATUS", value: "ALL SYSTEMS NOMINAL" }
  ]
}

export function HomeSection({ onNavigate }: { onNavigate: (section: string) => void }) {
  const [content, setContent] = useState<HomeContent>(DEFAULT_CONTENT)

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/content')
        if (response.ok) {
          const data = await response.json()
          if (data.home) {
            setContent({ ...DEFAULT_CONTENT, ...data.home })
          }
        }
      } catch (error) {
        console.error("Failed to fetch home content", error)
      }
    }
    fetchContent()
  }, [])

  return (
    <div className="flex flex-col gap-6 animate-boot-flicker">
      {/* Hero area */}
      <div className="relative panel-border p-6 bg-background/30">
        <CornerBrackets className="text-foreground/40" />
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1">
            <div className="text-[10px] text-muted-foreground tracking-widest mb-2">
              {content.subtitle}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground text-glow-bright tracking-wider mb-3">
              {content.title}
            </h1>
            <p className="text-sm text-foreground/70 text-glow leading-relaxed max-w-lg">
              {content.description}
            </p>
            <ScanlineBar className="mt-4" />
            <div className="mt-4 flex flex-wrap gap-3">
              {(content.tags || []).map(tag => (
                <span key={tag} className="text-[10px] px-2 py-1 panel-border text-accent tracking-wider">{tag}</span>
              ))}
            </div>
          </div>
          <div className="relative flex items-center justify-center shrink-0">
            <WireframeGlobe size={140} className="text-foreground/30" />
            <TargetReticle size={60} className="text-accent absolute" />
          </div>
        </div>
      </div>

      {/* Featured Works Carousel */}
      <FeaturedCarousel />

      {/* Module grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-muted-foreground tracking-widest">AVAILABLE MODULES</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(content.modules || []).map((mod) => (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="text-left p-4 panel-border bg-background/30 hover:bg-foreground/5 transition-all group relative"
            >
              <CornerBrackets className="text-foreground/20 group-hover:text-foreground/50 transition-colors" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-foreground text-glow tracking-wider font-bold">
                  {mod.label}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 tracking-wider ${mod.status === "ONLINE"
                  ? "text-accent bg-accent/10 panel-border-bright"
                  : mod.status === "ACTIVE"
                    ? "text-foreground bg-foreground/10 panel-border"
                    : "text-muted-foreground bg-muted/20 panel-border"
                  }`}>
                  {mod.status}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground tracking-wider">
                {mod.desc}
              </div>
              <div className="mt-2 text-[8px] text-foreground/30 group-hover:text-foreground/60 transition-colors tracking-widest">
                {'> CLICK TO ACCESS'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* System info bar */}
      <div className="panel-border p-3 bg-background/20 flex flex-wrap items-center gap-4 text-[9px] text-muted-foreground tracking-wider">
        {(content.stats || []).map(stat => (
          <span key={stat.label}>{stat.label}: {stat.label === "STATUS" ? <span className="text-accent">{stat.value}</span> : stat.value}</span>
        ))}
      </div>
    </div>
  )
}
