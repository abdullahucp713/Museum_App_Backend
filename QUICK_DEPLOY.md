# ⚡ QUICK DEPLOYMENT GUIDE

## 🎯 BEST OPTION: Railway.app (5 Minutes)

### Steps:

1. **Open:** https://railway.app
2. **Click:** "Login with GitHub"
3. **Click:** "New Project" → "Deploy from GitHub repo"
4. **Select:** `Museum_Ticket_App` repository
5. **Configure Service:**
   - Service click karo
   - **Settings** → **Root Directory:** Type `server`
   - **Start Command:** `npm start` (check if auto-filled)
6. **Add Variables:**
   - **Variables** tab click karo
   - Add these:
     ```
     MONGOURI = your-mongodb-url
     JWT_SECRET_KEY = any-secret-string
     NODE_ENV = production
     ```
7. **Get URL:**
   - **Settings** → **Generate Domain** click karo
   - API URL mil jayega! 🎉

---

## 🔧 Alternative: Render CLI (PowerShell)

PowerShell mein run karo:

```powershell
# Step 1: Install Render CLI
npm install -g render-cli

# Step 2: Login (browser open hoga)
render login

# Step 3: Go to server folder
cd C:\new\Museum_Ticket_App\server

# Step 4: Deploy
render deploy
```

Phir Render dashboard se environment variables manually add karo.

---

## ❓ Common Issues & Fixes

### Issue 1: "Nothing happens when clicking"
**Fix:**
- Different browser try karo (Chrome)
- Clear cache (Ctrl + Shift + Delete)
- Incognito window use karo

### Issue 2: "Repository not found"
**Fix:**
- GitHub account properly connected hai?
- Repository public hai ya private? (dono kaam karte hain)

### Issue 3: "Build failed"
**Fix:**
- Root Directory = `server` set kiya?
- package.json server folder mein hai?

---

## 🆘 Still Not Working?

**Try Railway.app** - It's MUCH easier than Render!

Or tell me:
1. Which platform you're trying?
2. What exact error/message you see?
3. Screenshot if possible?

