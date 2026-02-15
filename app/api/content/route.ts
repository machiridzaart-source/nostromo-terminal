import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data/content.json')

export async function GET() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        const data = JSON.parse(fileContents)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read content data' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        let content = JSON.parse(fileContents)

        // Update specific section or add custom page
        if (body.section) {
            content[body.section] = body.data
        } else if (body.type === "customPage") {
            // Handle adding/updating custom pages
            const existingIndex = content.customPages.findIndex((p: any) => p.id === body.data.id)
            if (existingIndex >= 0) {
                content.customPages[existingIndex] = body.data
            } else {
                content.customPages.push(body.data)
            }
        } else if (body.fullUpdate) {
            content = body.data
        }

        await fs.writeFile(dataFilePath, JSON.stringify(content, null, 2))
        return NextResponse.json({ message: 'Content updated', content })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
    }
}
