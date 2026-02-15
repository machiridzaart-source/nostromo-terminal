import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
    try {
        const db = await getDatabase()
        const projects = await db.collection('projects').find({}).toArray()
        return NextResponse.json(projects)
    } catch (error) {
        console.error('Projects GET error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch projects', details: String(error) },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const newProject = await request.json()
        const db = await getDatabase()

        // Add MongoDB ID if not present
        const projectToInsert = {
            ...newProject,
            _id: new ObjectId()
        }

        const result = await db.collection('projects').insertOne(projectToInsert)
        return NextResponse.json({ message: 'Project added', project: projectToInsert })
    } catch (error) {
        console.error('Projects POST error:', error)
        return NextResponse.json(
            { error: 'Failed to save project', details: String(error) },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        const updatedProject = await request.json()
        const db = await getDatabase()

        // Exclude _id from update to avoid MongoDB immutable field error
        const { _id, ...updateData } = updatedProject

        await db.collection('projects').updateOne(
            { id: updatedProject.id },
            { $set: updateData }
        )

        return NextResponse.json({ message: 'Project updated', project: updatedProject })
    } catch (error) {
        console.error('Projects PUT error:', error)
        return NextResponse.json(
            { error: 'Failed to update project', details: String(error) },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json()
        const db = await getDatabase()

        await db.collection('projects').deleteOne({ id })

        return NextResponse.json({ message: 'Project deleted' })
    } catch (error) {
        console.error('Projects DELETE error:', error)
        return NextResponse.json(
            { error: 'Failed to delete project', details: String(error) },
            { status: 500 }
        )
    }
}
