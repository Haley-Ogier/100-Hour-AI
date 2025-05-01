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

/* ---------- tasks “database” helpers ---------- */
const DB_FILE = path.join(__dirname, 'tasks.json');

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

/* ---------- task endpoints (unchanged) ---------- */
app.get('/api/tasks', (req, res) => {
  res.json(loadTasksFromFile());
});

app.post('/api/tasks', (req, res) => {
  const tasks = loadTasksFromFile();
  const { title, deadline, description, completed, type } = req.body;

  const newTask = {
    id: Date.now(),
    title,
    deadline,
    description,
    type: type || 'task',
    completed: !!completed
  };

  tasks.push(newTask);
  saveTasksToFile(tasks);
  res.status(201).json(newTask);
});

app.patch('/api/tasks/:id', (req, res) => {
  const tasks  = loadTasksFromFile();
  const taskId = parseInt(req.params.id, 10);
  const idx    = tasks.findIndex(t => t.id === taskId);

  if (idx === -1) return res.status(404).json({ error: 'Task not found' });

  tasks[idx] = { ...tasks[idx], ...req.body };
  saveTasksToFile(tasks);
  res.json(tasks[idx]);
});

/* ---------- start server ---------- */
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
