# 🌟 Feature Documentation

## Core Features

### 1. 🔐 Authentication & User Management

**JWT-Based Authentication**
- Secure token-based authentication
- Password hashing with bcrypt
- 30-day token expiration
- Auto-logout on token expiry

**User Model Features**
- Free trial system (7 days, 50 transactions)
- Subscription tracking
- Transaction count monitoring
- Automatic trial expiration

### 2. 💰 Transaction Management

**CRUD Operations**
- Create, Read, Update, Delete transactions
- Transaction types: Income & Expense
- 13 predefined categories
- Custom descriptions and tags
- Date-based organization

**Categories**

*Income Categories:*
- Salary
- Freelance
- Investment
- Other Income

*Expense Categories:*
- Food
- Transport
- Utilities
- Entertainment
- Healthcare
- Shopping
- Rent
- Education
- Other Expense

**Advanced Filtering**
- Filter by type (income/expense)
- Filter by category
- Date range filtering
- Pagination support

### 3. 📁 CSV Import/Export

**Import Features**
- Bulk import from CSV files
- Error handling with detailed feedback
- Automatic data validation
- Transaction count updates

**CSV Format**
```csv
type,category,amount,description,date
expense,food,25.50,Lunch,2024-01-01
income,salary,5000,Monthly Salary,2024-01-01
```

**Export Features**
- Download CSV template
- Export monthly reports as text

### 4. 🤖 AI-Powered Receipt Scanning

**Technology**: OpenAI GPT-4 Vision

**Capabilities**
- Automatic receipt image analysis
- Extract total amount
- Identify merchant name
- Categorize transactions automatically
- Parse receipt date
- Extract line items

**How It Works**
1. Upload receipt image
2. AI analyzes the image
3. Extracts structured data
4. Creates transaction automatically
5. Stores receipt image reference

**Supported Formats**
- JPEG/JPG
- PNG
- GIF
- WEBP

### 5. 📊 AI-Powered Financial Insights

**Technology**: OpenAI GPT-4 Turbo

**Monthly Report Features**
- Overall financial summary
- 3-5 personalized insights
- Actionable recommendations
- Spending pattern analysis

**Insight Types**
- **Positive**: Good financial habits
- **Warning**: Areas of concern
- **Tips**: Helpful suggestions

**Analysis Includes**
- Income vs. expense trends
- Top spending categories
- Month-over-month comparisons
- Budget recommendations

### 6. 📈 Data Visualization & Analytics

**MongoDB Aggregation Pipelines**
- Real-time data aggregation
- Optimized queries with indexes
- Complex financial calculations

**Charts & Graphs**
- Income vs. Expenses Line Chart
- Expense Category Pie Chart
- Daily Trend Analysis
- Monthly Trend Comparison
- Top Categories Bar Chart

**Dashboard Metrics**
- Total Income
- Total Expenses
- Current Balance
- Transaction Count
- Recent Transactions

**Analytics Features**
- Last 30 days overview
- Monthly breakdowns
- Category-wise analysis
- Daily transaction trends

### 7. 💳 Stripe Subscription Management

**Subscription Plans**

**Free Trial**
- 7 days duration
- Up to 50 transactions
- All features included
- No credit card required
- Auto-converts to expired after limit

**Monthly Plan - $9.99/month**
- Unlimited transactions
- Advanced analytics
- AI-powered insights
- CSV import/export
- AI receipt scanning
- Priority support

**Yearly Plan - $99.99/year**
- All monthly features
- 17% cost savings ($20 off)
- Early access to features
- Priority support

**Stripe Features**
- Secure checkout with Stripe
- Webhook integration for events
- Automatic subscription renewal
- Prorated upgrades
- Cancel anytime
- Reactivation support

**Webhook Events Handled**
- `checkout.session.completed` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_succeeded` - Successful payment
- `invoice.payment_failed` - Failed payment

### 8. 🎨 Modern UI/UX

**Design System**
- TailwindCSS for styling
- Responsive design (mobile, tablet, desktop)
- Consistent color scheme
- Accessible components

**User Experience**
- Toast notifications (react-hot-toast)
- Loading states
- Error handling
- Smooth transitions
- Intuitive navigation

**Pages**
- Login/Register
- Dashboard (Overview)
- Transactions (Management)
- Reports (Analytics & AI)
- Pricing (Subscription)

**Components**
- Sidebar navigation
- Subscription status widget
- Transaction forms
- Filter controls
- Data tables
- Interactive charts

### 9. 🔒 Security Features

**Backend Security**
- JWT token authentication
- Password hashing (bcrypt)
- Input validation (express-validator)
- CORS protection
- Rate limiting ready
- SQL injection prevention (NoSQL)

**Frontend Security**
- Token storage in localStorage
- Auto-logout on expiry
- Protected routes
- CSRF protection via JWT

### 10. 🚀 Performance Optimizations

**Database**
- MongoDB indexes on frequently queried fields
- Compound indexes for complex queries
- Efficient aggregation pipelines

**API**
- Pagination for large datasets
- Query optimization
- Lean mongoose queries

**Frontend**
- Code splitting with Vite
- Lazy loading ready
- Optimized re-renders
- Efficient state management

## Technical Architecture

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (jsonwebtoken)
- **AI**: OpenAI API (GPT-4, GPT-4 Vision)
- **Payments**: Stripe
- **Validation**: express-validator
- **File Upload**: multer

### Frontend Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Notifications**: react-hot-toast
- **Icons**: Lucide React
- **Payments**: Stripe.js

### Database Schema

**User Collection**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  subscription: {
    status: String,
    plan: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    trialEndsAt: Date
  },
  transactionCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Transaction Collection**
```javascript
{
  user: ObjectId (ref: User),
  type: String (income/expense),
  category: String,
  amount: Number,
  description: String,
  date: Date,
  receiptUrl: String,
  tags: [String],
  isRecurring: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Rate Limits & Constraints

**Free Trial Limits**
- 50 total transactions
- 7 days duration
- All features enabled

**Paid Plans**
- Unlimited transactions
- Unlimited AI scans
- Unlimited reports

## Future Enhancement Ideas

### Potential Features
- 📱 Mobile app (React Native)
- 🔔 Email notifications
- 📅 Recurring transactions
- 👥 Multi-user/family accounts
- 💱 Multi-currency support
- 🏦 Bank account integration (Plaid)
- 📊 Advanced budgeting tools
- 🎯 Financial goals tracking
- 📈 Investment tracking
- 🔄 Automatic categorization ML
- 📧 Email reports
- 🌙 Dark mode
- 🌍 Internationalization (i18n)
- 📱 PWA support
- 🔐 2FA authentication

### Technical Improvements
- Redis caching
- GraphQL API
- Real-time updates (WebSockets)
- Microservices architecture
- Docker containerization
- CI/CD pipeline
- Automated testing
- Error tracking (Sentry)
- Analytics (Google Analytics)
- A/B testing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Responsiveness

All pages and components are fully responsive and tested on:
- iPhone (all sizes)
- iPad (all sizes)
- Android phones
- Android tablets

## Accessibility

- Semantic HTML
- ARIA labels ready
- Keyboard navigation
- Screen reader friendly
- Color contrast compliance

---

**Built with ❤️ using the MERN stack**

