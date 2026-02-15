"use client"

import { useState, useEffect } from "react"
import { WireframeGlobe, CornerBrackets, ScanlineBar, StarburstIcon } from "../hud-elements"

interface AboutContent {
  operatorName: string
  title: string
  subtitle: string
  designation: string
  stats: {
    status: string
    location: string
    clearance: string
    specialty: string
  }
  bio: string
  bioSecond: string
  timeline: { year: string; event: string; desc: string }[]
}

const DEFAULT_CONTENT: AboutContent = {
  operatorName: "CREATIVE OPERATOR",
  title: "ABOUT UNIT",
  subtitle: "// OPERATOR PROFILE",
  designation: "ARTIST-07",
  stats: {
    status: "ACTIVE",
    location: "GLOBAL // REMOTE",
    clearance: "LEVEL 5",
    specialty: "VISUAL ARTS"
  },
  bio: "A multidisciplinary digital artist navigating the space between technology and human expression. With over 7 years of experience crafting visual narratives across digital, 3D, and motion mediums. Passionate about pushing the boundaries of what creative tools can achieve.",
  bioSecond: "Currently focused on generative art systems, interactive installations, and exploring how emerging technologies reshape our understanding of visual culture. Every pixel is deliberate. Every frame is intentional.",
  timeline: [
    { year: "2026", event: "FREELANCE CREATIVE TECHNOLOGIST", desc: "Working with studios worldwide on experimental digital projects" },
    { year: "2024", event: "SENIOR DIGITAL ARTIST @ NEXUS LABS", desc: "Led visual identity and motion design for product launches" },
    { year: "2022", event: "ART DIRECTOR @ PIXEL FORGE", desc: "Directed creative campaigns for tech and media clients" },
    { year: "2020", event: "JUNIOR DESIGNER @ WAVEFORM STUDIO", desc: "Illustration and UI design for mobile applications" },
    { year: "2019", event: "BFA DIGITAL ARTS - GRADUATED", desc: "Thesis: Generative Art Systems and Human Perception" }
  ]
}

export function AboutSection() {
  const [content, setContent] = useState<AboutContent>(DEFAULT_CONTENT)

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/content')
        if (response.ok) {
          const data = await response.json()
          if (data.about) {
            setContent(data.about)
          }
        }
      } catch (error) {
        console.error("Failed to fetch about content", error)
      }
    }
    fetchContent()
  }, [])

  return (
    <div className="flex flex-col gap-6 animate-boot-flicker">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-accent animate-pulse-glow" />
        <h1 className="text-lg text-foreground text-glow-bright font-bold tracking-widest">
          {content.title}
        </h1>
        <span className="text-[10px] text-muted-foreground tracking-wider">{content.subtitle}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile card */}
        <div className="lg:w-1/3 panel-border-bright p-5 bg-background/30 relative">
          <CornerBrackets className="text-accent/40" />
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <WireframeGlobe size={100} className="text-foreground/20" />
              <StarburstIcon size={40} className="text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center">
              <div className="text-foreground text-glow-bright text-sm font-bold tracking-widest">{content.operatorName}</div>
              <div className="text-[10px] text-muted-foreground tracking-wider mt-1">DESIGNATION: {content.designation}</div>
            </div>
            <ScanlineBar />
            <div className="w-full space-y-2 text-[10px] tracking-wider">
              <div className="flex justify-between">
                <span className="text-muted-foreground">STATUS:</span>
                <span className="text-accent">{content.stats.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">LOCATION:</span>
                <span className="text-foreground">{content.stats.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CLEARANCE:</span>
                <span className="text-foreground">{content.stats.clearance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SPECIALTY:</span>
                <span className="text-foreground">{content.stats.specialty}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio and timeline */}
        <div className="lg:w-2/3 flex flex-col gap-4">
          {/* Bio */}
          <div className="panel-border p-4 bg-background/30">
            <div className="text-[10px] text-muted-foreground tracking-widest mb-2">BIOGRAPHY // DECLASSIFIED</div>
            <p className="text-sm text-foreground/80 text-glow leading-relaxed mb-3">
              {content.bio}
            </p>
            <p className="text-sm text-foreground/60 text-glow leading-relaxed">
              {content.bioSecond}
            </p>
          </div>

          {/* Timeline */}
          <div className="panel-border p-4 bg-background/30">
            <div className="text-[10px] text-muted-foreground tracking-widest mb-3">SERVICE RECORD // CHRONOLOGICAL</div>
            <div className="space-y-3">
              {content.timeline.map((entry, index) => (
                <div key={index} className="flex gap-3 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-accent shrink-0 group-hover:animate-pulse-glow" />
                    {index < content.timeline.length - 1 && (
                      <div className="w-px h-full bg-border" />
                    )}
                  </div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-accent text-glow tracking-wider font-bold">{entry.year}</span>
                      <span className="text-[10px] text-foreground text-glow tracking-wider">{entry.event}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground tracking-wider">{entry.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
