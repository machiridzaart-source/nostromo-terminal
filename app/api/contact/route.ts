import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email to Jack
    const result = await resend.emails.send({
      from: 'noreply@retro-art.dev',
      to: 'Jack.machiridza@gmail.com',
      subject: `New Contact Message: ${body.subject || 'No Subject'}`,
      html: `
        <div style="font-family: monospace; background: #000; color: #00ff41; padding: 20px;">
          <div style="border: 1px solid #00ff41; padding: 15px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #00ff41; text-transform: uppercase;">TRANSMISSION RECEIVED</h2>
            
            <div style="margin: 15px 0;">
              <strong>SENDER:</strong> ${body.name}
            </div>
            
            <div style="margin: 15px 0;">
              <strong>COMM FREQUENCY:</strong> ${body.email}
            </div>
            
            ${body.subject ? `<div style="margin: 15px 0;"><strong>SUBJECT CODE:</strong> ${body.subject}</div>` : ''}
            
            <div style="margin: 15px 0; border-top: 1px solid #00ff41; padding-top: 15px;">
              <strong>MESSAGE BODY:</strong>
              <pre style="background: #003b00; padding: 10px; margin-top: 10px; white-space: pre-wrap; word-wrap: break-word;">${body.message}</pre>
            </div>
          </div>
        </div>
      `,
      replyTo: body.email,
    })

    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json(
        { error: 'Failed to send email', details: result.error },
        { status: 500 }
      )
    }

    console.log('Email sent successfully:', result.data?.id)

    return NextResponse.json({
      success: true,
      message: 'Message transmitted successfully',
      id: result.data?.id,
    })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message', details: String(error) },
      { status: 500 }
    )
  }
}
