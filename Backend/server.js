/**
 * server.js
 * Run with: node server.js
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

/* ---------- core middleware ---------- */
app.use(express.json());   // body-parser first
app.use(cors());           // CORS second

/* ---------- Groq generate route ---------- */
const generateRoute = require('./routes/generate');
console.log('typeof generateRoute →', typeof generateRoute);
app.use('/api/generate', generateRoute);   // now req.body is defined

/* ---------- database files ---------- */
const ACC_FILE = path.join(__dirname, 'accounts.json');
const DB_FILE = path.join(__dirname, 'tasks.json');
const STREAK_FILE = path.join(__dirname, 'streak.json');

/* ---------- helper functions ---------- */
function loadFromFile(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Failed to read ${filePath}`, err);
    return defaultValue;
  }
}

function saveToFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Failed to write ${filePath}`, err);
    return false;
  }
}

function toLocalISODate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/* ---------- account routes ---------- */
app.get("/api/account", (req, res) => {
  const accounts = loadFromFile(ACC_FILE);
  res.json(accounts);
});

app.post('/api/account', (req, res) => {
  const accounts = loadFromFile(ACC_FILE);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, & password required' });
  }

  const newAcc = {
    userid: Date.now().toString(),
    username,
    email,
    password,
    balance: 100, // Starting balance
    transactions: [],
    tagline: "Here is my tagline",
    createdAt: new Date().toISOString(),
  };
  
  accounts.push(newAcc);
  saveToFile(ACC_FILE, accounts);
  res.status(201).json(newAcc);
});

app.patch("/api/account/:id", (req, res) => {
  const accounts = loadFromFile(ACC_FILE);
  const accountid = req.body.userid;
  const { username, password, tagline } = req.body;

  const account = accounts.find(a => a.userid === accountid);
  if (!account) return res.status(404).json({ error: `Account not found matching ${accountid}` });

  if (username) account.username = username;
  if (password) account.password = password;
  if (tagline) account.tagline = tagline;

  saveToFile(ACC_FILE, accounts);
  res.json(account);
});

app.delete("/api/account/:id", (req, res) => {
  const accounts = loadFromFile(ACC_FILE);
  const user  = req.body.userid;

  const filteredData = accounts.filter((a) => a.userid != user);
  console.log(filteredData);

  saveToFile(ACC_FILE, filteredData);

  res.json(filteredData);

});

/* ---------- payment processing ---------- */
app.post('/api/payment', (req, res) => {
  const accounts = loadFromFile(ACC_FILE);
  let { userid, amount, description } = req.body;

  if (amount === undefined) {
    return res.status(400).json({ error: 'Username and amount required' });
  }

  amount = Number(amount);

  const account = accounts.find(a => a.userid === userid);
  if (!account) {
    return res.status(404).json({ error: `Account not found matching ${userid}` });
  }

  const transaction = {
    amount: Math.abs(amount),
    type: amount > 0 ? 'deposit' : 'refund',
    description: description || 'Task deposit',
    date: new Date().toISOString()
  };

  saveToFile(ACC_FILE, accounts);

  res.json({ 
    success: true,
    newBalance: account.balance,
    transaction
  });
});

/* ---------- task routes ---------- */
app.get("/api/tasks", (req, res) => {
  const tasks = loadFromFile(DB_FILE);
  res.json(tasks);
});

app.get("/api/tasks/user/:userid", (req, res) => {
  const tasks = loadFromFile(DB_FILE);
  const userTasks = tasks.filter(t => t.userid === req.params.id);
  res.json(userTasks);
});

app.post('/api/tasks', async (req, res) => {
  const tasks = loadFromFile(DB_FILE);
  const accounts = loadFromFile(ACC_FILE);
  const {
    userid,
    title,
    deadline,
    description,
    type = 'task',
    mode = 'easy',
    deposit = null
  } = req.body;


  /* ---------- validation ---------- */
  if (!title || !deadline) {
    return res.status(400).json({ error: 'Title & deadline are required' });
  }

  if (!['easy', 'medium', 'hard'].includes(mode)) {
    return res.status(400).json({ error: 'invalid accountability mode' });
  }

  if (['medium', 'hard'].includes(mode)) {
    if (!deposit || Number(deposit) <= 0) {
      return res.status(400).json({ error: 'positive deposit required for medium/hard mode' });
    }
  }

  /* ---------- process payment if needed ---------- */
  let paymentSuccess = true;
  let paymentStatus = 'none';

  if (mode !== 'easy') {
    const account = accounts.find(a => a.userid === userid);
    if (!account) {
      return res.status(404).json({ error: `Account not found matching ${userid}` });
    }

    if (account.balance < deposit) {
      return res.status(400).json({ error: `Insufficient balance: ${account.balance} < ${deposit}` });
    }

    // Simulate payment processing (90% success rate)
    paymentSuccess = Math.random() < 0.9;
    if (!paymentSuccess) {
      return res.status(402).json({ error: 'payment failed – please try again' });
    }

    // Deduct from balance
    account.balance -= deposit;
    paymentStatus = 'paid';

    // Record transaction
    account.transactions.push({
      amount: deposit,
      type: 'deposit',
      description: `Task deposit: ${title}`,
      date: new Date().toISOString()
    });

    saveToFile(ACC_FILE, accounts);
  }

  /* ---------- create task ---------- */
  const newTask = {
    id: Date.now(),
    userid,
    title,
    deadline,
    description,
    type,
    mode,
    deposit: mode !== 'easy' ? Number(deposit) : null,
    paymentStatus,
    createdAt: new Date().toISOString(),
    completed: false,
    completedAt: null,
    cancelled: false,
    cancelledAt: null
  };

  tasks.push(newTask);
  saveToFile(DB_FILE, tasks);
  res.status(201).json(newTask);
});


