const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  userid: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  deadline: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['task', 'shortTermGoal', 'longTermGoal'],
    default: 'task'
  },
  mode: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  deposit: {
    type: Number,
    default: null,
    min: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  cancelled: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['none', 'paid', 'refunded', 'forfeited'],
    default: 'none'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, {
  versionKey: false // Disable the version key (__v)
});

// Indexes for better query performance
TaskSchema.index({ id: 1 });
TaskSchema.index({ userid: 1 });
TaskSchema.index({ deadline: 1 });
TaskSchema.index({ completed: 1 });
TaskSchema.index({ paymentStatus: 1 });

// Virtual property for task status
TaskSchema.virtual('status').get(function() {
  if (this.completed) return 'completed';
  if (this.cancelled) return 'cancelled';
  if (this.deadline < new Date()) return 'overdue';
  return 'active';
});

// Middleware to validate deposit based on mode
TaskSchema.pre('save', function(next) {
  if (this.mode === 'easy' && this.deposit !== null) {
    this.deposit = null; // Force no deposit for easy mode
  } else if (['medium', 'hard'].includes(this.mode) && (this.deposit === null || this.deposit <= 0)) {
    throw new Error('Deposit required for medium/hard mode');
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);