# Storage Setup Guide

Your portfolio now supports dual media storage: **Vercel Blob** (primary) + **Cloudinary** (fallback).

## Why Dual Storage?

- **Vercel Blob**: Fast, CDN-backed storage integrated with Vercel deployments. Best for new uploads.
- **Cloudinary**: Excellent image transformations and processing. Fallback for reliability.

New media uploads go to Vercel Blob. Existing Cloudinary links continue to work. If Vercel Blob is unavailable, uploads automatically fall back to Cloudinary.

---

## Setup Instructions

### 1. Vercel Blob Token (Recommended Primary Storage)

1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/settings/tokens)
2. Click "Create New Token"
3. Give it a name (e.g., "Blob Storage")
4. Select scope: **Blob** 
5. Copy the token and add to `.env.local`:

```env
BLOB_READ_WRITE_TOKEN=your_token_here
```

### 2. Cloudinary (Fallback Storage)

Keep your existing Cloudinary credentials for fallback:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

[Get Cloudinary credentials](https://cloudinary.com/console)

### 3. Test the Setup

Upload a new media file via your admin panel. Check the console logs:
- If using Vercel Blob: `"Vercel Blob upload success"`
- If using Cloudinary: `"Cloudinary upload success"`

---

## Storage Behavior

| Scenario | Behavior |
|----------|----------|
| Vercel token + Cloudinary keys | ✅ Try Blob first, fallback to Cloudinary |
| Only Vercel token | ✅ Use Blob only |
| Only Cloudinary keys | ✅ Use Cloudinary only |
| Neither | ❌ Uploads fail |

---

## URL Formats

- **Vercel Blob**: `https://******.public.blob.vercel-storage.com/filename`
- **Cloudinary**: `https://res.cloudinary.com/your-cloud/image/upload/...`

Both work seamlessly in your gallery. URLs are stored in MongoDB.

---

## Tips

- Vercel Blob is **faster** and recommended for new content
- Cloudinary URLs will **continue working** for existing media
- Costs: Vercel Blob charges per GB stored; Cloudinary has generous free tier
- No code changes needed when switching primary storage
