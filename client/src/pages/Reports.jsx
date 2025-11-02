import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Lightbulb,
  Calendar,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format } from 'date-fns';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadMonthlyReport();
  }, [selectedMonth, selectedYear]);

  const loadMonthlyReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/monthly?month=${selectedMonth}&year=${selectedYear}`);
      setReport(data);
    } catch (error) {
      toast.error('Failed to load report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'tip':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-purple-50 border-purple-200';
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const reportText = `
Financial Report - ${format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}
===============================================

SUMMARY
-------
Total Income: $${report.summary.totalIncome.toFixed(2)}
Total Expenses: $${report.summary.totalExpenses.toFixed(2)}
Balance: $${report.summary.balance.toFixed(2)}
Total Transactions: ${report.summary.transactionCount}

TOP SPENDING CATEGORIES
-----------------------
${report.topCategories.map(c => `${c.category}: $${c.total.toFixed(2)} (${c.count} transactions)`).join('\n')}

AI INSIGHTS
-----------
${report.aiInsights?.summary || 'No insights available'}

RECOMMENDATIONS
---------------
${report.aiInsights?.recommendations?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'No recommendations available'}
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${selectedYear}-${selectedMonth}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Reports</h1>
          <p className="text-gray-600 mt-1">AI-powered insights and analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="input max-w-xs"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {format(new Date(2024, month - 1), 'MMMM')}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input max-w-xs"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button onClick={downloadReport} className="btn btn-secondary">
            <Download className="w-4 h-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm font-medium text-green-800">Total Income</p>
          <p className="text-2xl font-bold text-green-900 mt-2">
            ${report?.summary?.totalIncome?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100">
          <p className="text-sm font-medium text-red-800">Total Expenses</p>
          <p className="text-2xl font-bold text-red-900 mt-2">
            ${report?.summary?.totalExpenses?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <p className="text-sm font-medium text-primary-800">Balance</p>
          <p className="text-2xl font-bold text-primary-900 mt-2">
            ${report?.summary?.balance?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm font-medium text-purple-800">Transactions</p>
          <p className="text-2xl font-bold text-purple-900 mt-2">
            {report?.summary?.transactionCount || 0}
          </p>
        </div>
      </div>

      {/* AI Insights */}
      {report?.aiInsights && (
        <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-purple-500 p-3 rounded-full">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                AI-Powered Insights
              </h2>
              <p className="text-gray-700 text-lg">
                {report.aiInsights.summary}
              </p>
            </div>
          </div>

          {/* Individual Insights */}
          {report.aiInsights.insights && report.aiInsights.insights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {report.aiInsights.insights.map((insight, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {insight.title}
                      </h3>
                      <p className="text-sm text-gray-700">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {report.aiInsights.recommendations && report.aiInsights.recommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {report.aiInsights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Top Spending Categories */}
      {report?.topCategories && report.topCategories.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Top Spending Categories
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.topCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.replace('_', ' ')}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => `$${value.toFixed(2)}`}
                labelFormatter={(label) => label.replace('_', ' ')}
              />
              <Bar dataKey="total" fill="#ef4444" name="Amount Spent" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-3">
            {report.topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {category.category.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {category.count} transactions
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-red-600">
                  ${category.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!report?.summary?.transactionCount && (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Data for This Month
          </h3>
          <p className="text-gray-600">
            Add some transactions to see your monthly report and AI insights.
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;

