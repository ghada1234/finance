import express from 'express';
import axios from 'axios';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Ziina API configuration
const ziinaAPI = axios.create({
  baseURL: 'https://api.ziina.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.ZIINA_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Subscription plans (using Ziina)
const PLANS = {
  monthly: {
    name: 'Monthly Plan',
    price: 36.50, // AED 36.50 (~$9.99)
    interval: 'month',
    currency: 'AED'
  },
  yearly: {
    name: 'Yearly Plan',
    price: 365.00, // AED 365 (~$99.99)
    interval: 'year',
    currency: 'AED'
  }
};

// @route   POST /api/subscription/create-checkout
// @desc    Create Ziina payment link
// @access  Private
router.post('/create-checkout', protect, async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'

    if (!PLANS[plan]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const selectedPlan = PLANS[plan];

    // Create Ziina payment link
    const paymentLink = await ziinaAPI.post('/payment-links', {
      amount: selectedPlan.price,
      currency: selectedPlan.currency,
      description: `${selectedPlan.name} - Finance SaaS Subscription`,
      success_url: `${process.env.CLIENT_URL}/dashboard?checkout=success&plan=${plan}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?checkout=cancelled`,
      metadata: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        plan: plan,
        planName: selectedPlan.name
      }
    });

    // Store Ziina payment link reference
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.ziinaPaymentId': paymentLink.data.id
    });

    res.json({
      paymentId: paymentLink.data.id,
      url: paymentLink.data.url
    });
  } catch (error) {
    console.error('Ziina payment link creation error:', error.response?.data || error);
    res.status(500).json({ message: 'Error creating payment link' });
  }
});

// @route   POST /api/subscription/webhook
// @desc    Handle Ziina webhooks
// @access  Public (verified with Ziina signature)
router.post('/webhook', express.json(), async (req, res) => {
  const signature = req.headers['x-ziina-signature'];

  // Verify webhook signature
  if (signature !== process.env.ZIINA_WEBHOOK_SECRET) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const event = req.body;

  try {
    switch (event.type) {
      case 'payment.successful': {
        const payment = event.data;
        const userId = payment.metadata?.userId;
        const plan = payment.metadata?.plan;

        if (userId && plan) {
          // Calculate subscription end date
          const currentPeriodEnd = new Date();
          if (plan === 'monthly') {
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
          } else if (plan === 'yearly') {
            currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
          }

          await User.findByIdAndUpdate(userId, {
            'subscription.status': 'active',
            'subscription.plan': plan,
            'subscription.ziinaPaymentId': payment.id,
            'subscription.currentPeriodEnd': currentPeriodEnd
          });

          console.log(`Payment successful for user ${userId}, plan: ${plan}`);
        }
        break;
      }

      case 'payment.failed': {
        const payment = event.data;
        const userId = payment.metadata?.userId;

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            'subscription.status': 'expired'
          });
        }
        break;
      }

      case 'payment.refunded': {
        const payment = event.data;
        const userId = payment.metadata?.userId;

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            'subscription.status': 'cancelled',
            'subscription.plan': 'trial'
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Ziina event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling Ziina webhook:', error);
    res.status(500).json({ message: 'Webhook handler failed' });
  }
});

// @route   GET /api/subscription/status
// @desc    Get subscription status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription transactionCount');

    const response = {
      status: user.subscription.status,
      plan: user.subscription.plan,
      transactionCount: user.transactionCount,
      canAddTransactions: user.canAddTransaction()
    };

    // Add additional info based on status
    if (user.subscription.status === 'free_trial') {
      response.trialEndsAt = user.subscription.trialEndsAt;
      response.remainingTransactions = Math.max(0, 50 - user.transactionCount);
    }

    if (user.subscription.currentPeriodEnd) {
      response.currentPeriodEnd = user.subscription.currentPeriodEnd;
    }

    // Add Ziina payment info if available
    if (user.subscription.ziinaPaymentId) {
      response.ziinaPaymentId = user.subscription.ziinaPaymentId;
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscription/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/cancel', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.subscription.status !== 'active') {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Mark subscription as cancelled
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.status': 'cancelled'
    });

    res.json({
      message: 'Subscription cancelled. Access will continue until the end of the billing period.',
      currentPeriodEnd: user.subscription.currentPeriodEnd
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
});

// @route   POST /api/subscription/reactivate
// @desc    Reactivate cancelled subscription (requires new payment)
// @access  Private
router.post('/reactivate', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.subscription.status === 'active') {
      return res.status(400).json({ message: 'Subscription is already active' });
    }

    // To reactivate, user needs to make a new payment
    res.json({ 
      message: 'Please select a plan to reactivate your subscription',
      redirectTo: '/pricing'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

// @route   GET /api/subscription/plans
// @desc    Get available plans
// @access  Public
router.get('/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'trial',
        name: 'Free Trial',
        price: 0,
        currency: 'AED',
        interval: '7 days',
        features: [
          'Up to 50 transactions',
          'Basic analytics',
          'CSV import',
          'AI receipt scanning'
        ]
      },
      {
        id: 'monthly',
        name: 'Monthly Plan',
        price: 36.50,
        currency: 'AED',
        priceUSD: 9.99,
        interval: 'month',
        features: [
          'Unlimited transactions',
          'Advanced analytics',
          'AI-powered insights',
          'CSV import',
          'AI receipt scanning',
          'Priority support'
        ]
      },
      {
        id: 'yearly',
        name: 'Yearly Plan',
        price: 365.00,
        currency: 'AED',
        priceUSD: 99.99,
        interval: 'year',
        savings: '17% savings',
        features: [
          'Unlimited transactions',
          'Advanced analytics',
          'AI-powered insights',
          'CSV import',
          'AI receipt scanning',
          'Priority support',
          'Early access to new features'
        ]
      }
    ]
  });
});

export default router;

