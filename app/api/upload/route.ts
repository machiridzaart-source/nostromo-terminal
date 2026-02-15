import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'nostromo-terminal',
                    public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )

            uploadStream.end(buffer)
        })

        return NextResponse.json({
            success: true,
            url: (result as any).secure_url,
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { success: false, message: 'Upload failed', details: String(error) },
            { status: 500 }
        )
    }
}
