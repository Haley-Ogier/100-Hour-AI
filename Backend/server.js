const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

// Enable JSON body parsing
app.use(express.json());
// Allow requests from React dev server
app.use(cors());

// Path to our "database" file
const DB_FILE = path.join(__dirname, "tasks.json");

// Utility to load tasks from tasks.json
function loadTasksFromFile() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read tasks file", err);
    return [];
  }
}

// Utility to save tasks to tasks.json
function saveTasksToFile(tasks) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error("Failed to write tasks file", err);
  }
}

app.get("/api/tasks", (req, res) => {
  const tasks = loadTasksFromFile();
  res.json(tasks);
});

app.get("/api/streak", (req, res) => {
  const tasks = loadTasksFromFile();

  // Collect all calendar days on which **any** task was finished
  const toLocalDate = iso =>
    new Date(iso).toLocaleDateString("en-US", { timeZone: "America/New_York" });

  const daysWithCompletions = new Set(
    tasks
      .filter(t => t.completed && t.completedAt)
      .map(t => toLocalDate(t.completedAt))
  );

  const today = toLocalDate(new Date().toISOString());

  // Walk backward from today until a gap appears
  let streak = 0;
  let cursor = new Date();                      // JS Date is mutable
  while (daysWithCompletions.has(toLocalDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  res.json({ streak });
});


app.post("/api/tasks", (req, res) => {
  const tasks = loadTasksFromFile();

  const { title, deadline, description, completed, type } = req.body;

  const newTask = {
    id: Date.now(), // or use a UUID in real app
    title,
    deadline,
    description,
    type: type || "task",
    completed: !!completed
  };

  tasks.push(newTask);
  saveTasksToFile(tasks);

  res.status(201).json(newTask);
});

app.patch("/api/tasks/:id", (req, res) => {
  const tasks   = loadTasksFromFile();
  const taskId  = Number(req.params.id);
  const updates = req.body;             // e.g. { completed: true }

  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return res.status(404).json({ error: "Task not found" });

  if (updates.completed === true && !tasks[idx].completed) {
    const now = new Date().toISOString();
    updates.completedAt = now;          // NEW FIELD
  }
  if (updates.completed === false) {
    updates.completedAt = null;
  }

  tasks[idx] = { ...tasks[idx], ...updates };
  saveTasksToFile(tasks);

  res.json(tasks[idx]);
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
