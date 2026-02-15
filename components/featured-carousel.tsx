"use client"

import { useState, useEffect } from "react"
import { CornerBrackets } from "./hud-elements"
import { MediaLightbox } from "./media-lightbox"

interface FeaturedItem {
    id: string
    title: string
    mediaUrl: string
    mediaType: "image" | "video"
    source: "gallery" | "project"
    category?: string
    year?: string
    desc?: string
}

interface GalleryLikeItem {
    id: string
    title: string
    category: string
    year: string
    desc: string
    mediaUrl: string
    mediaType: "image" | "video"
}

export function FeaturedCarousel() {
    const [items, setItems] = useState<FeaturedItem[]>([])
    const [allMediaItems, setAllMediaItems] = useState<GalleryLikeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState<GalleryLikeItem | null>(null)

    useEffect(() => {
        async function fetchFeaturedItems() {
            try {
                // Fetch from both gallery and projects
                const [galleryRes, projectsRes] = await Promise.all([
                    fetch('/api/gallery'),
                    fetch('/api/projects')
                ])

                const galleryData = galleryRes.ok ? await galleryRes.json() : []
                const projectsData = projectsRes.ok ? await projectsRes.json() : []

                // Convert gallery items to featured format
                const galleryItems: FeaturedItem[] = galleryData.slice(0, 2).map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    mediaUrl: item.mediaUrl,
                    mediaType: item.mediaType,
                    source: "gallery" as const,
                    category: item.category,
                    year: item.year,
                    desc: item.desc
                }))

                // Convert projects to featured format (prioritize featured projects)
                const featuredProjects = projectsData.filter((p: any) => p.featured)
                const projectItems: FeaturedItem[] = (featuredProjects.length > 0 ? featuredProjects : projectsData)
                    .slice(0, 2)
                    .map((project: any) => ({
                        id: project.id,
                        title: project.title,
                        mediaUrl: project.video || project.image,
                        mediaType: project.video ? "video" : "image",
                        source: "project" as const,
                        category: "PROJECT",
                        year: project.year || "2026",
                        desc: project.desc || ""
                    }))

                // Combine and take first 4
                const combined = [...projectItems, ...galleryItems].slice(0, 4)
                setItems(combined)

                // Create unified list for lightbox navigation
                const combinedMediaItems: GalleryLikeItem[] = [
                    ...projectsData.map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        category: "PROJECT",
                        year: p.year || "2026",
                        desc: p.desc || "",
                        mediaUrl: p.video || p.image,
                        mediaType: p.video ? "video" as const : "image" as const
                    })),
                    ...galleryData.map((g: any) => ({
                        id: g.id,
                        title: g.title,
                        category: g.category,
                        year: g.year,
                        desc: g.desc,
                        mediaUrl: g.mediaUrl,
                        mediaType: g.mediaType
                    }))
                ]
                setAllMediaItems(combinedMediaItems)
            } catch (error) {
                console.error("Failed to fetch featured items", error)
            } finally {
                setLoading(false)
            }
        }

        fetchFeaturedItems()
    }, [])

    const handleItemClick = (item: FeaturedItem) => {
        const mediaItem = allMediaItems.find(m => m.id === item.id)
        if (mediaItem) {
            setSelectedItem(mediaItem)
        }
    }

    if (loading) {
        return (
            <div className="text-xs text-accent animate-pulse tracking-wider">
                LOADING FEATURED WORKS...
            </div>
        )
    }

    if (items.length === 0) return null

    return (
        <>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent animate-pulse-glow" />
                    <span className="text-[10px] text-muted-foreground tracking-widest">
                        FEATURED WORKS
                    </span>
                    <div className="flex-1 h-px bg-border" />
                </div>

                {/* Grid layout showing all items in a row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="relative overflow-hidden bg-black/50 group aspect-square hover:bg-black/40 transition-all cursor-pointer"
                        >
                            <CornerBrackets className="text-accent/30 group-hover:text-accent/60 transition-colors z-20" />

                            {/* Media */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                {item.mediaType === "video" ? (
                                    <video
                                        src={item.mediaUrl}
                                        muted
                                        loop
                                        playsInline
                                        onMouseEnter={(e) => e.currentTarget.play()}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.pause()
                                            e.currentTarget.currentTime = 0
                                        }}
                                        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity media-fade-edges"
                                    />
                                ) : (
                                    <img
                                        src={item.mediaUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity media-fade-edges"
                                    />
                                )}
                            </div>

                            {/* Overlay info */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent p-3 z-20">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-foreground text-glow-bright font-bold tracking-wider truncate">
                                        {item.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-accent tracking-wider px-1.5 py-0.5 panel-border-bright bg-accent/10">
                                        {item.source === "gallery" ? item.category : "PROJECT"}
                                    </span>
                                    <span className="text-[8px] text-muted-foreground tracking-wider">
                                        {item.mediaType.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Hover indicator */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 bg-background/50 backdrop-blur-sm">
                                <span className="text-xs text-accent text-glow-bright tracking-widest">{"> OPEN"}</span>
                            </div>

                            {/* Scanline effect */}
                            <div className="absolute inset-0 pointer-events-none z-25 opacity-10">
                                <div className="w-full h-full bg-gradient-to-b from-transparent via-foreground/5 to-transparent animate-scanline" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Lightbox for selected item */}
            {selectedItem && (
                <MediaLightbox
                    item={selectedItem}
                    allItems={allMediaItems}
                    onClose={() => setSelectedItem(null)}
                    onNavigate={setSelectedItem}
                />
            )}
        </>
    )
}
