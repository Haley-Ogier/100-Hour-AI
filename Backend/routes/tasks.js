const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

// Create new task
router.post("/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Process deposit
router.post("/tasks/process-deposit", async (req, res) => {
  try {
    const { amount, mode } = req.body;
    
    const payment = await stripe.payments.create({
      amount: amount * 100,  // Convert to cents
      currency: "usd",
      metadata: { mode },
      description: `Deposit (${mode} mode)`
    });

    res.json({
      success: true,
      clientSecret: payment.client_secret,
      paymentId: payment.id,
      amount: amount
    });
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Payment processing failed" 
    });
  }
});

// Complete a task (with refund if applicable)
router.post("/complete-task/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Process refund for Medium/Hard mode
    if (task.mode !== "easy" && task.paymentId) {
      await stripe.refunds.create({
        payment_intent: task.paymentId,
        metadata: { reason: "task_completed" }
      });
    }

    task.completed = true;
    await task.save();

    res.json({ 
      success: true,
      message: "Task completed successfully" + 
        (task.mode !== "easy" ? " with full deposit refund" : "")
    });
  } catch (err) {
    console.error("Completion error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Forfeit a task (with partial refund for Medium)
router.post("/forfeit-task/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    let message = "Task forfeited";
    
    // Process partial refund for Medium mode
    if (task.mode === "medium" && task.paymentId) {
      await stripe.refunds.create({
        payment_intent: task.paymentId,
        amount: Math.floor(task.deposit * 100 * 0.5), // 50% refund
        metadata: { reason: "task_forfeited_medium" }
      });
      message += ". 50% of your deposit has been refunded.";
    } else if (task.mode === "hard") {
      message += ". No refund was issued for Hard mode.";
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message
    });
  } catch (err) {
    console.error("Forfeit error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Refund payment (if task creation fails after payment)
router.post("/refund-payment", async (req, res) => {
  try {
    const { paymentId, amount } = req.body;
    
    await stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount ? Math.floor(amount * 100) : undefined
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Refund failed" 
    });
  }
});

module.exports = router;
