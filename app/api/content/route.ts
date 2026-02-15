import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
    try {
        const db = await getDatabase()
        const content = await db.collection('content').findOne({ _id: 'main' })
        return NextResponse.json(content || {})
    } catch (error) {
        console.error('Content GET error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch content', details: String(error) },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const db = await getDatabase()

        // Get existing content
        let content = await db.collection('content').findOne({ _id: 'main' }) || {}

        // Update specific section or add custom page
        if (body.section) {
            content[body.section] = body.data
        } else if (body.type === "customPage") {
            // Handle adding/updating custom pages
            if (!content.customPages) content.customPages = []
            const existingIndex = content.customPages.findIndex((p: any) => p.id === body.data.id)
            if (existingIndex >= 0) {
                content.customPages[existingIndex] = body.data
            } else {
                content.customPages.push(body.data)
            }
        } else if (body.fullUpdate) {
            content = body.data
        }

        // Update in database
        await db.collection('content').updateOne(
            { _id: 'main' },
            { $set: content },
            { upsert: true }
        )

        return NextResponse.json({ message: 'Content updated', content })
    } catch (error) {
        console.error('Content POST error:', error)
        return NextResponse.json(
            { error: 'Failed to save content', details: String(error) },
            { status: 500 }
        )
    }
}
