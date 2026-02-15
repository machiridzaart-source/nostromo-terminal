"use client"

import { CornerBrackets, ScanlineBar } from "../hud-elements"

interface CustomPageProps {
    data: {
        id: string
        title: string
        content: string
    }
}

export function CustomPage({ data }: CustomPageProps) {
    if (!data) return null

    return (
        <div className="flex flex-col gap-6 animate-boot-flicker">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent animate-pulse-glow" />
                <h1 className="text-lg text-foreground text-glow-bright font-bold tracking-widest">
                    {data.title.toUpperCase()}
                </h1>
                <span className="text-[10px] text-muted-foreground tracking-wider">// CUSTOM MODULE</span>
            </div>

            <div className="panel-border p-6 bg-background/30 relative min-h-[400px]">
                <CornerBrackets className="text-foreground/20" />

                {/* Render content as simple paragraphs for now, could be markdown later */}
                <div className="prose prose-invert max-w-none">
                    <div className="text-sm text-foreground/80 text-glow leading-relaxed whitespace-pre-wrap font-mono">
                        {data.content}
                    </div>
                </div>

                <ScanlineBar className="mt-8 opacity-50" />
                <div className="mt-2 flex justify-end">
                    <span className="text-[9px] text-muted-foreground tracking-widest">END OF FILE</span>
                </div>
            </div>
        </div>
    )
}
