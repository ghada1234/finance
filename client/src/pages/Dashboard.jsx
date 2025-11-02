import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays } from 'date-fns';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get last 30 days analytics
      const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');

      const [analyticsRes, transactionsRes] = await Promise.all([
        api.get(`/reports/analytics?startDate=${startDate}&endDate=${endDate}`),
        api.get('/transactions?limit=5')
      ]);

      setAnalytics(analyticsRes.data);
      setRecentTransactions(transactionsRes.data.transactions);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

  // Prepare chart data
  const categoryData = analytics?.byCategory
    ?.filter(c => c.type === 'expense')
    .slice(0, 6)
    .map(c => ({
      name: c.category.replace('_', ' '),
      value: c.total
    })) || [];

  const dailyData = {};
  analytics?.dailyTrend?.forEach(item => {
    if (!dailyData[item.date]) {
      dailyData[item.date] = { date: item.date, income: 0, expense: 0 };
    }
    dailyData[item.date][item.type] = item.total;
  });

  const trendData = Object.values(dailyData).slice(-14); // Last 14 days

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview</p>
        </div>
        <Link to="/transactions" className="btn btn-primary">
          Add Transaction
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Total Income</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                ${analytics?.summary?.totalIncome?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-green-700 mt-2">
                {analytics?.summary?.incomeCount || 0} transactions
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Total Expenses</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                ${analytics?.summary?.totalExpenses?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-red-700 mt-2">
                {analytics?.summary?.expenseCount || 0} transactions
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-full">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-800">Balance</p>
              <p className="text-3xl font-bold text-primary-900 mt-2">
                ${analytics?.summary?.balance?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-primary-700 mt-2 flex items-center gap-1">
                {analytics?.summary?.balance >= 0 ? (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    Positive
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4" />
                    Negative
                  </>
                )}
              </p>
            </div>
            <div className="bg-primary-500 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Income vs Expenses (Last 14 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
                labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expenses by Category
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || transaction.category.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <Link to="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
              Add your first transaction
            </Link>
          </div>
        )}
      </div>

      {/* AI Insights Prompt */}
      <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="bg-purple-500 p-3 rounded-full">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get AI-Powered Insights
            </h3>
            <p className="text-gray-700 mb-4">
              Discover personalized financial insights and recommendations based on your spending patterns.
            </p>
            <Link to="/reports" className="btn btn-primary">
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

