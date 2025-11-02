# 🚀 Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] Update all environment variables for production
- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Configure production MongoDB database
- [ ] Set up production Stripe account
- [ ] Update Stripe webhook URL to production domain
- [ ] Test all features in staging environment
- [ ] Review and update CORS settings
- [ ] Enable rate limiting
- [ ] Set up error tracking (Sentry)

## Backend Deployment Options

### Option 1: Railway (Recommended for Beginners)

1. **Sign up at [Railway](https://railway.app/)**

2. **Deploy from GitHub**
   ```bash
   # Push your code to GitHub
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

3. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

4. **Add Environment Variables**
   - Go to project settings
   - Add all variables from `.env`
   - Update URLs to production values

5. **Add MongoDB**
   - Click "New" → "Database" → "Add MongoDB"
   - Copy connection string to MONGODB_URI

6. **Deploy**
   - Railway auto-deploys on git push
   - Get your deployment URL

### Option 2: Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set OPENAI_API_KEY=your_key
heroku config:set STRIPE_SECRET_KEY=your_key
# ... (set all other variables)

# Deploy
git push heroku main

# Open app
heroku open
```

### Option 3: DigitalOcean App Platform

1. Go to [DigitalOcean](https://www.digitalocean.com/)
2. Click "Create" → "Apps"
3. Connect GitHub repository
4. Configure build settings:
   - Build Command: `npm install`
   - Run Command: `npm start`
5. Add environment variables
6. Deploy

### Option 4: AWS (Advanced)

**Using AWS Elastic Beanstalk**

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init -p node.js your-app-name

# Create environment
eb create production

# Set environment variables
eb setenv JWT_SECRET=your_secret
eb setenv OPENAI_API_KEY=your_key
# ... (set all variables)

# Deploy
eb deploy

# Open app
eb open
```

## Frontend Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd client
   vercel
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add `VITE_STRIPE_PUBLISHABLE_KEY`

4. **Update API URL** (if needed)
   - In `client/src/utils/api.js`
   - Change baseURL to your backend URL

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the app**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Configure**
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables

### Option 3: AWS S3 + CloudFront

```bash
# Build the app
cd client
npm run build

# Install AWS CLI
# https://aws.amazon.com/cli/

# Create S3 bucket
aws s3 mb s3://your-app-name

# Enable static website hosting
aws s3 website s3://your-app-name --index-document index.html

# Upload files
aws s3 sync dist/ s3://your-app-name

# Set up CloudFront distribution for HTTPS
```

## Database Options

### Option 1: MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free

2. **Create Cluster**
   - Choose free tier (M0)
   - Select region closest to your users
   - Create cluster

3. **Configure Access**
   - Database Access → Add Database User
   - Network Access → Add IP (0.0.0.0/0 for all)

4. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Update MONGODB_URI in environment

### Option 2: Self-Hosted MongoDB

- Deploy on DigitalOcean Droplet
- Use Docker container
- Configure security and backups

## Stripe Production Setup

### 1. Activate Stripe Account
- Complete business verification
- Add bank account details
- Submit required documents

### 2. Switch to Live Mode
- Get live API keys from Stripe Dashboard
- Update environment variables
- Update webhook URL to production

### 3. Update Webhook
```
Production URL: https://your-domain.com/api/subscription/webhook

Events to listen:
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

### 4. Test Live Payments
- Use real credit card
- Verify webhooks are received
- Check subscription status updates

## Environment Variables (Production)

### Backend (.env)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=super_secure_random_string_minimum_32_characters
OPENAI_API_KEY=sk-prod-your-key
STRIPE_SECRET_KEY=sk_live_your-key
STRIPE_PUBLISHABLE_KEY=pk_live_your-key
STRIPE_WEBHOOK_SECRET=whsec_live_your-secret
STRIPE_MONTHLY_PRICE_ID=price_live_monthly_id
STRIPE_YEARLY_PRICE_ID=price_live_yearly_id
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
```

### Frontend (.env)
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-key
```

## Post-Deployment Tasks

### 1. Test Everything
- [ ] User registration
- [ ] User login
- [ ] Add transactions
- [ ] CSV import
- [ ] Receipt scanning
- [ ] View reports
- [ ] Subscribe to plan
- [ ] Payment processing
- [ ] Webhook events
- [ ] Cancel subscription

### 2. Monitor Application
- Set up error tracking (Sentry, LogRocket)
- Monitor server logs
- Track API response times
- Monitor database performance

### 3. Set Up Backups
- MongoDB automatic backups (Atlas)
- Regular database exports
- Code backups (Git)

### 4. Security Hardening
```javascript
// Add rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

```javascript
// Add helmet for security headers
import helmet from 'helmet';
app.use(helmet());
```

### 5. Performance Optimization
- Enable compression
- Add caching headers
- Use CDN for static assets
- Optimize images
- Minify assets

### 6. SSL/HTTPS
- Most platforms provide free SSL
- Force HTTPS redirects
- Update CORS settings

## Monitoring & Maintenance

### Health Checks
```javascript
// Add to server/index.js
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});
```

### Logging
```javascript
// Use winston or morgan
import morgan from 'morgan';
app.use(morgan('combined'));
```

### Database Monitoring
- Monitor slow queries
- Check index usage
- Track database size
- Set up alerts

## Scaling Considerations

### Horizontal Scaling
- Load balancer
- Multiple server instances
- Session management (Redis)

### Database Scaling
- Read replicas
- Sharding
- Caching layer (Redis)

### CDN
- CloudFront (AWS)
- Cloudflare
- FastlyCDN for static assets

## Cost Estimates (Monthly)

### Starter (~$25-35/month)
- Railway/Heroku Basic: $7-10
- MongoDB Atlas Free Tier: $0
- Vercel/Netlify: $0 (free tier)
- OpenAI API: $10-20 (usage-based)
- Stripe: Free (2.9% + 30¢ per transaction)

### Growth (~$100-150/month)
- Backend hosting: $25-50
- MongoDB Atlas M10: $57
- CDN: $10-20
- OpenAI API: $50-100
- Error tracking: $0-26 (Sentry free tier)

### Production (~$300+/month)
- Dedicated servers: $100+
- MongoDB Atlas M30: $190
- CDN + Caching: $50+
- Monitoring tools: $50+
- OpenAI API: Variable

## Backup & Recovery

### Automated Backups
```bash
# MongoDB backup script
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Schedule with cron
0 2 * * * /path/to/backup-script.sh
```

### Disaster Recovery Plan
1. Database backup restoration
2. Code rollback procedure
3. Stripe subscription sync
4. User notification plan

## Support & Documentation

- API documentation (consider Swagger/OpenAPI)
- User guide
- FAQ section
- Support email
- Status page

---

**Need help with deployment? Check the troubleshooting guide or contact support.**

