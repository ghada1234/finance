# 🔧 Environment Setup Guide

## Step 1: Create Root `.env` File

Create a file called `.env` in `/Users/ghadaalani/Desktop/fin/` with this content:

```env
# ====================================
# DATABASE (Choose one option)
# ====================================

# Option A: Free MongoDB Atlas (Recommended - Cloud database)
# Sign up at: https://www.mongodb.com/cloud/atlas
# MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/finance-saas?retryWrites=true&w=majority

# Option B: Local MongoDB (if you have it installed)
MONGODB_URI=mongodb://localhost:27017/finance-saas

# ====================================
# SECURITY (REQUIRED)
# ====================================
JWT_SECRET=finance_saas_secret_key_2024_change_this

# ====================================
# OPENAI API (for AI features)
# ====================================
# You provided: 
OPENAI_API_KEY=sk-your_actual_openai_key_here

# ====================================
# ZIINA PAYMENT (Optional - for subscriptions)
# ====================================
# Get your API key from: https://dashboard.ziina.com
# ZIINA_API_KEY=your_ziina_api_key_here
# ZIINA_WEBHOOK_SECRET=your_ziina_webhook_secret

# ====================================
# SERVER CONFIGURATION (DO NOT CHANGE)
# ====================================
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Step 2: Choose Your Database Option

### Option A: MongoDB Atlas (Free Cloud - Recommended) ⭐

**Quick Setup (5 minutes):**

1. **Sign up**: https://www.mongodb.com/cloud/atlas/register
   - Email: ghadaabdulazi1@gmail.com
   - Create a password

2. **Create FREE cluster** (M0 Sandbox - no credit card needed)
   - Cloud Provider: AWS or Google Cloud
   - Region: Choose closest to you (e.g., Frankfurt for Middle East)
   - Cluster Name: "FinanceSaaS" or leave as "Cluster0"

3. **Create Database User**:
   - Click "Database Access" → "Add New Database User"
   - Username: `financeadmin`
   - Password: Click "Autogenerate" and **COPY IT!**
   - User Privileges: "Read and write to any database"

4. **Allow Network Access**:
   - Click "Network Access" → "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)

5. **Get Connection String**:
   - Click "Database" → "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the string (looks like: `mongodb+srv://financeadmin:<password>@...`)
   - Replace `<password>` with your actual password
   - Add `/finance-saas` before the `?`

**Example:**
```
mongodb+srv://financeadmin:MyPassword123@cluster0.ab1cd.mongodb.net/finance-saas?retryWrites=true&w=majority
```

6. **Update your `.env` file** with this connection string

### Option B: Use Local MongoDB (If Already Installed)

If you already have MongoDB installed, just use:
```env
MONGODB_URI=mongodb://localhost:27017/finance-saas
```

Make sure MongoDB is running:
```bash
brew services start mongodb-community
```

## Step 3: Ziina Setup (Optional - For Payments)

**Get Ziina API Keys:**

1. Go to: https://dashboard.ziina.com
2. Sign up or login
3. Go to API Settings
4. Copy your API Key
5. Copy your Webhook Secret
6. Add both to your `.env` file

**Note:** You can skip Ziina for now and still use all other features!

## Step 4: Install Dependencies

```bash
# Go to project folder
cd /Users/ghadaalani/Desktop/fin

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 5: Start the Application

```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

## ✅ What Works Right Now

With your current setup (OpenAI key + MongoDB), you have:

✅ User authentication
✅ Add/edit/delete transactions
✅ Dashboard with beautiful charts
✅ Filter transactions by date/type/category
✅ CSV import (use `sample-transactions.csv`)
✅ **AI Receipt Scanning** 🤖 (with your OpenAI key!)
✅ **AI Financial Insights** 💡 (with your OpenAI key!)
✅ Monthly reports with AI recommendations

## 🔜 Coming Soon (When You Add Ziina)

❌ Subscription payments (needs Ziina API key)
❌ Upgrade to paid plans

---

## 🚀 Quick Start Summary

**Minimum to get started:**
1. Create `.env` file with MongoDB URI and JWT_SECRET
2. Run `npm install` in root folder
3. Run `npm install` in client folder
4. Run `npm run dev`
5. Open http://localhost:5173
6. Create account and start using!

**You already have OpenAI configured, so AI features will work! 🎉**

---

## 💡 Tips

- **MongoDB Atlas** is recommended - it's free and cloud-based
- You can add Ziina later when you want to accept payments
- All AI features work with the OpenAI key you provided
- The app works perfectly without Ziina for personal finance tracking

---

## 🆘 Need Help?

If you get stuck, let me know at which step!

