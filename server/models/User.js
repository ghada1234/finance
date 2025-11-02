import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  subscription: {
    status: {
      type: String,
      enum: ['free_trial', 'active', 'cancelled', 'expired'],
      default: 'free_trial'
    },
    plan: {
      type: String,
      enum: ['trial', 'monthly', 'yearly'],
      default: 'trial'
    },
    ziinaPaymentId: String,
    currentPeriodEnd: Date,
    trialEndsAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      }
    }
  },
  transactionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user can add transactions
userSchema.methods.canAddTransaction = function() {
  // Free trial users limited to 50 transactions
  if (this.subscription.status === 'free_trial') {
    if (this.transactionCount >= 50) {
      return false;
    }
    // Check if trial has expired
    if (new Date() > this.subscription.trialEndsAt) {
      this.subscription.status = 'expired';
      return false;
    }
  }
  
  // Active subscribers have unlimited transactions
  if (this.subscription.status === 'active') {
    // Check if subscription has expired
    if (this.subscription.currentPeriodEnd && new Date() > this.subscription.currentPeriodEnd) {
      this.subscription.status = 'expired';
      return false;
    }
    return true;
  }
  
  return this.subscription.status === 'free_trial' || this.subscription.status === 'active';
};

const User = mongoose.model('User', userSchema);

export default User;

