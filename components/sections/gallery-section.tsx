"use client"

import { useState, useEffect, useRef } from "react"
import { CornerBrackets } from "../hud-elements"
import { MediaLightbox } from "../media-lightbox"

interface GalleryItem {
  id: string
  title: string
  category: string
  year: string
  desc: string
  mediaUrl: string
  mediaType: "image" | "video"
  featured?: boolean
}

// Default colors for visual consistency if not provided in data
const DEFAULT_COLORS = ["#00ff41", "#003b00"]

const CATEGORIES = ["ALL", "STORYBOARDS", "ANIMATION", "CHARACTER DESIGN", "MISC"]
const SORT_OPTIONS = ["NEWEST", "OLDEST", "TITLE", "FEATURED"]

function ArtThumbnail({ piece, onClick }: { piece: GalleryItem; onClick: () => void }) {
  const [isHovering, setIsHovering] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (videoRef.current && piece.mediaType === "video") {
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Video play interrupted:", error.message)
        })
      }
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (videoRef.current && piece.mediaType === "video") {
      try {
        videoRef.current.pause()
      } catch (error) {
        console.error("Video pause error:", error)
      }
    }
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="text-left bg-background/30 hover:bg-foreground/5 transition-all group relative overflow-hidden w-full aspect-square"
    >
      <CornerBrackets className="text-foreground/15 group-hover:text-foreground/40 transition-colors z-10" />

      <div className="w-full h-full relative overflow-hidden">
        {piece.mediaUrl ? (
          piece.mediaType === "video" ? (
            <video
              ref={videoRef}
              src={piece.mediaUrl}
              muted
              loop
              playsInline
              preload="auto"
              crossOrigin="anonymous"
              onError={(e) => {
                const error = (e.target as HTMLVideoElement).error
                console.error("Gallery video error:", error?.code, error?.message)
              }}
              onStalled={() => console.warn("Gallery video stalled - buffering")}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity media-fade-edges"
            />
          ) : (
            <img src={piece.mediaUrl} alt={piece.title} crossOrigin="anonymous" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity media-fade-edges" />
          )
        ) : (
          /* Fallback Pattern if no media */
          <svg viewBox="0 0 200 200" className="w-full h-full opacity-50" aria-hidden="true">
            <rect width="200" height="200" fill={DEFAULT_COLORS[1]} />
            <line x1="0" y1="0" x2="200" y2="200" stroke={DEFAULT_COLORS[0]} strokeWidth="1" opacity="0.5" />
            <line x1="200" y1="0" x2="0" y2="200" stroke={DEFAULT_COLORS[0]} strokeWidth="1" opacity="0.5" />
          </svg>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
          <span className="text-xs text-accent text-glow-bright tracking-widest">{'> VIEW'}</span>
        </div>
      </div>

      {/* Info Overlay (always visible at bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/90 border-t border-border z-20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-foreground text-glow font-bold tracking-wider truncate">{piece.title}{piece.featured ? " ★" : ""}</span>
        </div>
        <div className="flex items-center gap-2 text-[8px] text-muted-foreground tracking-wider">
          <span className="px-1 py-0.5 panel-border">{piece.category}</span>
        </div>
      </div>
    </button>
  )
}

export function GallerySection() {
  const [filter, setFilter] = useState("ALL")
  const [sort, setSort] = useState("NEWEST")
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch('/api/gallery')
        if (res.ok) {
          const data = await res.json()
          setGalleryItems(Array.isArray(data) ? data : [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchGallery()
    // Refresh gallery every 5 seconds for dynamic updates
    const interval = setInterval(fetchGallery, 5000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === "ALL" ? galleryItems : galleryItems.filter((p) => p.category === filter)

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case "NEWEST":
        return parseInt(b.year) - parseInt(a.year)
      case "OLDEST":
        return parseInt(a.year) - parseInt(b.year)
      case "TITLE":
        return a.title.localeCompare(b.title)
      case "FEATURED":
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      default:
        return 0
    }
  })

  if (loading) return <div className="text-xs text-accent animate-pulse">LOADING GALLERY MODULE...</div>

  return (
    <div className="flex flex-col gap-4 animate-boot-flicker">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-accent animate-pulse-glow" />
        <h1 className="text-lg text-foreground text-glow-bright font-bold tracking-widest">
          ART GALLERY
        </h1>
        <span className="text-[10px] text-muted-foreground tracking-wider">{`// ${sorted.length} FILES LOADED`}</span>
      </div>

      {/* Filter and Sort bar */}
      <div className="flex flex-col gap-2 panel-border p-2 bg-background/30">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] text-muted-foreground tracking-widest mr-2">FILTER:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-[10px] px-2 py-1 tracking-wider transition-all ${filter === cat
                ? "panel-border-bright text-accent text-glow-bright bg-accent/5"
                : "panel-border text-foreground/50 hover:text-foreground"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <span className="text-[9px] text-muted-foreground tracking-widest mr-2">SORT:</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setSort(option)}
              className={`text-[10px] px-2 py-1 tracking-wider transition-all ${sort === option
                ? "panel-border-bright text-accent text-glow-bright bg-accent/5"
                : "panel-border text-foreground/50 hover:text-foreground"
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map((piece) => (
          <ArtThumbnail key={piece.id} piece={piece} onClick={() => setLightboxItem(piece)} />
        ))}
        {sorted.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground text-xs border border-dashed border-border">
            NO ARTIFACTS FOUND IN THIS SECTOR
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      {lightboxItem && (
        <MediaLightbox 
          item={lightboxItem} 
          allItems={sorted}
          onClose={() => setLightboxItem(null)}
          onNavigate={setLightboxItem}
        />
      )}
    </div>
  )
}
