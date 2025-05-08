// routes/tasks.js
const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a new task
router.post("/", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Process deposit
router.post("/process-deposit", async (req, res) => {
  try {
    const { amount, mode } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "usd",
      metadata: { mode },
      description: `Task deposit (${mode} mode)`
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
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
    if (task.mode !== "easy" && task.paymentIntentId) {
      await stripe.refunds.create({
        payment_intent: task.paymentIntentId,
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
  } catch (error) {
    console.error("Completion error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Forfeit a task (with partial refund for Medium)
router.post("/forfeit-task/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    let message = "Task forfeited";
    
    // Process partial refund for Medium mode
    if (task.mode === "medium" && task.paymentIntentId) {
      await stripe.refunds.create({
        payment_intent: task.paymentIntentId,
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
  } catch (error) {
    console.error("Forfeit error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Refund payment (if task creation fails after payment)
router.post("/refund-payment", async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;
    
    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.floor(amount * 100) : undefined
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Refund failed" 
    });
  }
});

module.exports = router;