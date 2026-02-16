"use client"

import { useState, useEffect } from "react"
import { CornerBrackets, ScanlineBar, DiamondHUD, TargetReticle } from "../hud-elements"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  title: string
  category: string
  status: "COMPLETE" | "IN PROGRESS" | "ARCHIVED"
  year: string
  description: string
  tags: string[]
  link?: string
  image?: string
  video?: string
  featured?: boolean
  sections?: {
    id: string
    title?: string // Optional section title
    text: string
    media: {
      url: string
      type: "image" | "video"
      caption?: string
    }[]
  }[]
}

const CATEGORIES = ["ALL", "DIGITAL ART", "MOTION DESIGN", "WEB EXPERIENCE", "3D ENVIRONMENT", "INSTALLATION", "ILLUSTRATION"]

export function ProjectsSection() {
  const [filter, setFilter] = useState("ALL")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Failed to fetch projects", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
    // Refresh projects every 5 seconds for dynamic updates
    const interval = setInterval(fetchProjects, 5000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === "ALL" ? projects : projects.filter((p) => p.category === filter)

  if (loading) {
    return (
      <div className="flex flex-col gap-4 animate-boot-flicker">
        <div className="panel-border p-8 bg-background/30 flex items-center justify-center">
          <div className="text-accent text-glow animate-pulse">LOADING DATABASE...</div>
        </div>
      </div>
    )
  }

  if (selectedProject) {
    return (
      <div className="flex flex-col gap-4 animate-boot-flicker">
        {/* Back button */}
        <button
          onClick={() => setSelectedProject(null)}
          className="self-start text-xs text-muted-foreground hover:text-foreground tracking-widest transition-colors"
        >
          {'<'} RETURN TO PROJECT LIST
        </button>

        {/* Project detail */}
        <div className="panel-border-bright p-6 bg-background/30 relative">
          <CornerBrackets className="text-accent/40" />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <div className="text-[9px] text-muted-foreground tracking-widest mb-1">
                {selectedProject.id} // {selectedProject.year}
              </div>
              <h2 className="text-xl font-bold text-foreground text-glow-bright tracking-wider">
                {selectedProject.title}{selectedProject.featured ? " ★" : ""}
              </h2>
              <div className="text-[10px] text-accent tracking-widest mt-1">
                {selectedProject.category}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TargetReticle size={40} className="text-foreground/20" />
              <span
                className={`text-[9px] px-2 py-1 tracking-wider ${selectedProject.status === "COMPLETE"
                  ? "text-accent bg-accent/10 panel-border-bright"
                  : selectedProject.status === "IN PROGRESS"
                    ? "text-foreground bg-foreground/10 panel-border"
                    : "text-muted-foreground bg-muted/20 panel-border"
                  }`}
              >
                {selectedProject.status}
              </span>
            </div>
          </div>

          <ScanlineBar />

          {/* Media (Video or Image) */}
          {selectedProject.video ? (
            <div className="mt-6 p-1 bg-background/20">
              <video
                src={selectedProject.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                crossOrigin="anonymous"
                className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity media-fade-edges"
              />
            </div>
          ) : selectedProject.image ? (
            <div className="mt-6 p-1 bg-background/20">
              <img src={selectedProject.image} alt={selectedProject.title} crossOrigin="anonymous" className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity media-fade-edges" />
            </div>
          ) : null}

          {/* Description / Sections */}
          <div className="mt-6 panel-border p-4 bg-background/20">
            {/* ALWAYS SHOW PROJECT BRIEF (DESCRIPTION) */}
            <div className="mb-8">
              <div className="text-[9px] text-muted-foreground tracking-widest mb-2">PROJECT BRIEF:</div>
              <p className="text-base text-foreground/80 text-glow leading-relaxed">
                {selectedProject.description}
              </p>
            </div>

            {/* Sections Render */}
            {selectedProject.sections && selectedProject.sections.length > 0 && (
              <div className="flex flex-col gap-8 border-t border-border/50 pt-8">
                {selectedProject.sections.map((section) => (
                  <div key={section.id} className="group/section">
                    {/* Section Media */}
                    {section.media && section.media.length > 0 && (
                      <div className="mb-6">
                        {section.media.length > 1 ? (
                          <Carousel className="w-full relative">
                            <CarouselContent>
                              {section.media.map((item, idx) => (
                                <CarouselItem key={idx}>
                                  <div className="relative aspect-video w-full overflow-hidden bg-black/50">
                                    {item.type === 'video' ?
                                      <video src={item.url} preload="metadata" crossOrigin="anonymous" className="w-full h-full object-contain media-fade-edges" controls playsInline /> :
                                      <img src={item.url} crossOrigin="anonymous" className="w-full h-full object-contain media-fade-edges" alt="" />
                                    }
                                  </div>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2 bg-background/50 hover:bg-accent/50 border-accent/30 text-accent h-8 w-8" />
                            <CarouselNext className="right-2 bg-background/50 hover:bg-accent/50 border-accent/30 text-accent h-8 w-8" />
                          </Carousel>
                        ) : (
                          <div className="w-full p-1 bg-background/10">
                            {section.media[0].type === 'video' ?
                              <video src={section.media[0].url} preload="metadata" crossOrigin="anonymous" className="w-full h-auto opacity-90 media-fade-edges" controls playsInline /> :
                              <img src={section.media[0].url} crossOrigin="anonymous" className="w-full h-auto opacity-90 media-fade-edges" />
                            }
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section Text */}
                    <div className="prose prose-invert max-w-none">
                      <p className="text-base text-foreground/80 text-glow leading-relaxed whitespace-pre-wrap">
                        {section.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedProject.tags.map((tag) => (
              <span key={tag} className="text-[9px] px-2 py-1 panel-border text-accent/80 tracking-widest">
                {tag}
              </span>
            ))}
          </div>

          {/* Technical readout */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-[9px] text-muted-foreground tracking-wider">
            <div className="panel-border p-2 bg-background/20">
              <div className="text-foreground/30 mb-1">STATUS</div>
              <div className="text-foreground text-glow">{selectedProject.status}</div>
            </div>
            <div className="panel-border p-2 bg-background/20">
              <div className="text-foreground/30 mb-1">YEAR</div>
              <div className="text-foreground text-glow">{selectedProject.year}</div>
            </div>
            <div className="panel-border p-2 bg-background/20">
              <div className="text-foreground/30 mb-1">CATEGORY</div>
              <div className="text-foreground text-glow">{selectedProject.category}</div>
            </div>
            <div className="panel-border p-2 bg-background/20">
              <div className="text-foreground/30 mb-1">MODULES</div>
              <div className="text-foreground text-glow">{selectedProject.tags.length}</div>
            </div>
          </div>

          {/* Link */}
          {selectedProject.link && (
            <div className="mt-6">
              <a
                href={selectedProject.link}
                className="inline-flex items-center gap-2 text-xs text-accent text-glow tracking-widest panel-border-bright px-4 py-2 hover:bg-accent/10 transition-colors"
              >
                {'>'} VIEW PROJECT {'<'}
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 animate-boot-flicker">
      {/* Section header */}
      <div className="panel-border p-4 bg-background/30 relative">
        <CornerBrackets className="text-foreground/30" />
        <div className="flex items-center gap-3 mb-1">
          <DiamondHUD size={24} className="text-accent/60" />
          <h2 className="text-lg font-bold text-foreground text-glow-bright tracking-wider">PROJECTS</h2>
        </div>
        <div className="text-[10px] text-muted-foreground tracking-widest">
          CREATIVE WORKS DATABASE // {projects.length} ENTRIES FOUND
        </div>
        <ScanlineBar className="mt-3" />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-[9px] px-2 py-1 tracking-widest transition-all ${filter === cat
              ? "text-accent panel-border-bright bg-accent/5 text-glow"
              : "text-muted-foreground panel-border hover:text-foreground hover:bg-foreground/5"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedProject(project)}
            className="text-left p-4 panel-border bg-background/30 hover:bg-foreground/5 transition-all group relative h-full flex flex-col"
          >
            <CornerBrackets className="text-foreground/15 group-hover:text-foreground/40 transition-colors" />

            <div className="flex items-center justify-between mb-3 w-full">
              <span className="text-[9px] text-muted-foreground/50 tracking-widest">{project.id}</span>
              <span
                className={`text-[8px] px-1.5 py-0.5 tracking-wider ${project.status === "COMPLETE"
                  ? "text-accent bg-accent/10"
                  : project.status === "IN PROGRESS"
                    ? "text-foreground bg-foreground/10"
                    : "text-muted-foreground bg-muted/20"
                  }`}
              >
                {project.status}
              </span>
            </div>

            <h3 className="text-sm font-bold text-foreground text-glow tracking-wider group-hover:text-glow-bright transition-all mb-1">
              {project.title}{project.featured ? " ★" : ""}
            </h3>

            <div className="text-[10px] text-muted-foreground tracking-wider mb-3">
              {project.category} // {project.year}
            </div>

            {/* Thumbnail if available */}
            {project.video ? (
              <div className="mb-3 w-full h-24 overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
                <video
                  src={project.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all media-fade-edges"
                />
              </div>
            ) : project.image ? (
              <div className="mb-3 w-full h-24 overflow-hidden opacity-60 group-hover:opacity-90 transition-opacity">
                <img src={project.image} alt="" crossOrigin="anonymous" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all media-fade-edges" />
              </div>
            ) : null}

            <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3 mb-4 flex-grow">
              {project.description}
            </p>

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50 w-full">
              <div className="flex gap-1">
                {project.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[8px] px-1.5 py-0.5 panel-border text-foreground/40 tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-foreground/30 group-hover:text-foreground/60 tracking-widest transition-colors">
                {'> ACCESS'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer stats */}
      <div className="panel-border p-3 bg-background/20 flex flex-wrap items-center gap-4 text-[9px] text-muted-foreground tracking-wider">
        <span>TOTAL: {projects.length}</span>
        <span>COMPLETE: {projects.filter((p) => p.status === "COMPLETE").length}</span>
        <span>IN PROGRESS: {projects.filter((p) => p.status === "IN PROGRESS").length}</span>
        <span>ARCHIVED: {projects.filter((p) => p.status === "ARCHIVED").length}</span>
        <span className="text-accent">SHOWING: {filtered.length}</span>
      </div>
    </div>
  )
}

