"use client"

import { useState, useEffect } from "react"
import { CornerBrackets, ScanlineBar, TargetReticle } from "../hud-elements"

interface ContactContent {
  title: string
  subtitle: string
  email: string
  social: string
  location: string
  availability: string
  availabilityDesc: string
  encryption: string[]
}

const DEFAULT_CONTENT: ContactContent = {
  title: "TRANSMIT MESSAGE",
  subtitle: "// COMMUNICATION CHANNEL",
  email: "hello@artoperator.dev",
  social: "@artoperator",
  location: "GLOBAL // REMOTE",
  availability: "ACCEPTING COMMISSIONS",
  availabilityDesc: "Currently open for freelance work, collaborations, and creative projects. Response time: within 48 hours.",
  encryption: ["AES-256 ENABLED", "TLS 1.3 ACTIVE"]
}

export function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [content, setContent] = useState<ContactContent>(DEFAULT_CONTENT)

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/content')
        if (response.ok) {
          const data = await response.json()
          if (data.contact) {
            setContent({ ...DEFAULT_CONTENT, ...data.contact })
          }
        }
      } catch (error) {
        console.error("Failed to fetch contact content", error)
      }
    }
    fetchContent()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    
    setSending(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSent(true)
      } else {
        const error = await response.json()
        console.error('Contact submission error:', error)
        alert('Message transmission failed. Please try again.')
      }
    } catch (error) {
      console.error('Contact submit error:', error)
      alert('Message transmission failed. Please check your connection.')
    } finally {
      setSending(false)
    }
  }

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
        {/* Contact form */}
        <div className="lg:w-2/3 panel-border p-4 bg-background/30 relative">
          <CornerBrackets className="text-foreground/20" />

          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <TargetReticle size={80} className="text-accent" />
              <div className="text-center">
                <div className="text-sm text-accent text-glow-bright tracking-widest font-bold mb-2">
                  TRANSMISSION SUCCESSFUL
                </div>
                <div className="text-[10px] text-muted-foreground tracking-wider">
                  MESSAGE DELIVERED TO OPERATOR // RESPONSE PENDING
                </div>
              </div>
              <button
                onClick={() => { setSent(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                className="text-[10px] text-foreground/50 hover:text-foreground tracking-widest panel-border px-3 py-1.5 hover:panel-border-bright transition-all"
              >
                {'[NEW TRANSMISSION]'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="text-[10px] text-muted-foreground tracking-widest mb-1">
                COMPOSE TRANSMISSION
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-[10px] text-muted-foreground tracking-widest">SENDER DESIGNATION:</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="bg-background/50 panel-border px-3 py-2 text-sm text-foreground text-glow font-mono outline-none focus:panel-border-bright transition-all"
                  placeholder="ENTER NAME..."
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-[10px] text-muted-foreground tracking-widest">COMM FREQUENCY (EMAIL):</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="bg-background/50 panel-border px-3 py-2 text-sm text-foreground text-glow font-mono outline-none focus:panel-border-bright transition-all"
                  placeholder="ENTER EMAIL..."
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="subject" className="text-[10px] text-muted-foreground tracking-widest">SUBJECT CODE:</label>
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                  className="bg-background/50 panel-border px-3 py-2 text-sm text-foreground text-glow font-mono outline-none focus:panel-border-bright transition-all"
                  placeholder="ENTER SUBJECT..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="message" className="text-[10px] text-muted-foreground tracking-widest">MESSAGE BODY:</label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  rows={5}
                  className="bg-background/50 panel-border px-3 py-2 text-sm text-foreground text-glow font-mono outline-none focus:panel-border-bright transition-all resize-none"
                  placeholder="COMPOSE MESSAGE..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="self-end text-xs tracking-widest px-6 py-2 panel-border-bright text-accent text-glow-bright hover:bg-accent/10 transition-all disabled:opacity-50"
              >
                {sending ? "TRANSMITTING..." : "[TRANSMIT]"}
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div className="lg:w-1/3 flex flex-col gap-3">
          <div className="panel-border p-4 bg-background/30 relative">
            <CornerBrackets className="text-foreground/10" />
            <div className="text-[10px] text-muted-foreground tracking-widest mb-3">
              DIRECT CHANNELS
            </div>
            <div className="space-y-3 text-[10px] tracking-wider">
              <div className="panel-border p-2">
                <div className="text-muted-foreground mb-1">EMAIL:</div>
                <div className="text-foreground text-glow">{content.email}</div>
              </div>
              <div className="panel-border p-2">
                <div className="text-muted-foreground mb-1">SOCIAL:</div>
                <div className="text-foreground text-glow">{content.social}</div>
              </div>
              <div className="panel-border p-2">
                <div className="text-muted-foreground mb-1">LOCATION:</div>
                <div className="text-foreground text-glow">{content.location}</div>
              </div>
            </div>
          </div>

          <div className="panel-border p-4 bg-background/30 relative">
            <CornerBrackets className="text-foreground/10" />
            <div className="text-[10px] text-muted-foreground tracking-widest mb-2">
              AVAILABILITY STATUS
            </div>
            <ScanlineBar />
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-accent animate-pulse-glow" />
              <span className="text-xs text-accent text-glow tracking-wider">{content.availability}</span>
            </div>
            <div className="mt-2 text-[9px] text-muted-foreground tracking-wider leading-relaxed">
              {content.availabilityDesc}
            </div>
          </div>

          <div className="panel-border p-4 bg-background/30">
            <div className="text-[10px] text-muted-foreground tracking-widest mb-2">
              ENCRYPTION STATUS
            </div>
            <div className="flex flex-col gap-1">
                {(content.encryption || []).map((enc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent" />
                  <span className="text-[9px] text-foreground/50 tracking-wider">{enc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
