"use client"

import { useState, useEffect } from "react"
import { CornerBrackets, ScanlineBar } from "../hud-elements"

interface Skill {
  name: string
  level: number
  category: string
}

interface SkillsContent {
  title: string
  subtitle: string
  list: Skill[]
  categories: string[]
}

const DEFAULT_CONTENT: SkillsContent = {
  title: "SKILL MATRIX",
  subtitle: "// CAPABILITY ASSESSMENT",
  list: [
    { name: "PHOTOSHOP", level: 95, category: "DESIGN" },
    { name: "ILLUSTRATOR", level: 90, category: "DESIGN" },
    { name: "FIGMA", level: 88, category: "DESIGN" },
    { name: "BLENDER", level: 82, category: "3D" },
    { name: "CINEMA 4D", level: 75, category: "3D" },
    { name: "AFTER EFFECTS", level: 92, category: "MOTION" },
    { name: "PREMIERE PRO", level: 78, category: "MOTION" },
    { name: "PROCESSING", level: 85, category: "CODE" },
    { name: "JAVASCRIPT", level: 72, category: "CODE" },
    { name: "GLSL/SHADERS", level: 68, category: "CODE" },
    { name: "TOUCHDESIGNER", level: 70, category: "CODE" },
    { name: "PROCREATE", level: 88, category: "DESIGN" },
  ],
  categories: ["ALL", "DESIGN", "3D", "MOTION", "CODE"]
}

function SkillBar({ skill }: { skill: Skill }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-foreground text-glow tracking-wider w-28 shrink-0">{skill.name}</span>
      <div className="flex-1 h-3 bg-background/50 panel-border relative overflow-hidden">
        <div
          className="h-full bg-foreground/20 relative"
          style={{ width: `${skill.level}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/10 to-accent/30" />
          {/* Scanline effect inside bar */}
          {Array.from({ length: Math.floor(skill.level / 5) }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-accent/30"
              style={{ left: `${(i + 1) * 5}%` }}
            />
          ))}
        </div>
        {/* Animated pulse on the end */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-accent animate-pulse-glow"
          style={{ left: `${skill.level}%` }}
        />
      </div>
      <span className="text-[10px] text-accent text-glow tracking-wider w-10 text-right tabular-nums">{skill.level}%</span>
    </div>
  )
}

export function SkillsSection() {
  const [content, setContent] = useState<SkillsContent>(DEFAULT_CONTENT)

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/content')
        if (response.ok) {
          const data = await response.json()
          if (data.skills) {
            setContent(data.skills)
          }
        }
      } catch (error) {
        console.error("Failed to fetch skills content", error)
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
        {/* Main skills */}
        <div className="lg:w-2/3 panel-border p-4 bg-background/30 relative">
          <CornerBrackets className="text-foreground/20" />
          <div className="text-[10px] text-muted-foreground tracking-widest mb-4">PROFICIENCY LEVELS</div>
          <div className="space-y-3">
            {content.list.map((skill) => (
              <SkillBar key={skill.name} skill={skill} />
            ))}
          </div>
        </div>

        {/* Category summary */}
        <div className="lg:w-1/3 flex flex-col gap-3">
          {content.categories.filter(c => c !== "ALL").map((cat) => {
            const catSkills = content.list.filter((s) => s.category === cat)
            const avg = catSkills.length > 0 ? Math.round(catSkills.reduce((sum, s) => sum + s.level, 0) / catSkills.length) : 0
            if (catSkills.length === 0) return null
            return (
              <div key={cat} className="panel-border p-3 bg-background/30 relative">
                <CornerBrackets className="text-foreground/10" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground text-glow font-bold tracking-widest">{cat}</span>
                  <span className="text-xs text-accent text-glow-bright tabular-nums">{avg}%</span>
                </div>
                <ScanlineBar />
                <div className="mt-2 text-[9px] text-muted-foreground tracking-wider">
                  {catSkills.map((s) => s.name).join(" / ")}
                </div>
                {/* Mini bar chart */}
                <div className="mt-2 flex gap-1">
                  {catSkills.map((s) => (
                    <div key={s.name} className="flex-1 h-8 bg-background/50 panel-border relative overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full bg-foreground/15"
                        style={{ height: `${s.level}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
