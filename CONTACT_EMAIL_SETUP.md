# Contact Form Email Setup

Your contact form now sends real emails to **Jack.machiridza@gmail.com** using Resend.

## Setup

### 1. Get Resend API Key

1. Go to [Resend Dashboard](https://resend.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key and add to `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
```

### 2. Verify Sender Email (Production)

For production, you need to verify the sender domain:

1. In Resend Dashboard, go to **Domains**
2. Add your domain (e.g., `noreply@retro-art.dev`)
3. Follow DNS verification steps
4. Update the `from` email in `/api/contact/route.ts` if needed

**For testing:** The default `noreply@retro-art.dev` works with Resend's free tier.

### 3. Test It

1. Visit your contact page
2. Fill in the form and submit
3. Message will be sent to `Jack.machiridza@gmail.com`
4. The sender's email (from form) will be in `replyTo` field

## Email Features

- ✅ Styled retro terminal email format
- ✅ Includes sender name, email, subject, and message
- ✅ Reply-to automatically set to sender's email
- ✅ Error logging and validation
- ✅ Fallback error alerts for user

## How It Works

1. User fills contact form
2. Form submits to `/api/contact`
3. API validates data
4. Resend sends formatted email to Jack
5. User gets success/error feedback

## Troubleshooting

**Email not received:**
- Check Resend API key is valid
- Verify sender domain (if using custom domain)
- Check spam folder
- Check server logs for errors

**"Message did not send" error:**
- Make sure `RESEND_API_KEY` is in `.env.local`
- Verify all form fields are filled
- Check internet connection
