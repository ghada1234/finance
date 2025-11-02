# 🚀 Deployment Guide - Netlify + Render

## Overview

- **Frontend (React)** → Netlify
- **Backend (Node.js)** → Render (Free tier)
- **Database** → MongoDB Atlas (Already set up!)

---

## 📦 Step 1: Deploy Backend to Render (5 minutes)

### Option A: Using GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   cd /Users/ghadaalani/Desktop/fin
   git init
   git add .
   git commit -m "Initial commit - Finance SaaS"
   # Create a repo on GitHub, then:
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Go to Render:**
   - Visit: https://render.com
   - Sign up with GitHub

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your `fin` repository

4. **Configure:**
   - Name: `finance-saas-api`
   - Environment: `Node`
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: Leave empty
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

5. **Add Environment Variables:**
   Click "Advanced" → Add these:
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_connection_string_here
   JWT_SECRET=your_super_secret_jwt_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ZIINA_API_KEY=your_ziina_api_key_here
   ZIINA_WEBHOOK_SECRET=your_webhook_secret
   PORT=5000
   CLIENT_URL=https://YOUR_NETLIFY_SITE.netlify.app
   ```

6. **Click "Create Web Service"**

7. **Wait for deployment** (2-3 minutes)

8. **Copy your backend URL:** 
   - It will look like: `https://finance-saas-api.onrender.com`
   - **Save this URL!** You'll need it for Netlify

---

## 🌐 Step 2: Deploy Frontend to Netlify (3 minutes)

### Option A: Using Netlify CLI (Fastest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from the client directory
cd /Users/ghadaalani/Desktop/fin/client
netlify deploy --prod
```

**When prompted:**
- Build command: `npm run build`
- Publish directory: `dist`

### Option B: Using GitHub + Netlify Dashboard

1. **Go to Netlify:**
   - Visit: https://app.netlify.com
   - Sign up with GitHub

2. **Import Project:**
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select your repository
   
3. **Configure Build Settings:**
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```

4. **Add Environment Variable:**
   - Go to Site settings → Environment variables
   - Add:
     ```
     VITE_API_URL=https://YOUR_RENDER_URL.onrender.com/api
     ```
   - Replace with your actual Render URL from Step 1

5. **Deploy!**

---

## ✅ Step 3: Update Backend CLIENT_URL

After Netlify deployment:

1. **Get your Netlify URL:**
   - Example: `https://finance-saas-abc123.netlify.app`

2. **Update Render Environment Variable:**
   - Go to your Render dashboard
   - Click your service
   - Go to "Environment"
   - Update `CLIENT_URL` to your Netlify URL
   - Save changes (will auto-redeploy)

---

## 🔧 Step 4: Test Your Deployed App

1. **Visit your Netlify URL**
2. **Register a new account**
3. **Add a transaction**
4. **Test all features:**
   - ✅ Registration/Login
   - ✅ Add transactions
   - ✅ CSV import
   - ✅ AI receipt scanning
   - ✅ Dashboard
   - ✅ Reports with AI

---

## 📝 Quick Commands Reference

### Build Frontend Locally
```bash
cd client
npm run build
```

### Test Production Build Locally
```bash
cd client
npm run preview
```

### Deploy to Netlify (CLI)
```bash
cd client
netlify deploy --prod
```

---

## 🌍 Your Live URLs

After deployment, you'll have:

- **Frontend:** `https://your-site-name.netlify.app`
- **Backend API:** `https://finance-saas-api.onrender.com`
- **Database:** MongoDB Atlas (already live!)

---

## 🎯 Environment Variables Summary

### Frontend (.env on Netlify)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

### Backend (.env on Render)
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
ZIINA_API_KEY=your_ziina_key
ZIINA_WEBHOOK_SECRET=your_webhook_secret
PORT=5000
CLIENT_URL=https://your-frontend.netlify.app
```

---

## 💡 Tips

1. **Free Tier Limits:**
   - Render: 750 hours/month (good for one app 24/7)
   - Netlify: 100GB bandwidth/month
   - Both are plenty for testing!

2. **Cold Starts:**
   - Render free tier sleeps after 15 min inactivity
   - First request after sleep takes ~30 seconds
   - Keep alive with cron job if needed

3. **Monitoring:**
   - Render: Built-in logs and metrics
   - Netlify: Deploy logs and analytics

4. **Custom Domain (Optional):**
   - Both support custom domains for free
   - Set up in respective dashboards

---

## 🔄 To Update Your App

```bash
# Make changes locally
git add .
git commit -m "Update description"
git push

# Render and Netlify will auto-deploy!
```

---

## 🆘 Troubleshooting

### Frontend can't connect to backend:
- Check `VITE_API_URL` in Netlify environment variables
- Verify CORS settings in backend (already configured)

### Backend won't start:
- Check Render logs
- Verify all environment variables are set
- Check MongoDB Atlas IP whitelist (should have 0.0.0.0/0)

### 404 errors on refresh:
- Already handled with `_redirects` file ✅

---

Ready to deploy? Let me know which method you prefer! 🚀

