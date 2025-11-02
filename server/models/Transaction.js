import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'salary', 'freelance', 'investment', 'other_income',
      'food', 'transport', 'utilities', 'entertainment', 
      'healthcare', 'shopping', 'rent', 'education', 'other_expense'
    ]
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  receiptUrl: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  isRecurring: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

