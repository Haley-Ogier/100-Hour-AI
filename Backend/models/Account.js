const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'refund', 'forfeiture', 'withdrawal', 'payment'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }
}, { _id: false });

const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  transactions: {
    type: [TransactionSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false // Disable the version key (__v)
});

// Update the updatedAt field before saving
AccountSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for better query performance
AccountSchema.index({ username: 1 });

// Virtual property for account status
AccountSchema.virtual('status').get(function() {
  if (this.balance < 0) return 'overdrawn';
  return 'active';
});

// Static method to get account by username with balance check
AccountSchema.statics.findByUsernameWithBalance = async function(username, minBalance = 0) {
  return this.findOne({ username, balance: { $gte: minBalance } });
};

module.exports = mongoose.model('Account', AccountSchema);