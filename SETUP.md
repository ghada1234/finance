# 🚀 Finance SaaS Platform - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)
- **Stripe Account** - [Sign up](https://stripe.com/)

## Step-by-Step Installation

### 1. Install Dependencies

```bash
# Install root dependencies (backend)
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- The app will connect to `mongodb://localhost:27017/finance-saas`

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file

### 3. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 4. Configure Stripe

#### Create Stripe Account
1. Sign up at [Stripe](https://stripe.com/)
2. Get your test API keys from the Dashboard

#### Create Products and Prices
1. Go to Stripe Dashboard → Products
2. Create two products:
   - **Monthly Plan**: Price $9.99/month
   - **Yearly Plan**: Price $99.99/year
3. Copy the Price IDs for each product

#### Set up Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `http://localhost:5000/api/subscription/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret

### 5. Configure Environment Variables

Update the `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_change_this
OPENAI_API_KEY=sk-your-openai-api-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_MONTHLY_PRICE_ID=price_monthly_id_from_stripe
STRIPE_YEARLY_PRICE_ID=price_yearly_id_from_stripe
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Update the `client/.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### 6. Run the Application

```bash
# Run both backend and frontend concurrently
npm run dev

# Or run them separately:

# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🎯 Testing the Application

### 1. Create an Account
- Navigate to http://localhost:5173
- Click "Sign up"
- Create a new account (you'll get a 7-day free trial with 50 transactions)

### 2. Add Transactions
- Click "Add Transaction"
- Try different types (income/expense) and categories
- Add multiple transactions to see charts populate

### 3. Test CSV Import
1. Download the CSV template from the Transactions page
2. Fill it with sample data:
```csv
type,category,amount,description,date
expense,food,25.50,Lunch at cafe,2024-01-15
expense,transport,15.00,Uber ride,2024-01-15
income,salary,5000.00,Monthly salary,2024-01-01
expense,shopping,120.00,Groceries,2024-01-16
```
3. Import the CSV file

### 4. Test AI Receipt Scanning
1. Take a photo of a receipt
2. Click "Scan Receipt"
3. Upload the image
4. AI will extract the data automatically

### 5. View Reports
- Navigate to Reports page
- Select a month with transactions
- View AI-generated insights

### 6. Test Stripe Subscription

**Important**: Use Stripe test cards

Test Card Numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

Steps:
1. Click "Upgrade Plan" or go to Pricing page
2. Select Monthly or Yearly plan
3. Enter test card details
4. Complete checkout
5. Verify subscription status updates

## 🔧 Stripe Webhook Testing (Local Development)

For local webhook testing, use Stripe CLI:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/subscription/webhook

# Copy the webhook signing secret and update .env
```

## 📊 Sample Data for Testing

Use this data to populate your database for testing:

**Expenses:**
- Food: $200-500/month
- Transport: $100-200/month
- Utilities: $150-300/month
- Entertainment: $50-150/month
- Shopping: $100-400/month

**Income:**
- Salary: $3000-8000/month
- Freelance: $500-2000/month

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# If using Atlas, ensure IP whitelist is configured
```

### OpenAI API Errors
- Verify API key is correct
- Check you have credits in your OpenAI account
- Ensure GPT-4 Vision access is enabled

### Stripe Webhook Not Working
- Use Stripe CLI for local testing
- Verify webhook secret is correct
- Check webhook endpoint URL

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## 🎨 Features Overview

✅ **Authentication**: JWT-based secure authentication  
✅ **Transaction Management**: CRUD operations with date filtering  
✅ **CSV Import**: Bulk import transactions  
✅ **AI Receipt Scanning**: GPT-4 Vision extracts data from receipts  
✅ **AI Insights**: GPT-4 generates financial insights  
✅ **Data Visualization**: Charts with Recharts  
✅ **MongoDB Aggregation**: Advanced analytics  
✅ **Stripe Integration**: Free trial, monthly & yearly plans  
✅ **Responsive UI**: Modern TailwindCSS design  

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/import-csv` - Import CSV
- `POST /api/transactions/scan-receipt` - Scan receipt

### Reports
- `GET /api/reports/analytics` - Get analytics
- `GET /api/reports/monthly` - Get monthly report with AI

### Subscription
- `POST /api/subscription/create-checkout` - Create checkout
- `POST /api/subscription/webhook` - Stripe webhook
- `GET /api/subscription/status` - Get status
- `POST /api/subscription/cancel` - Cancel subscription
- `GET /api/subscription/plans` - Get plans

## 🚀 Deployment

### Backend (Node.js + MongoDB)
- Deploy to: Heroku, Railway, DigitalOcean, AWS
- Ensure environment variables are set
- Update webhook URL in Stripe Dashboard

### Frontend (React)
- Deploy to: Vercel, Netlify, AWS S3 + CloudFront
- Update `CLIENT_URL` in backend `.env`
- Update API base URL if needed

## 📄 License

MIT License - feel free to use this for learning or commercial projects!

## 🙏 Support

If you encounter any issues:
1. Check this setup guide
2. Review the troubleshooting section
3. Check the console for error messages
4. Ensure all environment variables are set correctly

Happy coding! 🎉

