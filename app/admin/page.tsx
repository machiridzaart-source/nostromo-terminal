"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ScanlineBar, CornerBrackets, TriangleWarning, HexagonNode } from "@/components/hud-elements"

// --- TYPES ---
interface Project {
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
    title?: string // Optional section title
    text: string
    media: SectionMedia[]
}

interface SectionMedia {
    url: string
    type: "image" | "video"
    caption?: string
}

interface GalleryItem {
    id: string
    title: string
    category: string
    year: string
    desc: string
    mediaUrl: string
    mediaType: "image" | "video"
}

interface CustomPage {
    id: string
    title: string
    content: string
}

interface ContentData {
    home: any
    about: any
    skills: any
    contact: any
    customPages: CustomPage[]
}

// --- COMPONENTS ---

// Save Success Notification
function SaveNotification({ show, message }: { show: boolean, message: string }) {
    if (!show) return null
    return (
        <div className="fixed top-4 right-4 z-50 animate-boot-flicker">
            <div className="panel-border-bright bg-background/95 p-4 flex items-center gap-3 min-w-[300px]">
                <div className="w-3 h-3 bg-accent animate-pulse-glow" />
                <div>
                    <div className="text-xs text-accent text-glow-bright tracking-widest font-bold">SAVE COMPLETE</div>
                    <div className="text-[10px] text-foreground/70 tracking-wider mt-1">{message}</div>
                </div>
            </div>
        </div>
    )
}

// 1. Sidebar Item
function SidebarItem({ label, isActive, onClick, isSubItem = false }: { label: string, isActive: boolean, onClick: () => void, isSubItem?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`
        w-full text-left px-4 py-2 text-sm tracking-wider transition-all relative
        ${isActive
                    ? "bg-foreground/10 text-accent text-glow-bright border-l-2 border-accent"
                    : "text-foreground/60 hover:text-foreground hover:bg-foreground/5 border-l-2 border-transparent"
                }
        ${isSubItem ? "pl-8 text-[11px]" : ""}
      `}
        >
            {label}
        </button>
    )
}

