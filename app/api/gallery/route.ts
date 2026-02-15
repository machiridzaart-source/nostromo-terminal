import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
    try {
        const db = await getDatabase()
        const items = await db.collection('gallery').find({}).toArray()
        return NextResponse.json(items)
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json([])
    }
}

export async function POST(request: Request) {
    try {
        const newItem = await request.json()
        const db = await getDatabase()
        const result = await db.collection('gallery').insertOne(newItem)
        return NextResponse.json({ ...newItem, _id: result.insertedId })
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const updatedItem = await request.json()
        const db = await getDatabase()
        await db.collection('gallery').updateOne(
            { id: updatedItem.id },
            { $set: updatedItem }
        )
        return NextResponse.json(updatedItem)
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json()
        const db = await getDatabase()
        await db.collection('gallery').deleteOne({ id })
        return NextResponse.json({ message: 'Item deleted' })
    } catch (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
    }
}
