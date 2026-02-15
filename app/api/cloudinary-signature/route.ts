import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const timestamp = Math.floor(Date.now() / 1000)
        
        const signature = crypto
            .createHash('sha256')
            .update(
                `timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`
            )
            .digest('hex')
        
        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload',
        })
    } catch (error) {
        console.error('Signature generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate signature', details: String(error) },
            { status: 500 }
        )
    }
}