// 2. Project Editor
function ProjectEditor() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [isNew, setIsNew] = useState(false)
    const [showSaveNotif, setShowSaveNotif] = useState(false)
    const [uploadingField, setUploadingField] = useState<'image' | 'video' | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
    const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)
    const imageWidgetRef = useRef<any>(null)
    const videoWidgetRef = useRef<any>(null)

    useEffect(() => {
        fetchProjects()
        initializeCloudinaryWidgets()
    }, [])

    function initializeCloudinaryWidgets() {
        if (typeof window !== 'undefined' && (window as any).cloudinary) {
            // Initialize image widget
            imageWidgetRef.current = (window as any).cloudinary.createUploadWidget(
                {
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload',
                    resourceType: 'image',
                    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                    maxFileSize: 52428800, // 50MB
                },
                (error: any, result: any) => {
                    if (error) {
                        setUploadError(`Image upload failed: ${error.message}`)
                        setUploadingField(null)
                        return
                    }
                    if (result?.event === 'success') {
                        if (editingProject) {
                            setEditingProject({ ...editingProject, image: result.info.secure_url })
                            setUploadSuccess('IMAGE')
                            setSelectedImageFile(null)
                            if (imageInputRef.current) imageInputRef.current.value = ''
                            setUploadError(null)
                            setUploadingField(null)
                            setTimeout(() => setUploadSuccess(null), 3000)
                        }
                    }
                }
            )

            // Initialize video widget
            videoWidgetRef.current = (window as any).cloudinary.createUploadWidget(
                {
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload',
                    resourceType: 'video',
                    clientAllowedFormats: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'],
                    maxFileSize: 1073741824, // 1GB for videos
                },
                (error: any, result: any) => {
                    if (error) {
                        setUploadError(`Video upload failed: ${error.message}`)
                        setUploadingField(null)
                        return
                    }
                    if (result?.event === 'success') {
                        if (editingProject) {
                            setEditingProject({ ...editingProject, video: result.info.secure_url })
                            setUploadSuccess('VIDEO')
                            setSelectedVideoFile(null)
                            if (videoInputRef.current) videoInputRef.current.value = ''
                            setUploadError(null)
                            setUploadingField(null)
                            setTimeout(() => setUploadSuccess(null), 3000)
                        }
                    }
                }
            )
        }
    }

    function openImageUpload() {
        setUploadingField('image')
        setUploadError(null)
        imageWidgetRef.current?.open()
    }

    function openVideoUpload() {
        setUploadingField('video')
        setUploadError(null)
        videoWidgetRef.current?.open()
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    async function fetchProjects() {
        try {
            const res = await fetch('/api/projects')
            const data = await res.json()
            setProjects(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this project?")) return
        await fetch('/api/projects', {
            method: 'DELETE',
            body: JSON.stringify({ id })
        })
        fetchProjects()
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!editingProject) return

        const method = isNew ? 'POST' : 'PUT'
        await fetch('/api/projects', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingProject)
        })
        setShowSaveNotif(true)
        setTimeout(() => setShowSaveNotif(false), 3000)
        setEditingProject(null)
        fetchProjects()
    }

    if (loading) return <div>Loading Projects...</div>

    if (editingProject) {
        return (
            <div className="space-y-4">
                {uploadSuccess && (
                    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 border border-accent/30">
                        <div className="bg-background border-2 border-accent p-6 max-w-md">
                            <div className="text-center">
                                <div className="text-4xl text-accent mb-4">★</div>
                                <h2 className="text-accent text-lg font-bold tracking-widest mb-2">{uploadSuccess} UPLOADED</h2>
                                <p className="text-xs text-muted-foreground mb-4">Successfully uploaded to cloud storage</p>
                                <button
                                    type="button"
                                    onClick={() => setUploadSuccess(null)}
                                    className="text-xs px-6 py-2 bg-accent/20 hover:bg-accent/30 border border-accent/30 text-accent tracking-wider font-bold"
                                >
                                    CONTINUE
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <h3 className="text-accent text-lg font-bold">{isNew ? "NEW PROJECT" : "EDIT PROJECT"}</h3>
                    <button onClick={() => setEditingProject(null)} className="text-xs hover:text-accent">[CANCEL]</button>
                </div>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground">TITLE</label>
                            <input
                                className="bg-background/50 border border-border p-2 text-sm text-foreground"
                                value={editingProject.title}
                                onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground">ID (UNIQUE)</label>
                            <input
                                className="bg-background/50 border border-border p-2 text-sm text-foreground"
                                value={editingProject.id}
                                onChange={e => setEditingProject({ ...editingProject, id: e.target.value })}
                                required
                                disabled={!isNew}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted-foreground">DESCRIPTION</label>
                        <textarea
                            className="bg-background/50 border border-border p-2 text-sm text-foreground h-24"
                            value={editingProject.desc}
                            onChange={e => setEditingProject({ ...editingProject, desc: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground">TAGS (COMMA SEPARATED)</label>
                            <input
                                className="bg-background/50 border border-border p-2 text-sm text-foreground"
                                value={editingProject.tags?.join(", ")}
                                onChange={e => setEditingProject({ ...editingProject, tags: e.target.value.split(",").map(t => t.trim()) })}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground">LINK URL</label>
                            <input
                                className="bg-background/50 border border-border p-2 text-sm text-foreground"
                                value={editingProject.link || ""}
                                onChange={e => setEditingProject({ ...editingProject, link: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 border border-border p-4 bg-background/20">
                        <label className="text-[10px] text-muted-foreground mb-2">PROJECT IMAGE</label>
                        {editingProject.image && (
                            <div className="mb-3">
                                <img key={editingProject.image} src={editingProject.image} alt="Preview" crossOrigin="anonymous" className="h-20 w-32 object-cover border border-accent/30" onError={() => console.error('Image failed to load:', editingProject.image)} />
                                <div className="text-[9px] text-accent mt-2">✓ Image uploaded</div>
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <div className="border border-border/50 p-2 bg-background/10">
                                <input 
                                    ref={imageInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        setSelectedImageFile(file || null)
                                        setUploadError(null)
                                    }}
                                    className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:border-0 file:text-xs file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer w-full"
                                />
                                {selectedImageFile && (
                                    <div className="text-[9px] text-accent mt-1">✓ {selectedImageFile.name} ({(selectedImageFile.size / (1024 * 1024)).toFixed(2)}MB)</div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={openImageUpload}
                                disabled={!selectedImageFile || uploadingField === 'image'}
                                className="text-xs px-4 py-2 bg-accent/20 hover:bg-accent/30 disabled:opacity-50 border border-accent/30 text-accent tracking-wider disabled:cursor-not-allowed font-bold"
                            >
                                {uploadingField === 'image' ? 'UPLOADING...' : 'UPLOAD IMAGE'}
                            </button>
                        </div>
                        {uploadingField === 'image' && (
                            <div className="text-xs text-accent animate-pulse mt-2">► UPLOADING IMAGE...</div>
                        )}
                        {uploadError && uploadingField === 'image' && (
                            <div className="text-xs text-red-500 p-2 bg-red-500/10 border border-red-500/30 font-mono mt-2">{uploadError}</div>
                        )}
                        <div className="text-[9px] text-muted-foreground/60 mt-1">Direct upload to cloud • Up to 50MB</div>
                    </div>

                    <div className="flex flex-col gap-1 border border-border p-4 bg-background/20">
                        <label className="text-[10px] text-muted-foreground mb-2">PROJECT VIDEO (OPTIONAL)</label>
                        <div className="flex gap-4 items-center mb-2">
                            <input
                                className="bg-background/50 border border-border p-2 text-sm text-foreground flex-1"
                                placeholder="Or paste video URL directly"
                                value={editingProject.video || ""}
                                onChange={e => setEditingProject({ ...editingProject, video: e.target.value })}
                            />
                        </div>
                        {editingProject.video && !selectedVideoFile && (
                            <div className="mb-3">
                                <video key={editingProject.video} src={editingProject.video} crossOrigin="anonymous" preload="metadata" className="h-20 w-32 object-cover border border-accent/30" muted onError={() => console.error('Video failed to load:', editingProject.video)} />
                                <div className="text-[9px] text-accent mt-2">✓ Video ready</div>
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <div className="border border-border/50 p-2 bg-background/10">
                                <input 
                                    ref={videoInputRef}
                                    type="file" 
                                    accept="video/*" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        setSelectedVideoFile(file || null)
                                        setUploadError(null)
                                    }}
                                    className="text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:border-0 file:text-xs file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer w-full"
                                />
                                {selectedVideoFile && (
                                    <div className="text-[9px] text-accent mt-1">✓ {selectedVideoFile.name} ({(selectedVideoFile.size / (1024 * 1024)).toFixed(2)}MB)</div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={openVideoUpload}
                                disabled={!selectedVideoFile || uploadingField === 'video'}
                                className="text-xs px-4 py-2 bg-accent/20 hover:bg-accent/30 disabled:opacity-50 border border-accent/30 text-accent tracking-wider disabled:cursor-not-allowed font-bold"
                            >
                                {uploadingField === 'video' ? 'UPLOADING...' : 'UPLOAD VIDEO'}
                            </button>
                        </div>
                        {uploadingField === 'video' && (
                            <div className="text-xs text-accent animate-pulse mt-2">► UPLOADING VIDEO...</div>
                        )}
                        {uploadError && uploadingField === 'video' && (
                            <div className="text-xs text-red-500 p-2 bg-red-500/10 border border-red-500/30 font-mono mt-2">{uploadError}</div>
                        )}
                        <div className="text-[9px] text-muted-foreground/60 mt-1">Direct upload to cloud • Up to 1GB videos</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={!!editingProject.featured}
                            onChange={e => setEditingProject({ ...editingProject, featured: e.target.checked })}
                        />
                        <label className="text-xs">FEATURED PROJECT</label>
                    </div>

                    <div className="border border-border p-4 bg-background/10">
                        <label className="text-xs font-bold text-accent mb-4 block">CONTENT SECTIONS</label>
                        <SectionEditor
                            sections={editingProject.sections || []}
                            onChange={sections => setEditingProject({ ...editingProject, sections })}
                        />
                    </div>

                    <button type="submit" className="bg-accent text-background font-bold py-2 hover:bg-accent/80 transition-colors">
                        SAVE PROJECT
                    </button>
                </form>
            </div>
        )
    }

    return (
        <>
            <SaveNotification show={showSaveNotif} message="Project saved successfully" />
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-background/30 p-2 border border-border">
                    <h3 className="text-sm font-bold tracking-widest pl-2">PROJECT LIST</h3>
                    <button
                        onClick={() => { setIsNew(true); setEditingProject({ id: "", title: "", desc: "", tags: [], featured: false, video: "", sections: [] }); }}
                        className="bg-accent/10 hover:bg-accent/20 text-accent text-xs px-3 py-1 border border-accent/20"
                    >
                        + NEW PROJECT
                    </button>
                </div>
                {/* ... list remains the same ... */}
                <div className="grid gap-2">
                    {projects.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-background/20 border border-border hover:border-accent/30 transition-colors group">
                            <div className="flex items-center gap-3">
                                {p.image ? (
                                    <img src={p.image} crossOrigin="anonymous" className="w-8 h-8 object-cover border border-border" />
                                ) : (
                                    <div className="w-8 h-8 bg-foreground/5 border border-border" />
                                )}
                                <div>
                                    <div className="text-sm font-bold">{p.title}</div>
                                    <div className="text-[10px] text-muted-foreground">{p.tags?.join(", ")}</div>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setIsNew(false); setEditingProject(p); }}
                                    className="text-xs hover:text-accent px-2"
                                >
                                    EDIT
                                </button>
                                <button
                                    onClick={() => handleDelete(p.id)}
                                    className="text-xs hover:text-destructive px-2"
                                >
                                    DEL
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

function SectionEditor({ sections, onChange }: { sections: Section[], onChange: (s: Section[]) => void }) {

    function addSection() {
        onChange([...sections, { id: Date.now().toString(), text: "", media: [] }])
    }

    function removeSection(index: number) {
        const newSections = [...sections]
        newSections.splice(index, 1)
        onChange(newSections)
    }

    function updateSection(index: number, field: keyof Section, value: any) {
        const newSections = [...sections]
        newSections[index] = { ...newSections[index], [field]: value }
        onChange(newSections)
    }

    async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>, sectionIndex: number) {
        const files = e.target.files
        if (!files || files.length === 0) return

        const newMedia: SectionMedia[] = []

        for (let i = 0; i < files.length; i++) {
            const formData = new FormData()
            formData.append('file', files[i])
            try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData })
                const data = await res.json()
                if (data.success) {
                    newMedia.push({
                        url: data.url,
                        type: files[i].type.startsWith('video') ? 'video' : 'image'
                    })
                }
            } catch (err) { console.error(err) }
        }

        const currentSection = sections[sectionIndex]
        updateSection(sectionIndex, 'media', [...currentSection.media, ...newMedia])
    }

    function removeMedia(sectionIndex: number, mediaIndex: number) {
        const newSections = [...sections]
        newSections[sectionIndex].media.splice(mediaIndex, 1)
        onChange(newSections)
    }

    function moveSection(index: number, direction: -1 | 1) {
        if (index + direction < 0 || index + direction >= sections.length) return
        const newSections = [...sections]
        const temp = newSections[index]
        newSections[index] = newSections[index + direction]
        newSections[index + direction] = temp
        onChange(newSections)
    }

    return (
        <div className="space-y-4">
            {sections.map((section, idx) => (
                <div key={section.id} className="border border-border/50 bg-background/20 p-4 relative group">
                    <div className="absolute right-2 top-2 flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => moveSection(idx, -1)} disabled={idx === 0} className="hover:text-accent">↑</button>
                        <button type="button" onClick={() => moveSection(idx, 1)} disabled={idx === sections.length - 1} className="hover:text-accent">↓</button>
                        <button type="button" onClick={() => removeSection(idx)} className="hover:text-destructive text-destructive">×</button>
                    </div>

                    <div className="mb-2">
                        <label className="text-[10px] text-muted-foreground block mb-1">SECTION TEXT</label>
                        <textarea
                            className="w-full bg-background/50 border border-border p-2 text-sm h-24"
                            value={section.text}
                            onChange={e => updateSection(idx, 'text', e.target.value)}
                            placeholder="Write your paragraph here..."
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">MEDIA (IMAGES/VIDEO)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {section.media.map((m, mIdx) => (
                                <div key={mIdx} className="relative w-16 h-16 border border-border group/media">
                                    {m.type === 'video' ?
                                        <video src={m.url} className="w-full h-full object-cover" muted /> :
                                        <img src={m.url} className="w-full h-full object-cover" />
                                    }
                                    <button
                                        type="button"
                                        onClick={() => removeMedia(idx, mIdx)}
                                        className="absolute top-0 right-0 bg-destructive text-white w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover/media:opacity-100"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            <label className="w-16 h-16 border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent hover:text-accent transition-colors">
                                <span className="text-2xl">+</span>
                                <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => handleMediaUpload(e, idx)} />
                            </label>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            {section.media.length > 1 ? "Carousel Mode Active" : section.media.length === 1 ? "Single Media Display" : "Text Only"}
                        </div>
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={addSection}
                className="w-full py-2 border border-dashed border-border text-xs text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            >
                + ADD SECTION
            </button>
        </div>
    )
}


// 2.5 Gallery Editor
function GalleryEditor() {
    const [items, setItems] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
    const [isNew, setIsNew] = useState(false)
    const [showSaveNotif, setShowSaveNotif] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null)
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
    const galleryImageWidgetRef = useRef<any>(null)
    const galleryVideoWidgetRef = useRef<any>(null)
    const mediaInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => { fetchGallery(); initializeGalleryCloudinaryWidgets() }, [])

    function initializeGalleryCloudinaryWidgets() {
        const win = window as any
        if (!win.cloudinary) return

        galleryImageWidgetRef.current = win.cloudinary.createUploadWidget({
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            resourceType: 'image',
            maxFileSize: 52428800, // 50MB
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFiles: 1,
            formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
        }, (error: any, result: any) => {
            if (error) {
                console.error('Cloudinary image upload error:', error)
                setUploadError(`Upload failed: ${error.message}`)
                setUploading(false)
            }
            if (result?.event === 'success') {
                setEditingItem(prev => prev ? { ...prev, mediaUrl: result.info.secure_url, mediaType: 'image' } : null)
                setUploadSuccess('IMAGE')
                setSelectedMediaFile(null)
                if (mediaInputRef.current) mediaInputRef.current.value = ''
                setUploadError(null)
                setUploading(false)
                setTimeout(() => setUploadSuccess(null), 3000)
            }
        })

        galleryVideoWidgetRef.current = win.cloudinary.createUploadWidget({
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            resourceType: 'video',
            maxFileSize: 1073741824, // 1GB
            sources: ['local', 'url'],
            multiple: false,
            maxFiles: 1,
            formats: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv']
        }, (error: any, result: any) => {
            if (error) {
                console.error('Cloudinary video upload error:', error)
                setUploadError(`Upload failed: ${error.message}`)
                setUploading(false)
            }
            if (result?.event === 'success') {
                setEditingItem(prev => prev ? { ...prev, mediaUrl: result.info.secure_url, mediaType: 'video' } : null)
                setUploadSuccess('VIDEO')
                setSelectedMediaFile(null)
                if (mediaInputRef.current) mediaInputRef.current.value = ''
                setUploadError(null)
                setUploading(false)
                setTimeout(() => setUploadSuccess(null), 3000)
            }
        })
    }

    function openGalleryImageUpload() {
        setUploading(true)
        setUploadError(null)
        galleryImageWidgetRef.current?.open()
    }

    function openGalleryVideoUpload() {
        setUploading(true)
        setUploadError(null)
        galleryVideoWidgetRef.current?.open()
    }

    async function fetchGallery() {
        try {
            const res = await fetch('/api/gallery')
            const data = await res.json()
            setItems(data)
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!editingItem) return
        const method = isNew ? 'POST' : 'PUT'
        await fetch('/api/gallery', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingItem)
        })
        setShowSaveNotif(true)
        setTimeout(() => setShowSaveNotif(false), 3000)
        setEditingItem(null)
        fetchGallery()
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this artifact?")) return
        await fetch('/api/gallery', { method: 'DELETE', body: JSON.stringify({ id }) })
        fetchGallery()
    }

    if (loading) return <div>Loading Gallery...</div>

    if (editingItem) {
        return (
            <div className="space-y-4">
                {uploadSuccess && (
                    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 border border-accent/30">
                        <div className="bg-background border-2 border-accent p-6 max-w-md">
                            <div className="text-center">
                                <div className="text-4xl text-accent mb-4">★</div>
                                <h2 className="text-accent text-lg font-bold tracking-widest mb-2">{uploadSuccess} UPLOADED</h2>
                                <p className="text-xs text-muted-foreground mb-4">Successfully uploaded to cloud storage</p>
                                <button
                                    type="button"
                                    onClick={() => setUploadSuccess(null)}
                                    className="text-xs px-6 py-2 bg-accent/20 hover:bg-accent/30 border border-accent/30 text-accent tracking-wider font-bold"
                                >
                                    CONTINUE
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <h3 className="text-accent text-lg font-bold">{isNew ? "NEW ARTIFACT" : "EDIT ARTIFACT"}</h3>
                    <button onClick={() => setEditingItem(null)} className="text-xs hover:text-accent">[CANCEL]</button>
                </div>
                <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground">TITLE</label>
                            <input className="bg-background/50 border border-border p-2 text-sm" value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground">ID</label>
                            <input className="bg-background/50 border border-border p-2 text-sm" value={editingItem.id} onChange={e => setEditingItem({ ...editingItem, id: e.target.value })} required disabled={!isNew} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground">CATEGORY</label>
                            <select
                                className="bg-background/50 border border-border p-2 text-sm text-foreground"
                                value={editingItem.category}
                                onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                            >
                                {["STORYBOARDS", "ANIMATION", "CHARACTER DESIGN", "MISC"].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-muted-foreground">YEAR</label>
                            <input className="bg-background/50 border border-border p-2 text-sm" value={editingItem.year} onChange={e => setEditingItem({ ...editingItem, year: e.target.value })} required />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-muted-foreground">DESCRIPTION</label>
                        <textarea className="bg-background/50 border border-border p-2 text-sm h-20" value={editingItem.desc} onChange={e => setEditingItem({ ...editingItem, desc: e.target.value })} required />
                    </div>

                    <div className="flex flex-col gap-1 border border-border p-4 bg-background/20">
                        <label className="text-[10px] text-muted-foreground mb-2">MEDIA FILE (IMAGE OR VIDEO)</label>
                        <div className="flex gap-4 items-center mb-2">
                            <input className="bg-background/50 border border-border p-2 text-sm flex-1" placeholder="Or paste media URL directly" value={editingItem.mediaUrl} onChange={e => setEditingItem({ ...editingItem, mediaUrl: e.target.value })} />
                            <select className="bg-background/50 border border-border p-2 text-sm" value={editingItem.mediaType} onChange={e => setEditingItem({ ...editingItem, mediaType: e.target.value as "image" | "video" })}>
                                <option value="image">IMAGE</option>
                                <option value="video">VIDEO</option>
                            </select>
                        </div>
                        {editingItem.mediaUrl && (
                            <div className="mb-3">
                                {editingItem.mediaType === 'video' ?
                                    <video key={editingItem.mediaUrl} src={editingItem.mediaUrl} crossOrigin="anonymous" preload="metadata" className="h-20 w-32 object-cover border border-accent/30" muted onError={() => console.error('Video preview failed:', editingItem.mediaUrl)} /> :
                                    <img key={editingItem.mediaUrl} src={editingItem.mediaUrl} crossOrigin="anonymous" className="h-20 w-32 object-cover border border-accent/30" onError={() => console.error('Image preview failed:', editingItem.mediaUrl)} />
                                }
                                <div className="text-[9px] text-accent mt-2">✓ Media ready</div>
                            </div>
                        )}
                        <div className="flex flex-col gap-3">
                            <div className="border border-border/50 p-3 bg-background/10">
                                <label className="text-[9px] text-muted-foreground mb-2 block">SELECT IMAGE OR VIDEO FILE</label>
                                <input 
                                    ref={mediaInputRef}
                                    type="file" 
                                    accept="image/*,video/*" 
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        setSelectedMediaFile(file || null)
                                        setUploadError(null)
                                    }}
                                    className="text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:bg-accent/10 file:text-accent hover:file:bg-accent/20 cursor-pointer w-full"
                                />
                                {selectedMediaFile && (
                                    <div className="text-[9px] text-accent mt-2">
                                        ✓ Selected: {selectedMediaFile.name} ({(selectedMediaFile.size / (1024 * 1024)).toFixed(2)}MB)
                                        <br/>Type: {selectedMediaFile.type.startsWith('video') ? 'VIDEO' : 'IMAGE'}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={openGalleryImageUpload}
                                    disabled={!selectedMediaFile || uploading}
                                    className="text-xs px-4 py-2 bg-accent/20 hover:bg-accent/30 disabled:opacity-50 border border-accent/30 text-accent tracking-wider disabled:cursor-not-allowed flex-1 font-bold"
                                >
                                    {uploading ? 'UPLOADING...' : 'UPLOAD IMAGE'}
                                </button>
                                <button
                                    type="button"
                                    onClick={openGalleryVideoUpload}
                                    disabled={!selectedMediaFile || uploading}
                                    className="text-xs px-4 py-2 bg-accent/20 hover:bg-accent/30 disabled:opacity-50 border border-accent/30 text-accent tracking-wider disabled:cursor-not-allowed flex-1 font-bold"
                                >
                                    {uploading ? 'UPLOADING...' : 'UPLOAD VIDEO'}
                                </button>
                            </div>
                        </div>
                        <div className="text-[9px] text-muted-foreground/60 mt-2">Direct upload to cloud • Images: 50MB | Videos: 1GB</div>
                        {uploading && (
                            <div className="text-xs text-accent animate-pulse mt-2">► UPLOADING MEDIA...</div>
                        )}
                        {uploadError && (
                            <div className="text-xs text-red-500 p-2 bg-red-500/10 border border-red-500/30 font-mono mt-2">{uploadError}</div>
                        )}
                        {successMessage && (
                            <div className="text-xs text-green-500 p-2 bg-green-500/10 border border-green-500/30 font-mono mt-2">{successMessage}</div>
                        )}
                    </div>

                    <button type="submit" className="bg-accent text-background font-bold py-2 hover:bg-accent/80 transition-colors">SAVE ARTIFACT</button>
                </form>
            </div>
        )
    }

    return (
        <>
            <SaveNotification show={showSaveNotif} message="Gallery item saved successfully" />
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-background/30 p-2 border border-border">
                    <h3 className="text-sm font-bold tracking-widest pl-2">GALLERY ARTIFACTS</h3>
                    <button
                        onClick={() => { setIsNew(true); setEditingItem({ id: "", title: "", category: "STORYBOARDS", year: new Date().getFullYear().toString(), desc: "", mediaUrl: "", mediaType: "image" }); }}
                        className="bg-accent/10 hover:bg-accent/20 text-accent text-xs px-3 py-1 border border-accent/20"
                    >
                        + NEW ARTIFACT
                    </button>
                </div>
                <div className="grid gap-2">
                    {items.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-background/20 border border-border hover:border-accent/30 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-foreground/5 border border-border overflow-hidden">
                                    {p.mediaUrl ? (
                                        p.mediaType === 'video' ? 
                                            <video key={p.mediaUrl} src={p.mediaUrl} crossOrigin="anonymous" preload="metadata" className="w-full h-full object-cover" muted /> : 
                                            <img key={p.mediaUrl} src={p.mediaUrl} crossOrigin="anonymous" className="w-full h-full object-cover" alt={p.title} />
                                    ) : null}
                                </div>
                                <div>
                                    <div className="text-sm font-bold">{p.title}</div>
                                    <div className="text-[10px] text-muted-foreground">{p.category} // {p.mediaType.toUpperCase()}</div>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setIsNew(false); setEditingItem(p); }} className="text-xs hover:text-accent px-2">EDIT</button>
                                <button onClick={() => handleDelete(p.id)} className="text-xs hover:text-destructive px-2">DEL</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

// 3. Home/Operator Details Editor
function HomeContentEditor({ data, onUpdate }: { data: any, onUpdate: () => void }) {
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        tags: [] as string[],
        stats: [] as { label: string; value: string }[]
    })
    const [showSaveNotif, setShowSaveNotif] = useState(false)
    const [tagsInput, setTagsInput] = useState("")
    const [statsInput, setStatsInput] = useState({ label: "", value: "" })

    useEffect(() => {
        if (data) {
            setFormData({
                title: data.title || "",
                subtitle: data.subtitle || "",
                description: data.description || "",
                tags: data.tags || [],
                stats: data.stats || []
            })
            setTagsInput(data.tags?.join(", ") || "")
        }
    }, [data])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        try {
            const updatedData = {
                ...data,
                title: formData.title,
                subtitle: formData.subtitle,
                description: formData.description,
                tags: formData.tags,
                stats: formData.stats
            }
            
            await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section: "home", data: updatedData })
            })
            setShowSaveNotif(true)
            setTimeout(() => setShowSaveNotif(false), 3000)
            onUpdate()
        } catch (e) {
            console.error(e)
            alert("Failed to save")
        }
    }

    function handleAddTag() {
        const tag = tagsInput.trim().toUpperCase()
        if (tag && !formData.tags.includes(tag)) {
            const newTags = [...formData.tags, tag]
            setFormData({ ...formData, tags: newTags })
            setTagsInput("")
        }
    }

    function handleRemoveTag(tag: string) {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
    }

    function handleAddStat() {
        if (statsInput.label && statsInput.value) {
            const newStats = [...formData.stats, statsInput]
            setFormData({ ...formData, stats: newStats })
            setStatsInput({ label: "", value: "" })
        }
    }

    function handleRemoveStat(index: number) {
        setFormData({ 
            ...formData, 
            stats: formData.stats.filter((_, i) => i !== index) 
        })
    }

    return (
        <>
            <SaveNotification show={showSaveNotif} message="Operator details saved successfully" />
            <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                    {/* Operator Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-muted-foreground tracking-widest font-bold">OPERATOR NAME</label>
                        <input
                            type="text"
                            className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Captain Ripley"
                            required
                        />
                    </div>

                    {/* Subtitle */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-muted-foreground tracking-widest font-bold">SUBTITLE / DESIGNATION</label>
                        <input
                            type="text"
                            className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                            value={formData.subtitle}
                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="e.g., GROUP: CREW // MODULE: CAPTAIN"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-muted-foreground tracking-widest font-bold">OPERATOR PROFILE</label>
                        <textarea
                            className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50 h-28"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Operator bio and professional summary..."
                            required
                        />
                    </div>
                </div>

                {/* Tags Section */}
                <div className="border border-border p-4 bg-background/20 space-y-3">
                    <h4 className="text-xs font-bold text-accent tracking-wider">SKILLS / TAGS</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="bg-background/50 border border-border p-2 text-xs text-foreground flex-1 placeholder-muted-foreground/50"
                            value={tagsInput}
                            onChange={e => setTagsInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Add skill tag..."
                        />
                        <button
                            type="button"
                            onClick={handleAddTag}
                            className="bg-accent/10 hover:bg-accent/20 text-accent text-xs px-3 py-2 border border-accent/20"
                        >
                            +
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                            <div key={tag} className="flex items-center gap-2 bg-accent/10 px-3 py-1 border border-accent/20 text-xs">
                                <span>{tag}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="text-accent/60 hover:text-accent font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="border border-border p-4 bg-background/20 space-y-3">
                    <h4 className="text-xs font-bold text-accent tracking-wider">SYSTEM STATUS STATS</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="bg-background/50 border border-border p-2 text-xs text-foreground placeholder-muted-foreground/50"
                            value={statsInput.label}
                            onChange={e => setStatsInput({ ...statsInput, label: e.target.value })}
                            placeholder="Label (e.g., CPU)"
                        />
                        <input
                            type="text"
                            className="bg-background/50 border border-border p-2 text-xs text-foreground flex-1 placeholder-muted-foreground/50"
                            value={statsInput.value}
                            onChange={e => setStatsInput({ ...statsInput, value: e.target.value })}
                            placeholder="Value (e.g., 98.7%)"
                        />
                        <button
                            type="button"
                            onClick={handleAddStat}
                            className="bg-accent/10 hover:bg-accent/20 text-accent text-xs px-3 py-2 border border-accent/20"
                        >
                            +
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.stats.map((stat, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-background/30 px-3 py-2 border border-border/50 text-xs">
                                <div>
                                    <span className="text-muted-foreground">{stat.label}:</span>
                                    <span className="text-foreground ml-2 font-mono">{stat.value}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveStat(idx)}
                                    className="text-accent/60 hover:text-accent font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-accent text-background font-bold py-3 hover:bg-accent/80 transition-colors tracking-wider">
                    SAVE OPERATOR DETAILS
                </button>
            </form>
        </>
    )
}

// 3B. About Section Editor
function AboutContentEditor({ data, onUpdate }: { data: any, onUpdate: () => void }) {
    const [formData, setFormData] = useState({
        operatorName: "",
        designation: "",
        bio: "",
        bioSecond: "",
        stats: {
            status: "",
            location: "",
            clearance: "",
            specialty: ""
        }
    })
    const [showSaveNotif, setShowSaveNotif] = useState(false)

    useEffect(() => {
        if (data) {
            setFormData({
                operatorName: data.operatorName || "",
                designation: data.designation || "",
                bio: data.bio || "",
                bioSecond: data.bioSecond || "",
                stats: data.stats || {
                    status: "",
                    location: "",
                    clearance: "",
                    specialty: ""
                }
            })
        }
    }, [data])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        try {
            const updatedData = {
                ...data,
                operatorName: formData.operatorName,
                designation: formData.designation,
                bio: formData.bio,
                bioSecond: formData.bioSecond,
                stats: formData.stats
            }
            
            await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section: "about", data: updatedData })
            })
            setShowSaveNotif(true)
            setTimeout(() => setShowSaveNotif(false), 3000)
            onUpdate()
        } catch (e) {
            console.error(e)
            alert("Failed to save")
        }
    }

    return (
        <>
            <SaveNotification show={showSaveNotif} message="About section saved successfully" />
            <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                    {/* Operator Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-muted-foreground tracking-widest font-bold">OPERATOR NAME</label>
                        <input
                            type="text"
                            className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                            value={formData.operatorName}
                            onChange={e => setFormData({ ...formData, operatorName: e.target.value })}
                            placeholder="e.g., CREATIVE OPERATOR"
                            required
                        />
                    </div>

                    {/* Designation */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-muted-foreground tracking-widest font-bold">DESIGNATION</label>
                        <input
                            type="text"
                            className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                            value={formData.designation}
                            onChange={e => setFormData({ ...formData, designation: e.target.value })}
                            placeholder="e.g., ARTIST-07"
                        />
                    </div>

                    {/* Primary Bio */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-muted-foreground tracking-widest font-bold">PRIMARY BIO</label>
                        <textarea
                            className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50 h-24"
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Your main biography..."
                        />
                    </div>

                    {/* Secondary Bio */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-muted-foreground tracking-widest font-bold">SECONDARY BIO</label>
                        <textarea
                            className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50 h-24"
                            value={formData.bioSecond}
                            onChange={e => setFormData({ ...formData, bioSecond: e.target.value })}
                            placeholder="Additional biography or focus areas..."
                        />
                    </div>
                </div>

                {/* Stats Section */}
                <div className="border border-border p-4 bg-background/20 space-y-4">
                    <h4 className="text-xs font-bold text-accent tracking-wider">OPERATOR STATS</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] text-muted-foreground tracking-widest">STATUS</label>
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-2 text-xs text-foreground"
                                value={formData.stats.status}
                                onChange={e => setFormData({
                                    ...formData,
                                    stats: { ...formData.stats, status: e.target.value }
                                })}
                                placeholder="e.g., ACTIVE"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] text-muted-foreground tracking-widest">LOCATION</label>
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-2 text-xs text-foreground"
                                value={formData.stats.location}
                                onChange={e => setFormData({
                                    ...formData,
                                    stats: { ...formData.stats, location: e.target.value }
                                })}
                                placeholder="e.g., GLOBAL // REMOTE"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] text-muted-foreground tracking-widest">CLEARANCE</label>
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-2 text-xs text-foreground"
                                value={formData.stats.clearance}
                                onChange={e => setFormData({
                                    ...formData,
                                    stats: { ...formData.stats, clearance: e.target.value }
                                })}
                                placeholder="e.g., LEVEL 5"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] text-muted-foreground tracking-widest">SPECIALTY</label>
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-2 text-xs text-foreground"
                                value={formData.stats.specialty}
                                onChange={e => setFormData({
                                    ...formData,
                                    stats: { ...formData.stats, specialty: e.target.value }
                                })}
                                placeholder="e.g., VISUAL ARTS"
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-accent text-background font-bold py-3 hover:bg-accent/80 transition-colors tracking-wider">
                    SAVE ABOUT DETAILS
                </button>
            </form>
        </>
    )
}

// 3C. Skills Section Editor
function SkillsContentEditor({ data, onUpdate }: { data: any, onUpdate: () => void }) {
    const [viewMode, setViewMode] = useState<"form" | "json">("form")
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        list: [] as Array<{ name: string; level: number; category: string }>,
        categories: [] as string[]
    })
    const [jsonContent, setJsonContent] = useState(() => {
        return data ? JSON.stringify(data, null, 2) : "{}"
    })
    const [skillInput, setSkillInput] = useState({ name: "", level: 50, category: "" })
    const [categoryInput, setCategoryInput] = useState("")
    const [showSaveNotif, setShowSaveNotif] = useState(false)

    useEffect(() => {
        if (data) {
            setFormData({
                title: data.title || "",
                subtitle: data.subtitle || "",
                list: data.list || [],
                categories: data.categories || []
            })
            setJsonContent(JSON.stringify(data, null, 2))
        }
    }, [data])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        try {
            let updatedData
            if (viewMode === "json") {
                updatedData = JSON.parse(jsonContent)
            } else {
                updatedData = {
                    ...data,
                    title: formData.title,
                    subtitle: formData.subtitle,
                    list: formData.list,
                    categories: formData.categories
                }
            }
            
            await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section: "skills", data: updatedData })
            })
            setShowSaveNotif(true)
            setTimeout(() => setShowSaveNotif(false), 3000)
            onUpdate()
        } catch (e) {
            console.error(e)
            alert("Failed to save. Please check your JSON format if using JSON mode.")
        }
    }

    function handleAddSkill() {
        if (skillInput.name && skillInput.category) {
            const newSkill = {
                name: skillInput.name.toUpperCase(),
                level: skillInput.level,
                category: skillInput.category
            }
            setFormData({
                ...formData,
                list: [...formData.list, newSkill]
            })
            setSkillInput({ name: "", level: 50, category: "" })
        }
    }

    function handleRemoveSkill(index: number) {
        setFormData({
            ...formData,
            list: formData.list.filter((_, i) => i !== index)
        })
    }

    function handleAddCategory() {
        const cat = categoryInput.toUpperCase()
        if (cat && !formData.categories.includes(cat)) {
            setFormData({
                ...formData,
                categories: [...formData.categories, cat]
            })
            setCategoryInput("")
        }
    }

    function handleRemoveCategory(category: string) {
        setFormData({
            ...formData,
            categories: formData.categories.filter(c => c !== category)
        })
    }

    return (
        <>
            <SaveNotification show={showSaveNotif} message="Skills section saved successfully" />
            <div className="space-y-4 mb-4 flex gap-2">
                <button
                    type="button"
                    onClick={() => setViewMode("form")}
                    className={`text-xs px-4 py-2 font-bold tracking-wider ${
                        viewMode === "form"
                            ? "bg-accent text-background"
                            : "bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20"
                    }`}
                >
                    FORM EDITOR
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode("json")}
                    className={`text-xs px-4 py-2 font-bold tracking-wider ${
                        viewMode === "json"
                            ? "bg-accent text-background"
                            : "bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20"
                    }`}
                >
                    JSON TEMPLATE
                </button>
            </div>

            {viewMode === "form" ? (
                <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                    {/* Title */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-muted-foreground tracking-widest font-bold">SECTION TITLE</label>
                        <input
                            type="text"
                            className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., SKILL MATRIX"
                            required
                        />
                    </div>

                    {/* Subtitle */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-muted-foreground tracking-widest font-bold">SUBTITLE</label>
                        <input
                            type="text"
                            className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                            value={formData.subtitle}
                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="e.g., // CAPABILITY ASSESSMENT"
                        />
                    </div>
                </div>

                {/* Categories Section */}
                <div className="border border-border p-4 bg-background/20 space-y-3">
                    <h4 className="text-xs font-bold text-accent tracking-wider">SKILL CATEGORIES</h4>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="bg-background/50 border border-border p-2 text-xs text-foreground flex-1 placeholder-muted-foreground/50"
                            value={categoryInput}
                            onChange={e => setCategoryInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                            placeholder="Add category (e.g., DESIGN)..."
                        />
                        <button
                            type="button"
                            onClick={handleAddCategory}
                            className="bg-accent/10 hover:bg-accent/20 text-accent text-xs px-3 py-2 border border-accent/20"
                        >
                            +
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.categories.map(cat => (
                            <div key={cat} className="flex items-center gap-2 bg-accent/10 px-3 py-1 border border-accent/20 text-xs">
                                <span>{cat}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCategory(cat)}
                                    className="text-accent/60 hover:text-accent font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills List Section */}
                <div className="border border-border p-4 bg-background/20 space-y-4">
                    <h4 className="text-xs font-bold text-accent tracking-wider">SKILLS LIST</h4>
                    
                    <div className="grid grid-cols-3 gap-3 bg-background/30 p-3 border border-border/50">
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] text-muted-foreground tracking-widest">SKILL NAME</label>
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-2 text-xs text-foreground"
                                value={skillInput.name}
                                onChange={e => setSkillInput({ ...skillInput, name: e.target.value })}
                                placeholder="e.g., PHOTOSHOP"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] text-muted-foreground tracking-widest">PROFICIENCY (0-100)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                className="bg-background/50 border border-border p-2 text-xs text-foreground"
                                value={skillInput.level}
                                onChange={e => setSkillInput({ ...skillInput, level: parseInt(e.target.value) })}
                                placeholder="0-100"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[9px] text-muted-foreground tracking-widest">CATEGORY</label>
                            <select
                                className="bg-background/50 border border-border p-2 text-xs text-foreground"
                                value={skillInput.category}
                                onChange={e => setSkillInput({ ...skillInput, category: e.target.value })}
                            >
                                <option value="">Select...</option>
                                {formData.categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={!skillInput.name || !skillInput.category}
                        className="bg-accent/10 hover:bg-accent/20 disabled:opacity-50 text-accent text-xs px-4 py-2 border border-accent/20 w-full"
                    >
                        + ADD SKILL
                    </button>

                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {formData.list.map((skill, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-background/30 px-3 py-2 border border-border/50 text-xs">
                                <div className="flex-1">
                                    <span className="text-foreground font-bold">{skill.name}</span>
                                    <span className="text-muted-foreground ml-3">{skill.category}</span>
                                    <span className="text-accent ml-3 tabular-nums">{skill.level}%</span>
                                    <div className="w-full bg-background/50 h-2 mt-1 border border-border/50">
                                        <div
                                            className="h-full bg-accent/30"
                                            style={{ width: `${skill.level}%` }}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(idx)}
                                    className="text-accent/60 hover:text-accent font-bold ml-3"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-accent text-background font-bold py-3 hover:bg-accent/80 transition-colors tracking-wider">
                    SAVE SKILLS DETAILS
                </button>
                </form>
            ) : (
                <div className="space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-center">
                        <h3 className="text-accent text-lg font-bold">RAW JSON TEMPLATE</h3>
                        <button 
                            onClick={handleSave}
                            className="bg-accent text-background px-4 py-1 text-xs font-bold hover:bg-accent/80"
                        >
                            SAVE JSON
                        </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        Edit the raw JSON structure. Be careful with formatting.
                    </p>
                    <textarea
                        className="flex-1 w-full bg-background/20 border border-border p-4 font-mono text-xs text-foreground/80 outline-none focus:border-accent/50 resize-none"
                        value={jsonContent}
                        onChange={e => setJsonContent(e.target.value)}
                        spellCheck={false}
                    />
                </div>
            )}
        </>
    )
}

// 4. Contact Content Editor
function ContactContentEditor({ data, onUpdate }: { data: any, onUpdate: () => void }) {
    const [viewMode, setViewMode] = useState<"form" | "json">("form")
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        email: "",
        social: "",
        location: "",
        availability: "",
        availabilityDesc: "",
        encryption: [] as string[]
    })
    const [jsonContent, setJsonContent] = useState(() => {
        return data ? JSON.stringify(data, null, 2) : "{}"
    })
    const [encryptionInput, setEncryptionInput] = useState("")
    const [showSaveNotif, setShowSaveNotif] = useState(false)

    useEffect(() => {
        if (data) {
            setFormData({
                title: data.title || "",
                subtitle: data.subtitle || "",
                email: data.email || "",
                social: data.social || "",
                location: data.location || "",
                availability: data.availability || "",
                availabilityDesc: data.availabilityDesc || "",
                encryption: data.encryption || []
            })
            setJsonContent(JSON.stringify(data, null, 2))
        }
    }, [data])

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        try {
            let updatedData
            if (viewMode === "json") {
                updatedData = JSON.parse(jsonContent)
            } else {
                updatedData = {
                    ...data,
                    title: formData.title,
                    subtitle: formData.subtitle,
                    email: formData.email,
                    social: formData.social,
                    location: formData.location,
                    availability: formData.availability,
                    availabilityDesc: formData.availabilityDesc,
                    encryption: formData.encryption
                }
            }
            
            await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section: "contact", data: updatedData })
            })
            setShowSaveNotif(true)
            setTimeout(() => setShowSaveNotif(false), 3000)
            onUpdate()
        } catch (e) {
            console.error(e)
            alert("Failed to save. Please check your input.")
        }
    }

    function handleAddEncryption() {
        const enc = encryptionInput.trim()
        if (enc && !formData.encryption.includes(enc)) {
            setFormData({
                ...formData,
                encryption: [...formData.encryption, enc]
            })
            setEncryptionInput("")
        }
    }

    function handleRemoveEncryption(index: number) {
        setFormData({
            ...formData,
            encryption: formData.encryption.filter((_, i) => i !== index)
        })
    }

    return (
        <>
            <SaveNotification show={showSaveNotif} message="Contact section saved successfully" />
            <div className="space-y-4 mb-4 flex gap-2">
                <button
                    type="button"
                    onClick={() => setViewMode("form")}
                    className={`text-xs px-4 py-2 font-bold tracking-wider ${
                        viewMode === "form"
                            ? "bg-accent text-background"
                            : "bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20"
                    }`}
                >
                    FORM EDITOR
                </button>
                <button
                    type="button"
                    onClick={() => setViewMode("json")}
                    className={`text-xs px-4 py-2 font-bold tracking-wider ${
                        viewMode === "json"
                            ? "bg-accent text-background"
                            : "bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20"
                    }`}
                >
                    JSON TEMPLATE
                </button>
            </div>

            {viewMode === "form" ? (
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-muted-foreground tracking-widest font-bold">SECTION TITLE</label>
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., TRANSMIT MESSAGE"
                                required
                            />
                        </div>

                        {/* Subtitle */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-muted-foreground tracking-widest font-bold">SUBTITLE</label>
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                                value={formData.subtitle}
                                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="e.g., // COMMUNICATION CHANNEL"
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-muted-foreground tracking-widest font-bold">EMAIL ADDRESS</label>
                            <input
                                type="email"
                                className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="e.g., hello@example.com"
                                required
                            />
                        </div>

                        {/* Social */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-muted-foreground tracking-widest font-bold">SOCIAL HANDLE</label>
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                                value={formData.social}
                                onChange={e => setFormData({ ...formData, social: e.target.value })}
                                placeholder="e.g., @yourhandle"
                            />
                        </div>

                        {/* Location */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-muted-foreground tracking-widest font-bold">LOCATION</label>
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., GLOBAL // REMOTE"
                            />
                        </div>

                        {/* Availability Status */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-muted-foreground tracking-widest font-bold">AVAILABILITY STATUS</label>
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50"
                                value={formData.availability}
                                onChange={e => setFormData({ ...formData, availability: e.target.value })}
                                placeholder="e.g., ACCEPTING COMMISSIONS"
                            />
                        </div>

                        {/* Availability Description */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-muted-foreground tracking-widest font-bold">AVAILABILITY DESCRIPTION</label>
                            <textarea
                                className="bg-background/50 border border-border p-3 text-sm text-foreground placeholder-muted-foreground/50 h-24"
                                value={formData.availabilityDesc}
                                onChange={e => setFormData({ ...formData, availabilityDesc: e.target.value })}
                                placeholder="Describe your availability and response time..."
                            />
                        </div>
                    </div>

                    {/* Encryption/Security Section */}
                    <div className="border border-border p-4 bg-background/20 space-y-3">
                        <h4 className="text-xs font-bold text-accent tracking-wider">ENCRYPTION / SECURITY FEATURES</h4>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="bg-background/50 border border-border p-2 text-xs text-foreground flex-1 placeholder-muted-foreground/50"
                                value={encryptionInput}
                                onChange={e => setEncryptionInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEncryption())}
                                placeholder="Add security feature (e.g., AES-256 ENABLED)..."
                            />
                            <button
                                type="button"
                                onClick={handleAddEncryption}
                                className="bg-accent/10 hover:bg-accent/20 text-accent text-xs px-3 py-2 border border-accent/20"
                            >
                                +
                            </button>
                        </div>
                        <div className="space-y-2">
                            {formData.encryption.map((enc, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-background/30 px-3 py-2 border border-border/50 text-xs">
                                    <span className="text-foreground">{enc}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveEncryption(idx)}
                                        className="text-accent/60 hover:text-accent font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-accent text-background font-bold py-3 hover:bg-accent/80 transition-colors tracking-wider">
                        SAVE CONTACT DETAILS
                    </button>
                </form>
            ) : (
                <div className="space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-center">
                        <h3 className="text-accent text-lg font-bold">RAW JSON TEMPLATE</h3>
                        <button 
                            onClick={handleSave}
                            className="bg-accent text-background px-4 py-1 text-xs font-bold hover:bg-accent/80"
                        >
                            SAVE JSON
                        </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                        Edit the raw JSON structure. Be careful with formatting.
                    </p>
                    <textarea
                        className="flex-1 w-full bg-background/20 border border-border p-4 font-mono text-xs text-foreground/80 outline-none focus:border-accent/50 resize-none"
                        value={jsonContent}
                        onChange={e => setJsonContent(e.target.value)}
                        spellCheck={false}
                    />
                </div>
            )}
        </>
    )
}

// 5. Content Editor (JSON)
function ContentEditor({ section, data, onUpdate }: { section: string, data: any, onUpdate: () => void }) {
    const [jsonContent, setJsonContent] = useState("")
    const [showSaveNotif, setShowSaveNotif] = useState(false)

    useEffect(() => {
        setJsonContent(JSON.stringify(data, null, 2))
    }, [data])

    async function handleSave() {
        try {
            const parsed = JSON.parse(jsonContent)
            await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section, data: parsed })
            })
            setShowSaveNotif(true)
            setTimeout(() => setShowSaveNotif(false), 3000)
            onUpdate()
        } catch (e) {
            alert("Invalid JSON")
        }
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-accent text-lg font-bold">EDIT: {section.toUpperCase()}</h3>
                <button onClick={handleSave} className="bg-accent text-background px-4 py-1 text-xs font-bold hover:bg-accent/80">
                    SAVE JSON
                </button>
            </div>
            <p className="text-[10px] text-muted-foreground">
                Edit the raw JSON content for this section. Be careful with structure.
            </p>
            <textarea
                className="flex-1 w-full bg-background/20 border border-border p-4 font-mono text-xs text-foreground/80 outline-none focus:border-accent/50 resize-none"
                value={jsonContent}
                onChange={e => setJsonContent(e.target.value)}
                spellCheck={false}
            />
        </div>
    )
}

// 4. Custom Page Editor
function CustomPageManager({ pages, onUpdate }: { pages: CustomPage[], onUpdate: () => void }) {
    const [editingPage, setEditingPage] = useState<CustomPage | null>(null)
    const [isNew, setIsNew] = useState(false)

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!editingPage) return

        await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'customPage', data: editingPage })
        })
        setEditingPage(null)
        onUpdate()
    }

    return (
        <div className="space-y-6">
            {!editingPage ? (
                <>
                    <div className="flex justify-between items-center bg-background/30 p-2 border border-border">
                        <h3 className="text-sm font-bold tracking-widest pl-2">CUSTOM PAGES</h3>
                        <button
                            onClick={() => { setIsNew(true); setEditingPage({ id: "", title: "", content: "New page content..." }); }}
                            className="bg-accent/10 hover:bg-accent/20 text-accent text-xs px-3 py-1 border border-accent/20"
                        >
                            + NEW PAGE
                        </button>
                    </div>
                    <div className="grid gap-2">
                        {pages.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-background/20 border border-border hover:border-accent/30 transition-colors group">
                                <div>
                                    <div className="font-bold text-sm">{p.title}</div>
                                    <div className="text-[10px] text-muted-foreground">ID: {p.id}</div>
                                </div>
                                <button
                                    onClick={() => { setIsNew(false); setEditingPage(p); }}
                                    className="text-xs hover:text-accent px-3 py-1 group-hover:bg-foreground/5"
                                >
                                    EDIT
                                </button>
                            </div>
                        ))}
                        {pages.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground text-sm border border-dashed border-border">
                                No custom pages created yet.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-accent text-lg font-bold">{isNew ? "NEW PAGE" : "EDIT PAGE"}</h3>
                        <button onClick={() => setEditingPage(null)} className="text-xs hover:text-accent">[CANCEL]</button>
                    </div>
                    <form onSubmit={handleSave} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-muted-foreground">TITLE</label>
                                <input
                                    className="bg-background/50 border border-border p-2 text-sm text-foreground"
                                    value={editingPage.title}
                                    onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-muted-foreground">ID (URL SLUG)</label>
                                <input
                                    className="bg-background/50 border border-border p-2 text-sm text-foreground"
                                    value={editingPage.id}
                                    onChange={e => setEditingPage({ ...editingPage, id: e.target.value })}
                                    required
                                    disabled={!isNew} // ID immutable after creation for simplicity
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[10px] text-muted-foreground">CONTENT</label>
                            <textarea
                                className="bg-background/50 border border-border p-4 text-sm text-foreground font-mono h-64 resize-y"
                                value={editingPage.content}
                                onChange={e => setEditingPage({ ...editingPage, content: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-accent text-background font-bold py-2 hover:bg-accent/80 transition-colors">
                            SAVE PAGE
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}


export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("home")
    const [content, setContent] = useState<ContentData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchContent()
    }, [])

    async function fetchContent() {
        try {
            const res = await fetch('/api/content')
            const data = await res.json()
            setContent(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-background text-accent animate-pulse">
            INITIALIZING ADMIN SUBROUTINE...
        </div>
    )

    return (
        <div className="min-h-screen bg-background text-foreground font-mono flex flex-col md:flex-row">

            {/* Sidebar */}
            <aside className="w-full md:w-64 border-r border-border bg-background flex flex-col">
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-2 text-accent">
                        <HexagonNode size={20} />
                        <h1 className="font-bold tracking-widest text-lg">ADMIN.EXE</h1>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                        SYSTEM LEVEL: ROOT
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-2">
                    <div className="px-4 py-2 text-[10px] text-muted-foreground tracking-widest">CONTENT MODULES</div>
                    <SidebarItem label="HOME" isActive={activeTab === "home"} onClick={() => setActiveTab("home")} />
                    <SidebarItem label="ABOUT" isActive={activeTab === "about"} onClick={() => setActiveTab("about")} />
                    <SidebarItem label="SKILLS" isActive={activeTab === "skills"} onClick={() => setActiveTab("skills")} />
                    <SidebarItem label="CONTACT" isActive={activeTab === "contact"} onClick={() => setActiveTab("contact")} />

                    <div className="mt-4 px-4 py-2 text-[10px] text-muted-foreground tracking-widest">DATABASE</div>
                    <SidebarItem label="PROJECTS" isActive={activeTab === "projects"} onClick={() => setActiveTab("projects")} />
                    <SidebarItem label="GALLERY" isActive={activeTab === "gallery"} onClick={() => setActiveTab("gallery")} />

                    <div className="mt-4 px-4 py-2 text-[10px] text-muted-foreground tracking-widest">SYSTEM</div>
                    <SidebarItem label="CUSTOM PAGES" isActive={activeTab === "custom-pages"} onClick={() => setActiveTab("custom-pages")} />

                    <div className="mt-8 border-t border-border pt-4 px-4">
                        <Link href="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors">
                            <TriangleWarning size={12} />
                            <span>EXIT TO TERMINAL</span>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto bg-background/50 h-screen">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                    <div className="mb-6 flex justify-between items-end border-b border-border pb-4">
                        <div>
                            <div className="text-[10px] text-accent tracking-widest mb-1">CURRENT MODULE</div>
                            <h2 className="text-2xl font-bold text-glow-bright">{activeTab.toUpperCase().replace("-", " ")}</h2>
                        </div>
                        <ScanlineBar className="w-32 opacity-50" />
                    </div>

                    <div className="flex-1 relative">
                        <CornerBrackets className="text-foreground/10" />

                        {activeTab === "projects" ? (
                            <ProjectEditor />
                        ) : activeTab === "gallery" ? (
                            <GalleryEditor />
                        ) : activeTab === "custom-pages" ? (
                            <CustomPageManager pages={content?.customPages || []} onUpdate={fetchContent} />
                        ) : activeTab === "home" ? (
                            content && (
                                <HomeContentEditor
                                    data={content.home}
                                    onUpdate={fetchContent}
                                />
                            )
                        ) : activeTab === "about" ? (
                            content && (
                                <AboutContentEditor
                                    data={content.about}
                                    onUpdate={fetchContent}
                                />
                            )
                        ) : activeTab === "skills" ? (
                            content && (
                                <SkillsContentEditor
                                    data={content.skills}
                                    onUpdate={fetchContent}
                                />
                            )
                        ) : activeTab === "contact" ? (
                            content && (
                                <ContactContentEditor
                                    data={content.contact}
                                    onUpdate={fetchContent}
                                />
                            )
                        ) : (
                            content && (
                                <ContentEditor
                                    section={activeTab}
                                    data={content[activeTab as keyof ContentData]}
                                    onUpdate={fetchContent}
                                />
                            )
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
