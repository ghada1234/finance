import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { createReadStream } from 'fs';
import { body, validationResult } from 'express-validator';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { protect, checkSubscription } from '../middleware/auth.js';
import { scanReceipt } from '../utils/openai.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// @route   GET /api/transactions
// @desc    Get all transactions with filters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, type, category, limit = 100, page = 1 } = req.query;

    const query = { user: req.user._id };

    // Date filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Type filtering
    if (type) query.type = type;

    // Category filtering
    if (category) query.category = category;

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalTransactions: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions
// @desc    Create a transaction
// @access  Private
router.post('/', [
  protect,
  checkSubscription,
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.create({
      ...req.body,
      user: req.user._id
    });

    // Update user transaction count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { transactionCount: 1 }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    // Decrement user transaction count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { transactionCount: -1 }
    });

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions/import-csv
// @desc    Import transactions from CSV
// @access  Private
router.post('/import-csv', protect, checkSubscription, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const transactions = [];
    const errors = [];

    createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Expected CSV format: type,category,amount,description,date
          const transaction = {
            user: req.user._id,
            type: row.type?.toLowerCase(),
            category: row.category?.toLowerCase(),
            amount: parseFloat(row.amount),
            description: row.description || '',
            date: row.date ? new Date(row.date) : new Date()
          };

          // Validate required fields
          if (!transaction.type || !transaction.category || !transaction.amount) {
            errors.push(`Invalid row: ${JSON.stringify(row)}`);
          } else {
            transactions.push(transaction);
          }
        } catch (error) {
          errors.push(`Error parsing row: ${JSON.stringify(row)}`);
        }
      })
      .on('end', async () => {
        try {
          if (transactions.length > 0) {
            await Transaction.insertMany(transactions);
            
            // Update user transaction count
            await User.findByIdAndUpdate(req.user._id, {
              $inc: { transactionCount: transactions.length }
            });
          }

          // Delete uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            message: 'CSV import completed',
            imported: transactions.length,
            errors: errors.length > 0 ? errors : null
          });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error saving transactions' });
        }
      })
      .on('error', (error) => {
        console.error(error);
        fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error reading CSV file' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions/scan-receipt
// @desc    Scan receipt and extract transaction data using AI
// @access  Private
router.post('/scan-receipt', protect, checkSubscription, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No receipt image uploaded' });
    }

    // Use OpenAI Vision to scan receipt
    const extractedData = await scanReceipt(req.file.path);

    // Create transaction from extracted data
    const transaction = await Transaction.create({
      user: req.user._id,
      type: extractedData.type || 'expense',
      category: extractedData.category || 'other_expense',
      amount: extractedData.amount,
      description: extractedData.description,
      date: extractedData.date || new Date(),
      receiptUrl: req.file.path
    });

    // Update user transaction count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { transactionCount: 1 }
    });

    res.status(201).json({
      transaction,
      extractedData
    });
  } catch (error) {
    console.error(error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;

