# Google Drive Integration Setup Guide

This app now uses Google Drive for file uploads and data storage. Follow these steps to set it up:

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project**
3. Name it something like "Retro Art Portfolio"
4. Click **Create**

## Step 2: Enable Google Drive API

1. In the Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Drive API"
3. Click it and press **Enable**

## Step 3: Create a Service Account

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Fill in the service account name (e.g., "art-portfolio-service")
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

## Step 4: Generate Service Account Key

1. Click on the newly created service account
2. Go to the **Keys** tab
3. Click **Add Key > Create new key**
4. Choose **JSON** format
5. Click **Create**
6. A JSON file will download - **save this somewhere safe**

## Step 5: Create Google Drive Folders

1. Go to [Google Drive](https://drive.google.com/)
2. Create a folder named "art-portfolio" (or similar)
   - This is your **main data folder** - get its ID from the URL
3. Inside it, create a subfolder named "uploads"
   - This is your **uploads folder** - get its ID from the URL

**How to get folder IDs:**
- Open the folder in Google Drive
- The URL will look like: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
- Copy the FOLDER_ID from the URL

## Step 6: Share Folders with Service Account

1. Open your JSON file from Step 4
2. Find the `client_email` field (looks like: `name@project-id.iam.gserviceaccount.com`)
3. Copy it
4. In Google Drive, right-click each folder (data folder and uploads folder)
5. Click **Share**
6. Paste the service account email
7. Give it **Editor** permission
8. Uncheck "Notify people" and click **Share**

## Step 7: Set Up Environment Variables

1. In your project root, create a `.env.local` file
2. Open the JSON file from Step 4 and copy these values:

```env
# From the JSON service account file
GOOGLE_DRIVE_PROJECT_ID=your_project_id
GOOGLE_DRIVE_PRIVATE_KEY_ID=your_private_key_id
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40project-id.iam.gserviceaccount.com

# Folder IDs from Step 5
GOOGLE_DRIVE_DATA_FOLDER_ID=your_data_folder_id
GOOGLE_DRIVE_UPLOADS_FOLDER_ID=your_uploads_folder_id

# Optional: File IDs (auto-created after first save)
GOOGLE_DRIVE_GALLERY_FILE_ID=
GOOGLE_DRIVE_PROJECTS_FILE_ID=
GOOGLE_DRIVE_CONTENT_FILE_ID=
```

## Step 8: Install Dependencies

```bash
npm install googleapis
# or
pnpm add googleapis
```

## Step 9: Test It Out

1. Start your dev server: `npm run dev`
2. Try uploading a file in the admin panel
3. Check Google Drive to see if files appear
4. Try editing content - it should sync to Google Drive

## How It Works

- **Uploads**: Files go to the uploads folder in Google Drive
- **Data Files**: `content.json`, `gallery.json`, `projects.json` are synced to Google Drive
- **Fallback**: If Google Drive fails, the app falls back to local storage
- **Sync**: Data is saved to both Google Drive and local storage simultaneously

## Troubleshooting

### "Google Drive not configured" error
- Check that all `GOOGLE_DRIVE_*` variables are in `.env.local`
- Restart your dev server after adding environment variables

### "Permission denied" error
- Make sure you shared the folders with the service account email with **Editor** permission
- Wait a few seconds for permissions to propagate

### Files not appearing in Google Drive
- Check the browser console for detailed error messages
- Make sure folder IDs are correct
- Verify your service account has access to the folders

### Large file uploads hanging
- Google Drive has a 5GB file size limit
- Your connection speed matters
- Try smaller files first to test

## Security Notes

⚠️ **Important**: Keep your `.env.local` file private!
- Never commit it to version control
- The PRIVATE_KEY should never be shared
- If exposed, regenerate the service account key

The app has built-in fallback to local storage if Google Drive fails, so it won't break if credentials are missing.
