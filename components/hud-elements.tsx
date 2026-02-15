"use client"

export function WireframeGlobe({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={`animate-spin-slow ${className}`}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="55" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <circle cx="60" cy="60" r="45" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <ellipse cx="60" cy="60" rx="55" ry="25" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <ellipse cx="60" cy="60" rx="55" ry="40" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <ellipse cx="60" cy="60" rx="25" ry="55" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <ellipse cx="60" cy="60" rx="40" ry="55" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="5" y1="60" x2="115" y2="60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="60" y1="5" x2="60" y2="115" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

export function StarburstIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  const rays = 12
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={`animate-spin-reverse ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: rays }).map((_, i) => {
        const angle = (i * 360) / rays
        const rad = (angle * Math.PI) / 180
        const x1 = 20 + Math.cos(rad) * 6
        const y1 = 20 + Math.sin(rad) * 6
        const x2 = 20 + Math.cos(rad) * 18
        const y2 = 20 + Math.sin(rad) * 18
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1"
            opacity={i % 2 === 0 ? 0.8 : 0.4}
          />
        )
      })}
      <circle cx="20" cy="20" r="4" stroke="currentColor" strokeWidth="0.8" fill="none" />
    </svg>
  )
}

export function DiamondHUD({ size = 50, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      className={`animate-pulse-glow ${className}`}
      aria-hidden="true"
    >
      <rect x="14" y="14" width="22" height="22" transform="rotate(45 25 25)" stroke="currentColor" strokeWidth="1" />
      <rect x="18" y="18" width="14" height="14" transform="rotate(45 25 25)" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <rect x="22" y="22" width="6" height="6" transform="rotate(45 25 25)" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
    </svg>
  )
}

export function TargetReticle({ size = 60, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="30" cy="30" r="25" stroke="currentColor" strokeWidth="0.6" strokeDasharray="4 4" className="animate-spin-slow" style={{ transformOrigin: '30px 30px' }} />
      <circle cx="30" cy="30" r="18" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
      <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.5" className="animate-pulse-glow" />
      <line x1="5" y1="30" x2="20" y2="30" stroke="currentColor" strokeWidth="0.6" />
      <line x1="40" y1="30" x2="55" y2="30" stroke="currentColor" strokeWidth="0.6" />
      <line x1="30" y1="5" x2="30" y2="20" stroke="currentColor" strokeWidth="0.6" />
      <line x1="30" y1="40" x2="30" y2="55" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  )
}

export function TriangleWarning({ size = 30, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      className={`animate-pulse-glow ${className}`}
      aria-hidden="true"
    >
      <path d="M15 4 L28 26 L2 26 Z" stroke="currentColor" strokeWidth="1" fill="none" />
      <path d="M15 8 L24 24 L6 24 Z" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
      <line x1="15" y1="14" x2="15" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="23" r="1" fill="currentColor" />
    </svg>
  )
}

export function HexagonNode({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={`animate-float-y ${className}`}
      aria-hidden="true"
    >
      <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" stroke="currentColor" strokeWidth="0.8" fill="none" />
      <polygon points="20,8 30,14 30,26 20,32 10,26 10,14" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
      <circle cx="20" cy="20" r="3" stroke="currentColor" strokeWidth="0.6" fill="none" className="animate-pulse-glow" />
    </svg>
  )
}

export function CornerBrackets({ className = "" }: { className?: string }) {
  return (
    <>
      {/* Top-left */}
      <svg className={`absolute top-0 left-0 ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M0 20 L0 0 L20 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      {/* Top-right */}
      <svg className={`absolute top-0 right-0 ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M0 0 L20 0 L20 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      {/* Bottom-left */}
      <svg className={`absolute bottom-0 left-0 ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M0 0 L0 20 L20 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      {/* Bottom-right */}
      <svg className={`absolute bottom-0 right-0 ${className}`} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M20 0 L20 20 L0 20" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </>
  )
}

export function DataStream({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-0.5 text-[8px] text-foreground/30 font-mono leading-none ${className}`} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse-glow whitespace-nowrap"
          style={{ animationDelay: `${i * 0.4}s` }}
        >
          {`0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`}
        </div>
      ))}
    </div>
  )
}

export function ScanlineBar({ className = "" }: { className?: string }) {
  return (
    <div className={`h-px w-full bg-foreground/20 relative overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-foreground/60 to-transparent"
        style={{
          animation: 'hud-scan 3s linear infinite',
          animationDirection: 'alternate',
        }}
      />
    </div>
  )
}