app.patch("/api/tasks/:id", (req, res) => {
  const tasks = loadFromFile(DB_FILE);
  const accounts = loadFromFile(ACC_FILE);
  const taskId = req.params.id; // Get task ID from URL params
  const updates = req.body;

  /* ---------- find task ---------- */
  const taskIdx = tasks.findIndex(t => t.id == taskId); // Use == for loose comparison if IDs are mixed types
  if (taskIdx === -1) return res.status(404).json({ error: "Task not found" });

  const task = tasks[taskIdx];
  const nowISO = new Date().toISOString();

  /* ---------- handle completion ---------- */
  if (updates.completed && !task.completed) {
    updates.completedAt = nowISO;

    // Refund deposit if applicable
    if (task.mode !== 'easy' && task.paymentStatus === 'paid') {
      const account = accounts.find(a => a.userid === task.userid);
      if (!account) {
        console.error(`Account not found for userid: ${task.userid}`);
        // Continue with task update even if account not found
      } else {
        account.balance += task.deposit;
        account.transactions.push({
          amount: task.deposit,
          type: 'refund',
          description: `Refund for completed task: ${task.title}`,
          date: nowISO
        });
        saveToFile(ACC_FILE, accounts);
      }
      updates.paymentStatus = 'refunded';
    }

    /* ----------- streak bookkeeping ----------- */
    const streak = loadFromFile(STREAK_FILE, { current: 0, best: 0, lastDate: null });
    const today = toLocalISODate(nowISO);

    if (streak.lastDate === today) {
      /* already counted today → nothing to do */
    } else if (
      streak.lastDate &&
      new Date(today) - new Date(streak.lastDate) === 86_400_000
    ) {
      /* yesterday was a completion → increment */
      streak.current += 1;
    } else {
      /* gap detected → reset to 1 (today) */
      streak.current = 1;
    }

    /* record best-ever streak */
    if (streak.current > streak.best) streak.best = streak.current;

    streak.lastDate = today;
    saveToFile(STREAK_FILE, streak);
  } 
  /* ---------- handle un-completion ---------- */
  if (!updates.completed && task.completed) {
    updates.completedAt = null;
  }

  /* ---------- handle cancellation ---------- */
  if (updates.cancelled === true && !task.cancelled) {
    updates.cancelledAt = nowISO;

    // Handle deposit based on mode
    if (task.mode !== 'easy' && task.paymentStatus === 'paid') {
      const account = accounts.find(a => a.userid === task.userid);
      
      if (account) {
        if (task.mode === 'medium') {
          // Medium mode gets refund
          account.balance += task.deposit;
          account.transactions.push({
            amount: task.deposit,
            type: 'refund',
            description: `Refund for cancelled task: ${task.title}`,
            date: nowISO
          });
          updates.paymentStatus = 'refunded';
        } else if (task.mode === 'hard') {
          // Hard mode forfeits deposit
          updates.paymentStatus = 'forfeited';
        }
        saveToFile(ACC_FILE, accounts);
      }
    }
  }

  /* ---------- persist updates ---------- */
  tasks[taskIdx] = { ...task, ...updates };
  saveToFile(DB_FILE, tasks);

  res.json(tasks[taskIdx]);
});

app.delete("/api/tasks/:id", (req, res) => {
  const tasks = loadFromFile(DB_FILE);
  const user  = req.body.userid;

  const filteredData = tasks.filter((a) => a.userid != user);
  console.log(filteredData);

  saveToFile(DB_FILE, filteredData);

  res.json(filteredData);

});

/* ---------- streak route ---------- */
app.get('/api/streak', (req, res) => {
  const streak = loadFromFile(STREAK_FILE, { current: 0, best: 0, lastDate: null });
  const today = toLocalISODate(new Date().toISOString());

  if (streak.lastDate && streak.lastDate !== today) {
    // if there's a gap of ≥ 1 day, streak goes back to zero
    const diff = new Date(today) - new Date(streak.lastDate); // ms
    if (diff > 86400000) {
      streak.current = 0;
      saveToFile(STREAK_FILE, streak);
    }
  }

  res.json({
    streak: streak.current,
    bestStreak: streak.best
  });
});

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}`)
  );
}

module.exports = app;