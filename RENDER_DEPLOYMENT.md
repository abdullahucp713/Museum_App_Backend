# Render.com Deployment Guide - STEP BY STEP

## ⚠️ IMPORTANT: Your code is in `server` folder

Since your code is in `server` subdirectory, follow these exact steps:

## Step 1: GitHub Repository Check
1. Make sure your code is pushed to GitHub
2. Repository structure should be:
   ```
   Museum_Ticket_App/
     ├── server/
     │   ├── index.js
     │   ├── package.json
     │   ├── app.js
     │   └── ... (all your files)
     └── (other folders if any)
   ```

## Step 2: Render.com Account Setup
1. Go to https://render.com
2. Sign up / Login with GitHub
3. Click "Connect GitHub Account" if not connected
4. Authorize Render to access your repositories

## Step 3: Create Web Service (MANUAL - DON'T USE render.yaml)
1. Click **"New +"** button (top right)
2. Click **"Web Service"**
3. You'll see "Connect a repository"
4. Click **"Connect account"** or **"Configure account"** if needed
5. Find and select your repository: `Museum_Ticket_App` (or your repo name)

## Step 4: Configure Service Settings

### Basic Settings:
- **Name:** `museum-app-backend` (or any name you like)
- **Region:** Choose closest (e.g., Singapore, Frankfurt, etc.)
- **Branch:** `main` or `master` (check your GitHub branch name)

### ⚠️ CRITICAL: Root Directory
- **Root Directory:** `server` ⬅️ THIS IS IMPORTANT!
  - Click on "Root Directory" field
  - Type: `server`
  - This tells Render where your code is located

### Build & Deploy:
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Environment:
- **Instance Type:** `Free`

## Step 5: Add Environment Variables
Click on "Advanced" → "Add Environment Variable"

Add these one by one:

1. **MONGOURI**
   - Key: `MONGOURI`
   - Value: Your MongoDB connection string (e.g., `mongodb+srv://...`)

2. **JWT_SECRET_KEY**
   - Key: `JWT_SECRET_KEY`
   - Value: Any random string (e.g., `your-secret-key-here`)

3. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

4. **PORT** (Optional - Render sets this automatically)
   - Key: `PORT`
   - Value: `10000`

## Step 6: Health Check (Optional but Recommended)
- Scroll down to "Health Check Path"
- Enter: `/api/health`

## Step 7: Deploy
1. Scroll to bottom
2. Click **"Create Web Service"** button (green button)
3. Render will start building automatically
4. Wait 2-5 minutes for first deployment

## Step 8: Check Deployment
1. Watch the "Logs" tab for build progress
2. Look for: "Build successful" message
3. Look for: "Server is listening at port..." in logs
4. Your service URL will be: `https://museum-app-backend.onrender.com` (or your service name)

## Troubleshooting

### Problem: "Nothing happens when clicking Deploy"
**Solutions:**
1. Make sure GitHub is connected properly
2. Try refreshing the page
3. Check browser console for errors (F12)
4. Try in incognito/private window
5. Make sure you selected the repository first

### Problem: "Build failed"
**Check:**
- Root Directory is set to `server`
- package.json exists in server folder
- All dependencies are listed in package.json

### Problem: "Service won't start"
**Check:**
- MONGOURI environment variable is set correctly
- Check logs for error messages
- Verify PORT is set (Render sets this automatically)

### Problem: "Cannot find module"
**Fix:**
- Make sure Root Directory is `server`
- All files are in server folder
- package.json is in server folder

## After Deployment

### Test Your API:
1. Health Check: `https://your-service-name.onrender.com/api/health`
2. Root: `https://your-service-name.onrender.com/`
3. Register: `POST https://your-service-name.onrender.com/api/auth/register`

### Update Frontend:
Update your frontend API URL to: `https://your-service-name.onrender.com`

## Need More Help?

If still having issues:
1. Share screenshot of Render dashboard
2. Share build logs from Render
3. Check if repository is public or private (private repos work too)
