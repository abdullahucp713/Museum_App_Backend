# ✅ Vercel Deployment Checklist

## Code Changes Made ✅
1. ✅ DB connection optimized for serverless (fast timeouts, minimal pool)
2. ✅ Handler error handling improved
3. ✅ CORS configured properly
4. ✅ Lazy loading for faster cold starts

## 🔍 Vercel Dashboard - CHECK THESE:

### 1. Environment Variables
Go to: **Project → Settings → Environment Variables**

**Required Variables:**
```
MONGOURI = mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET_KEY = your-secret-key-here
NODE_ENV = production
```

**Optional (if using):**
```
ADMIN_SECRET_KEY = your-admin-key
STRIPE_SECRET_KEY = your-stripe-key
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-app-password
```

### 2. Function Settings
Go to: **Project → Settings → Functions**

Check:
- ✅ Runtime: Node.js (latest version)
- ✅ Build Command: (leave empty or `npm install`)
- ✅ Output Directory: (leave empty)

### 3. Deployment Settings
- ✅ Framework Preset: Other
- ✅ Root Directory: (leave empty if code is in root)

## 🧪 Testing After Deployment

### Test Endpoints:
1. **Health Check:**
   ```
   GET https://your-project.vercel.app/api/health
   ```

2. **Root:**
   ```
   GET https://your-project.vercel.app/
   ```

3. **Register (POST):**
   ```
   POST https://your-project.vercel.app/api/auth/register
   Content-Type: application/json
   
   {
     "firstName": "Test",
     "lastName": "User",
     "email": "test@example.com",
     "password": "password123",
     "phone": "1234567890"
   }
   ```

## 🐛 Common Issues & Fixes

### Issue 1: "Request failed" or Timeout
**Fix:**
- Check Vercel logs: **Deployments → Click deployment → Functions → View logs**
- Verify `MONGOURI` is set correctly
- Check if MongoDB allows connections from Vercel IPs (should allow 0.0.0.0/0)

### Issue 2: "Module not found"
**Fix:**
- Ensure all dependencies are in `package.json`
- Redeploy after adding dependencies

### Issue 3: "MongoDB connection failed"
**Fix:**
- Check `MONGOURI` format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
- Verify MongoDB network access allows all IPs (0.0.0.0/0)
- Check MongoDB user has correct permissions

### Issue 4: CORS errors
**Fix:**
- CORS is already configured to allow all origins
- Check frontend is using correct API URL

## 📊 Checking Logs

1. Go to **Vercel Dashboard**
2. Click on your project
3. Click on **Deployments**
4. Click on latest deployment
5. Click **Functions** tab
6. Click on `api/index.js`
7. View logs for errors

## 🔄 After Making Changes

1. Push to GitHub
2. Vercel auto-deploys
3. Wait 1-2 minutes
4. Test endpoints

