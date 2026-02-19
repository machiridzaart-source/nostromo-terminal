import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure route for larger file uploads (max 300 seconds for processing)
export const maxDuration = 300

export async function POST(request: Request) {
    try {
        console.log('=== UPLOAD ENDPOINT REACHED ===')

        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            console.error('No file in request')
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
        }

        console.log('File received:', file.name, 'Size:', file.size)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Try Vercel Blob first
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
                console.log('Uploading to Vercel Blob...')
                const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`
                const blob = await put(filename, buffer, {
                    access: 'public',
                    contentType: file.type,
                })
                console.log('Vercel Blob upload success:', blob.url)
                return NextResponse.json({
                    success: true,
                    url: blob.url,
                    storage: 'vercel-blob',
                })
            } catch (blobError) {
                console.warn('Vercel Blob upload failed, falling back to Cloudinary:', blobError)
            }
        }

        // Fallback to Cloudinary
        console.log('Uploading to Cloudinary...')
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                    folder: 'nostromo-terminal',
                    public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error)
                        reject(error)
                    } else {
                        console.log('Cloudinary upload success:', result?.secure_url)
                        resolve(result)
                    }
                }
            )
            uploadStream.end(buffer)
        })

        console.log('Upload complete, returning URL')
        return NextResponse.json({
            success: true,
            url: (result as any).secure_url,
            storage: 'cloudinary',
        })
    } catch (error) {
        console.error('=== UPLOAD ERROR ===', error)
        return NextResponse.json(
            { success: false, message: 'Upload failed - both storage services unavailable', details: String(error) },
            { status: 500 }
        )
    }
}
