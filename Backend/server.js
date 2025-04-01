/**
 * server.js
 * Run with: node server.js
 */
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

// GET /api/tasks - return all tasks
app.get("/api/tasks", (req, res) => {
  const tasks = loadTasksFromFile();
  res.json(tasks);
});

// POST /api/tasks - create a new task
app.post("/api/tasks", (req, res) => {
  const tasks = loadTasksFromFile();

  const { title, deadline, description, completed, type } = req.body;

  const newTask = {
    id: Date.now(), // or use a UUID in real app
    title,
    deadline,
    description,
    // user-provided or default to "task"
    type: type || "task",
    completed: !!completed
  };

  tasks.push(newTask);
  saveTasksToFile(tasks);

  res.status(201).json(newTask);
});

// PATCH /api/tasks/:id - update a task by id
app.patch("/api/tasks/:id", (req, res) => {
  const tasks = loadTasksFromFile();
  const taskId = parseInt(req.params.id, 10);

  const updatedFields = req.body; // e.g. { completed: true }

  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks[idx] = { ...tasks[idx], ...updatedFields };
  saveTasksToFile(tasks);

  res.json(tasks[idx]);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
