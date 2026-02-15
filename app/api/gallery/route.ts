import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data/gallery.json')

export async function GET() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        const data = JSON.parse(fileContents)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json([])
    }
}

export async function POST(request: Request) {
    try {
        const newItem = await request.json()
        let items = []
        try {
            const fileContents = await fs.readFile(dataFilePath, 'utf8')
            items = JSON.parse(fileContents)
        } catch (e) {
            // File missing, start empty
        }
        items.push(newItem)
        await fs.writeFile(dataFilePath, JSON.stringify(items, null, 2))
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const updatedItem = await request.json()
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        let items = JSON.parse(fileContents)
        const index = items.findIndex((p: any) => p.id === updatedItem.id)
        if (index !== -1) {
            items[index] = updatedItem
        } else {
            items.push(updatedItem)
        }
        await fs.writeFile(dataFilePath, JSON.stringify(items, null, 2))
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json()
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        let items = JSON.parse(fileContents)
        const index = items.findIndex((p: any) => p.id === id)
        if (index !== -1) {
            items.splice(index, 1)
        }
        await fs.writeFile(dataFilePath, JSON.stringify(items, null, 2))
        return NextResponse.json(items)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
    }
}
