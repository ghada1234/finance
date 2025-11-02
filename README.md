# 💰 AI-Powered Finance SaaS Platform

A comprehensive MERN stack Finance SaaS platform with AI-powered features, Stripe monetization, and advanced analytics.

## ✨ Features

- 📊 **Income & Expense Tracking** - Track all your financial transactions
- 🤖 **AI Receipt Scanning** - Scan and extract data from receipts using OpenAI Vision
- 📈 **AI-Powered Reports** - Generate monthly reports with intelligent insights
- 📅 **Date Filtering** - Filter transactions by custom date ranges
- 📁 **CSV Import** - Bulk import transactions from CSV files
- 📉 **Data Visualization** - Beautiful charts powered by MongoDB aggregation
- 💳 **Stripe Integration** - Monetization with free trials, monthly & yearly plans
- 🔒 **Secure Authentication** - JWT-based authentication
- 🎨 **Modern UI** - Beautiful and responsive design

## 🛠️ Tech Stack

- **Frontend**: React + Vite, TailwindCSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT-4 Vision & GPT-4
- **Payment**: Stripe
- **Auth**: JWT

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- OpenAI API Key
- Stripe Account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```

3. Create `.env` file from `.env.example` and add your keys

4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

See `.env.example` for required environment variables.

## 📦 Subscription Plans

- **Free Trial**: 7 days, up to 50 transactions
- **Monthly Plan**: $9.99/month - Unlimited transactions
- **Yearly Plan**: $99.99/year - Unlimited transactions (save 17%)

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/import-csv` - Import from CSV
- `POST /api/transactions/scan-receipt` - Scan receipt with AI

### Reports
- `GET /api/reports/monthly` - Get monthly report with AI insights
- `GET /api/reports/analytics` - Get aggregated analytics

### Subscription
- `POST /api/subscription/create-checkout` - Create Stripe checkout
- `POST /api/subscription/webhook` - Stripe webhook handler
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/cancel` - Cancel subscription

## 📄 License

MIT

