# ⚡ Quick Start Guide

## 🎯 Get Started in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 2: Configure Environment (2 minutes)

**Edit `.env` file in root directory:**

```env
# Required for basic functionality
MONGODB_URI=mongodb://localhost:27017/finance-saas
JWT_SECRET=your_secret_key_change_this

# Required for AI features (get free key at platform.openai.com)
OPENAI_API_KEY=your_openai_api_key

# Required for subscriptions (get test keys at stripe.com)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_MONTHLY_PRICE_ID=price_monthly_id
STRIPE_YEARLY_PRICE_ID=price_yearly_id

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Edit `client/.env` file:**

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

### Step 3: Start the Application (30 seconds)

```bash
# Start both backend and frontend
npm run dev
```

**Or start separately:**

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

### Step 4: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Step 5: Create Your First Account

1. Go to http://localhost:5173
2. Click "Sign up"
3. Fill in your details
4. You'll get a **7-day free trial with 50 transactions**!

---

## 🚦 Testing Features

### ✅ Basic Testing (No API Keys Required)

You can test these features immediately:

1. **Create Account & Login**
2. **Add Transactions Manually**
3. **View Dashboard**
4. **Filter Transactions**
5. **Update/Delete Transactions**

### 🔑 With OpenAI API Key

Get a free API key at [platform.openai.com](https://platform.openai.com/):

6. **AI Receipt Scanning**
   - Upload a receipt photo
   - AI extracts data automatically

7. **AI Financial Insights**
   - View Reports page
   - Get personalized financial advice

### 💳 With Stripe Test Account

Get test keys at [stripe.com](https://stripe.com/):

8. **Subscription Management**
   - Upgrade to paid plan
   - Use test card: `4242 4242 4242 4242`
   - Any future date, any CVC

---

## 📁 Project Structure

```
fin/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & validation
│   ├── utils/             # OpenAI helpers
│   └── index.js           # Server entry point
│
├── client/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   ├── utils/         # API utilities
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   └── package.json
│
├── uploads/               # Receipt images (auto-created)
├── .env                   # Environment variables
├── package.json           # Root package.json
├── README.md              # Main documentation
├── SETUP.md              # Detailed setup guide
├── FEATURES.md           # Feature documentation
├── DEPLOYMENT.md         # Deployment guide
└── sample-transactions.csv # Sample data
```

---

## 🎨 What You'll See

### Dashboard
- 📊 Income vs Expenses charts
- 💰 Balance overview
- 📈 Spending trends
- 📝 Recent transactions

### Transactions Page
- ➕ Add/Edit/Delete transactions
- 📁 CSV import
- 📷 AI receipt scanning
- 🔍 Advanced filters

### Reports Page
- 🤖 AI-powered insights
- 📊 Top spending categories
- 💡 Personalized recommendations
- 📥 Export reports

### Pricing Page
- 🎁 Free trial details
- 💳 Monthly & yearly plans
- ⚡ Stripe checkout
- 📋 Subscription management

---

## 🐛 Common Issues & Solutions

### MongoDB Connection Failed
```bash
# Make sure MongoDB is running
# Option 1: Local MongoDB
sudo systemctl start mongodb

# Option 2: Use MongoDB Atlas (cloud)
# Sign up at mongodb.com/cloud/atlas
# Get connection string and update .env
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

### OpenAI API Errors
- Verify your API key is correct
- Check you have credits ($5 free for new accounts)
- Ensure GPT-4 Vision access (may need to add payment method)

### Stripe Webhook Not Working Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/subscription/webhook

# Copy the webhook signing secret to .env
```

---

## 📚 Learn More

- **SETUP.md** - Detailed installation guide
- **FEATURES.md** - Complete feature documentation
- **DEPLOYMENT.md** - Production deployment guide
- **README.md** - Project overview

---

## 🎯 Sample Test Data

Use `sample-transactions.csv` to quickly populate your account with test data:

1. Go to Transactions page
2. Click "Import CSV"
3. Select `sample-transactions.csv`
4. See 25 sample transactions imported!

---

## 💡 Tips for Development

### Backend Development
```bash
# Server auto-restarts on changes (nodemon)
npm run server

# Test API endpoints
curl http://localhost:5000/api/health
```

### Frontend Development
```bash
# Hot reload enabled (Vite)
npm run client

# Build for production
cd client && npm run build
```

### Database Management
```bash
# Connect to MongoDB
mongosh

# Use your database
use finance-saas

# View users
db.users.find()

# View transactions
db.transactions.find()
```

---

## 🚀 Next Steps

1. ✅ Set up the application
2. ✅ Create an account
3. ✅ Add some transactions
4. ✅ Import CSV data
5. ✅ Scan a receipt
6. ✅ View AI insights
7. ✅ Test Stripe checkout
8. 🎉 Deploy to production!

---

## 📞 Need Help?

- Check **SETUP.md** for detailed setup instructions
- Review **FEATURES.md** for feature documentation
- See **DEPLOYMENT.md** for deployment help
- Check the troubleshooting section above

---

**Happy coding! 🎉**

Built with the MERN stack:
- **M**ongoDB - Database
- **E**xpress - Backend framework
- **R**eact - Frontend framework
- **N**ode.js - Runtime

Plus: OpenAI GPT-4, Stripe, TailwindCSS, and more! 🚀

