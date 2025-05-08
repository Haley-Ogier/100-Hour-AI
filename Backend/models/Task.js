<<<<<<< Updated upstream
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ["task", "shortTermGoal", "longTermGoal"],
    default: "task"
  },
  mode: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy"
  },
  deposit: {
    type: Number,
    default: 0,
    min: 0
  },
  depositPaid: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("Task", taskSchema);
=======
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    deadline: { type: Date, required: true },
    description: { type: String },
    type: { type: String, required: true, default: "task" },
    mode: { type: String, required: true, default: "easy" },
    deposit: { type: Number, default: null },
    depositPaid: { type: Boolean, default: false },
    createdAt: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Task', taskSchema);
>>>>>>> Stashed changes
