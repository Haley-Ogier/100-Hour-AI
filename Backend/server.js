/**
 * server.js
 * Run with: node server.js
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = 4000;

/* ---------- core middleware ---------- */
app.use(express.json());   // body-parser first
app.use(cors());           // CORS second

/* ---------- Groq generate route ---------- */
const generateRoute = require('./routes/generate');
console.log('typeof generateRoute →', typeof generateRoute);
app.use('/api/generate', generateRoute);   // now req.body is defined

/* ---------- account “database” ---------- */
const ACC_FILE = path.join(__dirname, 'accounts.json');

/* ---------- tasks “database” helpers ---------- */
const DB_FILE = path.join(__dirname, 'tasks.json');

/* ---------- streak “database” ---------- */
const STREAK_FILE = path.join(__dirname, 'streak.json');

function loadAccountFromFile() {
  try {
    if (!fs.existsSync(ACC_FILE)) return [];
    const data = fs.readFileSync(ACC_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read account file', err);
    return [];
  }
}

function saveAccountToFile(accountObj) {
  try {
    fs.writeFileSync(ACC_FILE, JSON.stringify(accountObj, null, 2));
  } catch (err) {
    console.error('Failed to write account fie', err);
  }
}

function loadStreak() {
  try {
    if (!fs.existsSync(STREAK_FILE)) {
      // first run → seed zeros
      return { current: 0, best: 0, lastDate: null };
    }
    return JSON.parse(fs.readFileSync(STREAK_FILE, 'utf8'));
  } catch (err) {
    console.error('Failed to read streak file', err);
    // fallback keeps the app alive
    return { current: 0, best: 0, lastDate: null };
  }
}

function saveStreak(streakObj) {
  try {
    fs.writeFileSync(STREAK_FILE, JSON.stringify(streakObj, null, 2));
  } catch (err) {
    console.error('Failed to write streak file', err);
  }
}

/* helper: turn ISO string → “YYYY-MM-DD” in local TZ */
const toLocalISODate = iso =>
  new Date(iso).toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });


function loadTasksFromFile() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to read tasks file', err);
    return [];
  }
}

function saveTasksToFile(tasks) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error('Failed to write tasks file', err);
  }
}

app.get("/api/account", (req, res) => {
  const accounts = loadAccountFromFile();
  res.json(accounts);
});

app.get("/api/tasks", (req, res) => {
  const tasks = loadTasksFromFile();
  res.json(tasks);
});

app.get('/api/streak', (req, res) => {
  const streak = loadStreak();
  
  /* --- autoreset if the user didn’t log anything today --- */
  const today = toLocalISODate(new Date().toISOString());
  if (streak.lastDate && streak.lastDate !== today) {
    // if there’s a gap of ≥ 1 day, streak goes back to zero
    const diff =
      new Date(today) - new Date(streak.lastDate); // ms
    if (diff > 86400000) {
      streak.current = 0;
      saveStreak(streak);
    }
  }
  
  res.json({
    streak:     streak.current,
    bestStreak: streak.best
  });
});

app.post('/api/account', (req, res) => {
  const account = loadAccountFromFile();
  const {
        username,
        email,
        password,
    } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'username, email, & password required' });
    
    const newAcc = {
      username,
      email,
      password,
      createdAt: new Date().toISOString(),
    };
    account.push(newAcc);
    saveAccountToFile(account);
    res.status(201).json(newAcc);
});

app.post('/api/tasks', (req, res) => {
  const tasks = loadTasksFromFile();
  const {
        title,
        deadline,
        description,
        type               = 'task',
        mode               = 'easy',     // EASY by default
        deposit            = null        // number | null
      } = req.body;

/* ---------- validation ---------- */
  if (!title || !deadline)
    return res.status(400).json({ error: 'title & deadline are required' });
  
  if (!['easy', 'medium', 'hard'].includes(mode))
    return res.status(400).json({ error: 'invalid accountability mode' });
  
  if (['medium', 'hard'].includes(mode)) {
    if (deposit === null || Number(deposit) <= 0)
      return res.status(400).json({ error: 'deposit required for medium/hard' });
    }
  
    /* ---------- fake “payment” ---------- */
    let depositPaid = false;
    if (deposit !== null) {
  // stub: 90 % success; 10 % failure to demo the requirement
      depositPaid = Math.random() < 0.9;
      if (!depositPaid)
        return res.status(402).json({ error: 'payment failed – please try again' });
      }
  
  const newTask = {
    id: Date.now(),
    title,
    deadline,
    description,
    type,
    mode,
    deposit,
    depositPaid,
    createdAt: new Date().toISOString(),
    completed: false,
    completedAt: null
  };
  tasks.push(newTask);
  saveTasksToFile(tasks);
  res.status(201).json(newTask);
});

app.patch("/api/tasks/:id", (req, res) => {
  const tasks   = loadTasksFromFile();
  const taskId  = Number(req.params.id);
  const updates = req.body;                    // e.g. { completed: true }

  /* ---------- find task ---------- */
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });

  /* -------------------------------------------------------------------
   * 1.  User just marked the task COMPLETE
   * -----------------------------------------------------------------*/
  if (updates.completed === true && !tasks[idx].completed) {
    const nowISO = new Date().toISOString();
    updates.completedAt = nowISO;             // timestamp for history

    /* ----------- streak bookkeeping ----------- */
    const streak = loadStreak();              // { current, best, lastDate }
    const today  = toLocalISODate(nowISO);    // "MM/DD/YYYY" in local TZ

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
    saveStreak(streak);
  }

  /* -------------------------------------------------------------------
   * 2.  User just UN-checked a previously complete task
   * -----------------------------------------------------------------*/
  if (updates.completed === false && tasks[idx].completed) {
    updates.completedAt = null;
  }

  /* ---------- persist task update ---------- */
  tasks[idx] = { ...tasks[idx], ...updates };
  saveTasksToFile(tasks);

  res.json(tasks[idx]);
});



if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}`)
  );
}

module.exports = app;
