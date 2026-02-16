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

interface ProjectDetail {
    id: string
    title: string
    desc: string
    tags: string[]
    image?: string
    link?: string
    featured: boolean
    video?: string
    sections?: Section[]
}

interface Section {
    id: string
    title?: string
    text: string
    media: SectionMedia[]
}

interface SectionMedia {
    url: string
    type: "image" | "video"
    caption?: string
}

export function FeaturedCarousel() {
    const [items, setItems] = useState<FeaturedItem[]>([])
    const [allMediaItems, setAllMediaItems] = useState<GalleryLikeItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState<GalleryLikeItem | null>(null)
    const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null)
    const [allProjects, setAllProjects] = useState<ProjectDetail[]>([])

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

                // Store full projects for detail view
                setAllProjects(projectsData)

                // Filter featured gallery items
                const featuredGalleryItems = galleryData.filter((item: any) => item.featured)
                const galleryItems: FeaturedItem[] = featuredGalleryItems.slice(0, 4).map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    mediaUrl: item.mediaUrl,
                    mediaType: item.mediaType,
                    source: "gallery" as const,
                    category: item.category,
                    year: item.year,
                    desc: item.desc
                }))

                // Filter featured projects
                const featuredProjects = projectsData.filter((p: any) => p.featured)
                const projectItems: FeaturedItem[] = featuredProjects.slice(0, 4).map((project: any) => ({
                    id: project.id,
                    title: project.title,
                    mediaUrl: project.video || project.image,
                    mediaType: project.video ? "video" : "image",
                    source: "project" as const,
                    category: "PROJECT",
                    year: project.year || "2026",
                    desc: project.desc || ""
                }))

                // Combine featured items and take first 8
                const combined = [...projectItems, ...galleryItems].slice(0, 8)
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
        // Refresh featured items every 5 seconds so changes appear immediately in admin
        const interval = setInterval(fetchFeaturedItems, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleItemClick = (item: FeaturedItem) => {
        if (item.source === "project") {
            // Open full project detail
            const project = allProjects.find(p => p.id === item.id)
            if (project) {
                setSelectedProject(project)
            }
        } else {
            // Open gallery lightbox
            const mediaItem = allMediaItems.find(m => m.id === item.id)
            if (mediaItem) {
                setSelectedItem(mediaItem)
            }
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

    // Render full project detail view
    if (selectedProject) {
        return (
            <div className="flex flex-col gap-4 animate-boot-flicker">
                <button
                    onClick={() => setSelectedProject(null)}
                    className="self-start text-xs text-muted-foreground hover:text-foreground tracking-widest transition-colors"
                >
                    {'<'} RETURN TO FEATURED WORKS
                </button>

                <div className="panel-border-bright p-6 bg-background/30 relative">
                    <CornerBrackets className="text-accent/40" />

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                        <div>
                            <div className="text-[9px] text-muted-foreground tracking-widest mb-1">
                                {selectedProject.id} // {selectedProject.year || "2026"}
                            </div>
                            <h2 className="text-xl font-bold text-foreground text-glow-bright tracking-wider">
                                {selectedProject.title}{selectedProject.featured ? " ★" : ""}
                            </h2>
                        </div>
                    </div>

                    {/* Main media */}
                    <div className="mb-6 max-w-2xl">
                        {selectedProject.video ? (
                            <video src={selectedProject.video} controls className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity border border-border" />
                        ) : selectedProject.image ? (
                            <img src={selectedProject.image} alt={selectedProject.title} crossOrigin="anonymous" className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity border border-border" />
                        ) : null}
                    </div>

                    {/* Description */}
                    <div className="mb-6 space-y-3">
                        <p className="text-sm text-foreground/80 leading-relaxed">{selectedProject.desc}</p>
                        {selectedProject.tags && selectedProject.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {selectedProject.tags.map(tag => (
                                    <span key={tag} className="text-[9px] px-2 py-1 panel-border text-foreground/60 tracking-widest">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Link */}
                    {selectedProject.link && (
                        <div className="mt-6">
                            <a
                                href={selectedProject.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-xs text-accent text-glow tracking-widest panel-border-bright px-4 py-2 hover:bg-accent/10 transition-colors"
                            >
                                {'>'} VIEW PROJECT {'<'}
                            </a>
                        </div>
                    )}

                    {/* Sections */}
                    {selectedProject.sections && selectedProject.sections.length > 0 && (
                        <div className="mt-6 space-y-6 border-t border-border pt-6">
                            {selectedProject.sections.map((section, idx) => (
                                <div key={section.id} className="space-y-3">
                                    {section.text && (
                                        <p className="text-sm text-foreground/70">{section.text}</p>
                                    )}
                                    {section.media && section.media.length > 0 && (
                                        <div className="space-y-3">
                                            {section.media.map((media, midx) => (
                                                <div key={midx} className="max-w-2xl">
                                                    {media.type === "video" ? (
                                                        <video src={media.url} controls className="w-full h-auto border border-border" />
                                                    ) : (
                                                        <img src={media.url} alt="" crossOrigin="anonymous" className="w-full h-auto border border-border" />
                                                    )}
                                                    {media.caption && (
                                                        <p className="text-[9px] text-muted-foreground mt-2 italic">{media.caption}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

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

            {/* Lightbox for gallery items */}
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
