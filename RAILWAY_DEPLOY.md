# 🚂 Railway.app Deployment - EASIER ALTERNATIVE

Railway.app **ZYAADA AASAN HAI** than Render! Try karo ye:

## ✅ Railway.app Setup (5 Minutes)

### Step 1: Account
1. Go to: https://railway.app
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway

### Step 2: Create Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Apni `Museum_Ticket_App` repository select karo

### Step 3: Configure Service
Railway automatically detect kar lega, but verify:

1. **Service Settings** mein click karo:
   - **Root Directory:** `server` ⬅️ Set karo
   - **Start Command:** `npm start`
   - **Build Command:** (leave empty or `npm install`)

### Step 4: Environment Variables
1. **Variables** tab mein click karo
2. Add these:
   ```
   MONGOURI=mongodb+srv://...
   JWT_SECRET_KEY=your-secret-key
   NODE_ENV=production
   PORT=3000 (Railway auto-set karta hai, but add karo)
   ```

### Step 5: Deploy
- Railway **automatically deploy** karega!
- Wait 2-3 minutes
- **Settings** → **Generate Domain** click karo (free domain milega)

## ✅ Benefits:
- ✅ No Root Directory issues (easy to set)
- ✅ Automatic deployments
- ✅ Free tier with $5 credit
- ✅ Better UI than Render
- ✅ Fast deployment

---

## 📱 Mobile App Alternative: Try from Phone!

Agar computer mein issue hai:
1. Mobile browser mein https://railway.app open karo
2. Same steps follow karo
3. Mobile se bhi setup ho jayega!

