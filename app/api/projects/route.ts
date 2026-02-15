import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data/projects.json')

export async function GET() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        const data = JSON.parse(fileContents)
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const newProject = await request.json()
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        const projects = JSON.parse(fileContents)

        // Add new project to the beginning
        projects.unshift(newProject)

        await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2))
        return NextResponse.json({ message: 'Project added', project: newProject })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const updatedProject = await request.json()
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        let projects = JSON.parse(fileContents)

        projects = projects.map((p: any) => p.id === updatedProject.id ? updatedProject : p)

        await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2))
        return NextResponse.json({ message: 'Project updated', project: updatedProject })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json()
        const fileContents = await fs.readFile(dataFilePath, 'utf8')
        let projects = JSON.parse(fileContents)

        projects = projects.filter((p: any) => p.id !== id)

        await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2))
        return NextResponse.json({ message: 'Project deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
    }
}
