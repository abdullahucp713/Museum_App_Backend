# Render.com - Quick Deployment Steps

## ⚠️ MUST READ: Root Directory = `server`

## Quick Steps:

1. **Go to:** https://render.com → Sign in with GitHub

2. **Click:** "New +" → "Web Service"

3. **Select Repository:** Your `Museum_Ticket_App` repository

4. **Configure:**
   - Name: `museum-backend` (any name)
   - Root Directory: **`server`** ⬅️ VERY IMPORTANT!
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Environment Variables:**
   - `MONGOURI` = your MongoDB URL
   - `JWT_SECRET_KEY` = any secret string
   - `NODE_ENV` = `production`

6. **Click:** "Create Web Service"

7. **Wait:** 3-5 minutes for deployment

## If "Nothing Happens":

✅ **Check:**
- Browser console (F12) for errors
- GitHub account is connected
- You selected repository first
- Try different browser
- Clear browser cache

✅ **Alternative Method:**
- Don't use render.yaml file
- Configure everything manually in Render dashboard
- Root Directory MUST be: `server`

## Your API URL will be:
`https://museum-backend.onrender.com` (or your service name)

