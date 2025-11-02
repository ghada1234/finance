import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Check, 
  X, 
  Crown, 
  Zap,
  DollarSign,
  ArrowLeft
} from 'lucide-react';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    loadPlans();
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const { data } = await api.get('/subscription/plans');
      setPlans(data.plans);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const loadSubscription = async () => {
    try {
      const { data } = await api.get('/subscription/status');
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/register');
      return;
    }

    if (planId === 'trial') {
      navigate('/dashboard');
      return;
    }

    setLoadingPlan(planId);
    setLoading(true);

    try {
      const { data } = await api.post('/subscription/create-checkout', {
        plan: planId
      });

      // Redirect to Ziina payment page
      window.location.href = data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start checkout');
      setLoading(false);
      setLoadingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      const { data } = await api.post('/subscription/cancel');
      toast.success(data.message);
      loadSubscription();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const handleReactivate = async () => {
    try {
      const { data } = await api.post('/subscription/reactivate');
      toast.success(data.message);
      loadSubscription();
    } catch (error) {
      toast.error('Failed to reactivate subscription');
    }
  };

  const isCurrentPlan = (planId) => {
    if (!subscription) return false;
    return subscription.plan === planId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {user && (
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        )}

        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <DollarSign className="w-10 h-10 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">FinanceSaaS</h1>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600">
            Start with a free trial, upgrade anytime
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className="max-w-2xl mx-auto mb-8 card bg-gradient-to-r from-primary-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Current Plan: <span className="capitalize">{subscription.plan}</span>
                </h3>
                <p className="text-sm text-gray-600">
                  Status: <span className="capitalize">{subscription.status}</span>
                </p>
                {subscription.status === 'free_trial' && (
                  <p className="text-sm text-gray-600">
                    {subscription.remainingTransactions} transactions remaining
                  </p>
                )}
              </div>
              {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                <button 
                  onClick={handleCancelSubscription}
                  className="btn btn-secondary"
                >
                  Cancel Subscription
                </button>
              )}
              {subscription.cancelAtPeriodEnd && (
                <button 
                  onClick={handleReactivate}
                  className="btn btn-primary"
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card relative ${
                plan.id === 'yearly' 
                  ? 'ring-2 ring-primary-500 shadow-xl transform scale-105' 
                  : ''
              }`}
            >
              {plan.id === 'yearly' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Best Value
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                {plan.id === 'trial' && <Zap className="w-12 h-12 mx-auto mb-4 text-gray-600" />}
                {plan.id === 'monthly' && <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary-600" />}
                {plan.id === 'yearly' && <Crown className="w-12 h-12 mx-auto mb-4 text-purple-600" />}

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.currency === 'AED' ? 'AED' : '$'} {plan.price}
                  </span>
                  {plan.id !== 'trial' && (
                    <span className="text-gray-600">/{plan.interval}</span>
                  )}
                  {plan.priceUSD && (
                    <div className="text-sm text-gray-500 mt-1">
                      (~${plan.priceUSD} USD)
                    </div>
                  )}
                </div>

                {plan.savings && (
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {plan.savings}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading || isCurrentPlan(plan.id)}
                className={`w-full btn ${
                  plan.id === 'yearly'
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700'
                    : isCurrentPlan(plan.id)
                    ? 'btn-secondary cursor-not-allowed'
                    : 'btn-primary'
                } disabled:opacity-50`}
              >
                {loadingPlan === plan.id ? (
                  'Processing...'
                ) : isCurrentPlan(plan.id) ? (
                  'Current Plan'
                ) : plan.id === 'trial' ? (
                  user ? 'Go to Dashboard' : 'Start Free Trial'
                ) : (
                  'Upgrade Now'
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, debit cards, and local payment methods through Ziina - the trusted payment platform for the Middle East.
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">
                How does the free trial work?
              </h3>
              <p className="text-gray-600">
                The free trial gives you 7 days to use the platform with up to 50 transactions. No credit card required to start!
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade from monthly to yearly at any time. When you upgrade, you'll be charged a prorated amount.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-600">
          <p>
            Have questions?{' '}
            <a href="mailto:support@financesaas.com" className="text-primary-600 hover:text-primary-700 font-medium">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

