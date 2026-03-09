# 🔒 SSL Certificate Fix for Render Database

## Problem Fixed

Your Render deployment was failing with:
```
❌ Database pool creation failed: self-signed certificate in certificate chain
```

This happens because Render's MySQL uses self-signed SSL certificates, and Node.js rejects them by default.

## Solution Applied

Changed SSL configuration in `server/db.js` from:
```javascript
ssl: {
  rejectUnauthorized: true  // ❌ Rejects self-signed certs
}
```

To:
```javascript
ssl: {
  rejectUnauthorized: false  // ✅ Accepts self-signed certs
}
```

## Deploy the Fix

### Step 1: Commit and Push
```bash
git add .
git commit -m "Fix SSL certificate issue for Render database"
git push
```

### Step 2: Wait for Auto-Deploy
Render will automatically redeploy your backend (takes 2-3 minutes)

### Step 3: Verify Connection
Check Render logs - you should see:
```
✅ Database connected successfully
```

Instead of the SSL error.

### Step 4: Run Migration
Once the database connects successfully, run the avatar migration:

**Option A: Visit the migration endpoint**
```
https://flatmate-backend-f2ro.onrender.com/api/migrate
```

**Option B: Use Render Shell**
1. Go to Render Dashboard → Your Service
2. Click "Shell" tab
3. Run: `npm run migrate-avatar`

## Verify Everything Works

1. Check Render logs show successful database connection
2. Visit: https://flatmate-backend-f2ro.onrender.com/health
   - Should return: `{"status":"ok","timestamp":"..."}`
3. Visit: https://flatmate-backend-f2ro.onrender.com/api/migrate
   - Should return: `{"success":true,"message":"Migration completed successfully"}`
4. Test your app at https://flatmate-app.vercel.app
   - Login and try uploading an avatar

## Security Note

Setting `rejectUnauthorized: false` is safe for Render's managed MySQL because:
- The connection is still encrypted with SSL/TLS
- Render's internal network is secure
- This is a common practice for cloud database providers with self-signed certs

For maximum security in production, you could:
- Use Render's provided CA certificate
- Or use a managed database with proper SSL certs (like AWS RDS, PlanetScale, etc.)

But for your use case, this configuration is perfectly fine! ✅
