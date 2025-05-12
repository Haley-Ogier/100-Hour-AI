const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Account = require('../models/Account');

// Create a new task with payment processing
router.post('/', async (req, res) => {
  try {
    const { userid, title, deadline, description, type, mode, deposit, completed } = req.body;

    // Validate required fields
    if (!title || !deadline) {
      return res.status(400).json({ error: 'Title and deadline are required' });
    }

    // Validate deposit for medium/hard mode
    if (['medium', 'hard'].includes(mode)) {
      if (!deposit || isNaN(deposit) || deposit <= 0) {
        return res.status(400).json({ error: 'Positive deposit required for medium/hard mode' });
      }
    }

    // Create the task
    const newTask = new Task({
      userid,
      title,
      deadline: new Date(deadline),
      description,
      type,
      mode,
      deposit: mode !== 'easy' ? Number(deposit) : null,
      completed: completed || false,
      paymentStatus: mode !== 'easy' ? 'paid' : 'none',
      createdAt: new Date()
    });

    // Save the task
    const savedTask = await newTask.save();

    res.status(201).json(savedTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ err: 'Failed to create task' });
  }
});

// Process payment for task deposit
router.post('/payment', async (req, res) => {
  try {
    let { userid, amount, description } = req.body;

    // Validate input
    if (amount === undefined) {
      return res.status(400).json({ error: 'Username and amount are required' });
    }

    amount = Number(amount);

    // Find the user's account
    const account = await Account.findOne({ userid });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check if it's a deposit (positive amount) or refund (negative amount)
    if (amount > 0) {
      // For deposits, check sufficient balance
      if (account.balance < amount) {
        return res.status(400).json({ error: `Insufficient balance: ${account.balance} < ${amount}` });
      }
      account.balance -= amount;
    } else {
      // For refunds, add the amount back
      account.balance += Math.abs(amount);
    }

    // Create transaction record
    const transaction = {
      amount: Math.abs(amount),
      type: amount > 0 ? 'deposit' : 'refund',
      description: description || 'Task deposit',
      date: new Date()
    };

    // Save the updated account
    await account.save();

    res.json({ 
      success: true,
      newBalance: account.balance,
      transaction: transaction
    });
  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Update task status (completion or cancellation)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, cancelled } = req.body;

    // Find the task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Handle completed task
    if (completed) {
      task.completed = true;
      task.completedAt = new Date();
      
      // Refund deposit if applicable
      if (task.mode !== 'easy' && task.paymentStatus === 'paid') {
        task.paymentStatus = 'refunded';
        await processRefund(task.userid, task.deposit, `Refund for completed task: ${task.title}`);
      }
    }

    // Handle cancelled task
    if (cancelled) {
      task.cancelled = true;
      task.cancelledAt = new Date();
      
      // Handle deposit based on mode
      if (task.mode !== 'easy' && task.paymentStatus === 'paid') {
        if (task.mode === 'medium') {
          // Medium mode gets refund
          await processRefund(task.userid, task.deposit, `Refund for cancelled task: ${task.title}`);
          task.paymentStatus = 'refunded';
        } else if (task.mode === 'hard') {
          // Hard mode forfeits deposit
          task.paymentStatus = 'forfeited';
          // Optionally transfer to admin or charity account
        }
      }
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Helper function to process refunds
async function processRefund(userid, amount, description) {
  try {
    const account = await Account.findOne({ userid });
    if (!account) return false;

    account.balance += amount;
    
    const transaction = {
      amount,
      type: 'refund',
      description,
      date: new Date()
    };

    account.transactions.push(transaction);
    await account.save();
    return true;
  } catch (err) {
    console.error('Refund processing error:', err);
    return false;
  }
}

// Get all tasks for a user
router.get('/user/:userid', async (req, res) => {
  try {
    const tasks = await Task.find({ userid: req.params.userid })
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching user tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get a single task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

module.exports = router;