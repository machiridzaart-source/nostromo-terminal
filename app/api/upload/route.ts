import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.name)
        const filename = file.name.replace(ext, '') + '-' + uniqueSuffix + ext
        const uploadDir = path.join(process.cwd(), 'public/uploads')
        const filepath = path.join(uploadDir, filename)

        await writeFile(filepath, buffer)

        // Return the public URL
        const publicUrl = `/uploads/${filename}`

        return NextResponse.json({ success: true, url: publicUrl })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 })
    }
}
