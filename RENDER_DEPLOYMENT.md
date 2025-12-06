# Render.com Deployment Guide

## Setup Instructions

### 1. Create Account
- Go to https://render.com
- Sign up with GitHub

### 2. Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the repository with this server code

### 3. Configure Service
- **Name:** `museum-app-backend` (or any name you prefer)
- **Region:** Choose closest to you
- **Branch:** `main` or `master`
- **Root Directory:** Leave empty (or `server` if your code is in a subdirectory)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 4. Environment Variables
Add these in Render dashboard → Environment:

Required:
- `MONGOURI` - Your MongoDB connection string
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `NODE_ENV` - Set to `production`

Optional (for email features):
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`

Optional (for admin):
- `ADMIN_SECRET_KEY` - Secret key for admin registration

Optional (for Stripe):
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### 5. Deploy
- Click "Create Web Service"
- Render will automatically build and deploy
- Wait for deployment to complete

### 6. Health Check
- Render uses `/api/health` endpoint for health checks (already configured)
- Your service will be available at: `https://your-service-name.onrender.com`

## Important Notes

✅ **No Timeout Issues:** Render doesn't have the 30-second timeout limit like Vercel Free Tier
✅ **Traditional Server:** Uses full Node.js server (not serverless)
✅ **Always Running:** Free tier keeps service running (with some sleep on inactivity)

## Configuration Files

- `render.yaml` - Optional Render configuration file
- `index.js` - Main server entry point
- `package.json` - Dependencies and scripts

## Troubleshooting

1. **Build fails:** Check logs in Render dashboard
2. **DB connection fails:** Verify MONGOURI environment variable
3. **CORS errors:** CORS is already configured to allow all origins

## Free Tier Notes

- Service may sleep after 15 minutes of inactivity
- First request after sleep may take longer (wake-up time)
- Upgrade to paid plan to keep service always awake

