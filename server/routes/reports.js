import express from 'express';
import Transaction from '../models/Transaction.js';
import { protect } from '../middleware/auth.js';
import { generateMonthlyInsights } from '../utils/openai.js';

const router = express.Router();

// @route   GET /api/reports/analytics
// @desc    Get aggregated analytics data
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = { user: req.user._id };
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    // Aggregate income vs expenses
    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Aggregate by category
    const byCategory = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Monthly trend
    const monthlyTrend = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Daily trend for the period
    const dailyTrend = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    const totalIncome = summary.find(s => s._id === 'income')?.total || 0;
    const totalExpenses = summary.find(s => s._id === 'expense')?.total || 0;

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        incomeCount: summary.find(s => s._id === 'income')?.count || 0,
        expenseCount: summary.find(s => s._id === 'expense')?.count || 0
      },
      byCategory: byCategory.map(item => ({
        type: item._id.type,
        category: item._id.category,
        total: item.total,
        count: item.count
      })),
      monthlyTrend: monthlyTrend.map(item => ({
        year: item._id.year,
        month: item._id.month,
        type: item._id.type,
        total: item.total
      })),
      dailyTrend: dailyTrend.map(item => ({
        date: item._id.date,
        type: item._id.type,
        total: item.total
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/monthly
// @desc    Get monthly report with AI insights
// @access  Private
router.get('/monthly', protect, async (req, res) => {
  try {
    const { year, month } = req.query;

    // Default to current month if not specified
    const targetDate = new Date(year || new Date().getFullYear(), 
                                 (month ? month - 1 : new Date().getMonth()), 1);
    const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const matchStage = {
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    };

    // Get summary statistics
    const summary = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top spending categories
    const topCategories = await Transaction.aggregate([
      { $match: { ...matchStage, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    const totalIncome = summary.find(s => s._id === 'income')?.total || 0;
    const totalExpenses = summary.find(s => s._id === 'expense')?.total || 0;
    const transactionCount = summary.reduce((acc, s) => acc + s.count, 0);

    // Generate AI insights
    let aiInsights = null;
    try {
      aiInsights = await generateMonthlyInsights({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        topCategories: topCategories.map(c => ({
          category: c._id,
          total: c.total
        })),
        transactions: transactionCount
      });
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }

    res.json({
      period: {
        year: targetDate.getFullYear(),
        month: targetDate.getMonth() + 1,
        startDate,
        endDate
      },
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount
      },
      topCategories: topCategories.map(c => ({
        category: c._id,
        total: c.total,
        count: c.count
      })),
      aiInsights
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

