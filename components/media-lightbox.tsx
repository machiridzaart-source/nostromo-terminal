"use client"

import { useState, useRef, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { CornerBrackets } from "./hud-elements"

interface MediaItem {
  id: string
  title: string
  category: string
  year: string
  desc: string
  mediaUrl: string
  mediaType: "image" | "video"
}

interface MediaLightboxProps {
  item: MediaItem
  allItems: MediaItem[]
  onClose: () => void
  onNavigate: (item: MediaItem) => void
}

export function MediaLightbox({ item, allItems, onClose, onNavigate }: MediaLightboxProps) {
  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  const currentIndex = allItems.findIndex(i => i.id === item.id)
  const hasNext = currentIndex < allItems.length - 1
  const hasPrev = currentIndex > 0

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 5))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 1))
  const handleResetZoom = () => {
    setZoom(1)
    setPanX(0)
    setPanY(0)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (item.mediaType === "video") return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setZoom((prev) => Math.max(1, Math.min(prev + delta, 5)))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (item.mediaType === "video" || zoom === 1) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - panX, y: e.clientY - panY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    setPanX(e.clientX - panStart.x)
    setPanY(e.clientY - panStart.y)
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const handlePrev = () => {
    if (hasPrev) {
      onNavigate(allItems[currentIndex - 1])
      setZoom(1)
      setPanX(0)
      setPanY(0)
    }
  }

  const handleNext = () => {
    if (hasNext) {
      onNavigate(allItems[currentIndex + 1])
      setZoom(1)
      setPanX(0)
      setPanY(0)
    }
  }

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-boot-flicker">
      {/* Modal container */}
      <div className="relative w-full h-full md:w-11/12 md:h-5/6 md:max-w-6xl flex flex-col panel-border-bright bg-background/95">
        <CornerBrackets className="text-accent/30 pointer-events-none" />

        {/* Header */}
        <div className="border-b border-border p-4 flex items-center justify-between bg-background/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent animate-pulse-glow" />
            <span className="text-xs text-foreground text-glow tracking-widest">{`FILE: ${item.title}`}</span>
            <span className="text-[9px] text-muted-foreground tracking-wider">// {item.category} • {item.year}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-muted-foreground tracking-wider">{`${currentIndex + 1} / ${allItems.length}`}</span>
            <button
              onClick={onClose}
              className="hover:text-accent transition-colors hover:bg-accent/10 p-1 border border-border"
              title="Close (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Media display */}
          <div
            className="flex-1 relative bg-black/50 flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden group"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {item.mediaUrl ? (
              item.mediaType === "video" ? (
                <video
                  src={item.mediaUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const error = (e.target as HTMLVideoElement).error
                    console.error("Lightbox video error:", error?.code, error?.message)
                  }}
                  onStalled={() => console.warn("Lightbox video stalled - buffering")}
                  onLoadedMetadata={() => console.log("Lightbox video metadata loaded")}
                  className="max-w-full max-h-full w-auto h-auto media-fade-edges"
                />
              ) : (
                <img
                  ref={imageRef}
                  src={item.mediaUrl}
                  alt={item.title}
                  crossOrigin="anonymous"
                  className="media-fade-edges select-none transition-transform"
                  style={{
                    transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                  }}
                  draggable={false}
                />
              )
            ) : (
              <div className="text-muted-foreground text-xs">NO MEDIA SIGNAL</div>
            )}

            {/* Zoom controls for images */}
            {item.mediaType === "image" && (
              <div className="absolute bottom-4 left-4 flex gap-2 z-20">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  className="px-2 py-1 text-xs panel-border text-foreground hover:bg-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-wider"
                  title="Zoom Out"
                >
                  {"[ - ]"}
                </button>
                <div className="px-2 py-1 text-xs panel-border bg-background/50 text-accent tracking-wider">
                  {(zoom * 100).toFixed(0)}%
                </div>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 5}
                  className="px-2 py-1 text-xs panel-border text-foreground hover:bg-foreground/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors tracking-wider"
                  title="Zoom In"
                >
                  {"[ + ]"}
                </button>
                {zoom > 1 && (
                  <button
                    onClick={handleResetZoom}
                    className="px-2 py-1 text-xs panel-border text-foreground hover:bg-foreground/10 transition-colors tracking-wider"
                    title="Reset Zoom"
                  >
                    {"[ RESET ]"}
                  </button>
                )}
              </div>
            )}
            {item.mediaType === "image" && zoom > 1 && (
              <div className="absolute top-4 left-4 text-[8px] text-muted-foreground tracking-widest pointer-events-none">
                DRAG TO PAN
              </div>
            )}

            {/* Navigation arrows */}
            {hasPrev && (
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-background/50 hover:bg-accent/20 border border-border text-accent transition-all"
                title="Previous (← Arrow)"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {hasNext && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background/50 hover:bg-accent/20 border border-border text-accent transition-all"
                title="Next (→ Arrow)"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Details panel */}
          <div className="w-64 flex flex-col gap-3 border-l border-border pl-4 overflow-y-auto">
            <h2 className="text-sm text-foreground text-glow-bright font-bold tracking-wider">{item.title}</h2>
            <div className="space-y-2 text-[9px] text-muted-foreground tracking-wider">
              <div className="flex gap-2">
                <span className="w-16 shrink-0">CATEGORY:</span>
                <span className="text-foreground">{item.category}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-16 shrink-0">YEAR:</span>
                <span className="text-foreground">{item.year}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-16 shrink-0">ID:</span>
                <span className="text-accent font-mono">{item.id}</span>
              </div>
            </div>
            <div className="w-full h-px bg-border my-2" />
            <p className="text-xs text-foreground/70 text-glow leading-relaxed">{item.desc}</p>
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="border-t border-border p-3 bg-background/50 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className="flex items-center gap-1 text-xs text-foreground hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors panel-border px-2 py-1 tracking-wider"
          >
            <ChevronLeft size={14} />
            PREV
          </button>
          <span className="text-[9px] text-muted-foreground tracking-widest">[ESC] CLOSE • [← →] NAVIGATE</span>
          <button
            onClick={handleNext}
            disabled={!hasNext}
            className="flex items-center gap-1 text-xs text-foreground hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors panel-border px-2 py-1 tracking-wider"
          >
            NEXT
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
