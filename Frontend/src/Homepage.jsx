import React, { useState, useEffect, useMemo } from "react";
import "./Homepage.css";
import Confetti from "react-confetti"; // npm install react-confetti
import NavBar from "./NavBar";

const SERVER_URL = "http://localhost:4000";
const ITEMS_PER_BATCH = 3;

// Utility to format deadlines
function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

/* 
  TimelineItem sub-component:
  - Accepts an "item" with a "type" (task, shortTermGoal, longTermGoal).
  - The "orientation" prop is left or right.
  - "hidden" means we do `display: none;` if it's completed but "Expand Past" is off.
  - "onToggleCompleted" triggers the server call to update the completion state.
*/
function TimelineItem({ item, orientation, hidden, onToggleCompleted }) {
  const [fadedIn, setFadedIn] = useState(false);
  const itemRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setFadedIn(true);
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.1 }
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }
    return () => {
      if (itemRef.current) {
        observer.unobserve(itemRef.current);
      }
    };
  }, []);

  // We'll apply a type-based CSS class for extra styling
  const typeClass = item.type === "shortTermGoal"
    ? "short-term-goal"
    : item.type === "longTermGoal"
    ? "long-term-goal"
    : "regular-task"; // default for "task"

  return (
    <div
      ref={itemRef}
      className={`timeline-item ${orientation} fade-in ${
        fadedIn ? "show" : ""
      } ${hidden ? "hidden" : ""} ${typeClass}`}
    >
      <div className="timeline-content">
        <h3 className="timeline-title">
          {item.title} 
          {item.type === "longTermGoal" ? " 🎯" : item.type === "shortTermGoal" ? " ✅" : ""}
        </h3>
        <span className="timeline-deadline">
          Deadline: {formatDate(item.deadline)}
        </span>
        <p className="timeline-description">{item.description}</p>

        <div className="complete-container">
          <label>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggleCompleted(item)}
            />{" "}
            Mark Completed
          </label>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [loadedItems, setLoadedItems] = useState([]);
  const [itemsCount, setItemsCount] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);

  // For new tasks, store user input in local states
  const [newTitle, setNewTitle] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("task"); // default to "task"

  // Confetti states to handle celebrations
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiProps, setConfettiProps] = useState({}); // e.g. { particleCount: 200 }

  // Grab all tasks from server on mount, sorted by deadline
  useEffect(() => {
    fetchAllTasksFromServer();
    // eslint-disable-next-line
  }, []);

  const fetchAllTasksFromServer = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/tasks`);
      let data = await res.json();
      data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

      setLoadedItems(data.slice(0, ITEMS_PER_BATCH));
      setItemsCount(ITEMS_PER_BATCH);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  // Load more tasks (next batch) from the server
  const loadMoreItems = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/tasks`);
      let allTasks = await res.json();
      allTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

      const nextBatch = allTasks.slice(itemsCount, itemsCount + ITEMS_PER_BATCH);
      setLoadedItems((prev) => [...prev, ...nextBatch]);
      setItemsCount((prev) => prev + nextBatch.length);
    } catch (err) {
      console.error("Failed to load more tasks:", err);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = async () => {
      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.offsetHeight - 10;

      try {
        const res = await fetch(`${SERVER_URL}/api/tasks`);
        const allTasks = await res.json();

        if (scrollPosition >= threshold && itemsCount < allTasks.length) {
          loadMoreItems();
        }
      } catch (err) {
        console.error("Failed infinite scroll check:", err);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [itemsCount]);

  // "Expand Past" toggles whether we see completed tasks
  const handleExpandPast = () => {
    setShowCompleted(!showCompleted);
  };

  // Add a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDeadline) {
      alert("Please provide a title and deadline.");
      return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          deadline: newDeadline,
          description: newDesc,
          type: newType,
          completed: false
        })
      });
      if (!res.ok) {
        throw new Error("Failed to create new task");
      }

      // After creation, re-fetch tasks to maintain sorted order
      fetchAllTasksFromServer();

      // Clear form
      setNewTitle("");
      setNewDeadline("");
      setNewDesc("");
      setNewType("task");
    } catch (err) {
      console.error("Error creating new task:", err);
    }
  };

  // Toggle completion on the server, then local state
  const onToggleCompleted = async (item) => {
    const newVal = !item.completed;
    try {
      const res = await fetch(`${SERVER_URL}/api/tasks/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newVal })
      });
      const updatedTask = await res.json();

      // Update local state
      setLoadedItems((prev) => 
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );

      // Trigger a celebration if it just became completed
      if (!item.completed && newVal) {
        triggerCelebration(item.type);
      }
    } catch (err) {
      console.error("Failed to toggle completion:", err);
    }
  };

  // Show confetti with different intensities based on item type
  const triggerCelebration = (type) => {
    if (type === "longTermGoal") {
      // biggest celebration
      setConfettiProps({
        particleCount: 600,
        spread: 160,
        origin: { y: 0.6 }
      });
    } else if (type === "shortTermGoal") {
      // medium celebration
      setConfettiProps({
        particleCount: 300,
        spread: 100,
        origin: { y: 0.6 }
      });
    } else {
      // For "task" (lowest celebration)
      setConfettiProps({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setShowConfetti(true);

    // Hide confetti after 3 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  // Filter tasks: only show completed if "Expand Past" is on
  const visibleItems = loadedItems.filter(
    (task) => showCompleted || !task.completed
  );

  // Strict left-right orientation among the *visible* items
  const orientationMap = new Map();
  visibleItems.forEach((task, index) => {
    orientationMap.set(task.id, index % 2 === 0 ? "left" : "right");
  });

  return (
    <><NavBar /><div className="homepage-container">
          {showConfetti && (
              <Confetti
                  // Fill the screen or container
                  width={window.innerWidth}
                  height={window.innerHeight}
                  // Spread & particleCount come from confettiProps
                  numberOfPieces={confettiProps.particleCount || 200}
                  recycle={false}
                  gravity={0.4} />
          )}

          <header className="hero-section">
              <h1 className="app-title">AI Coaching App</h1>
              <p className="app-subtitle">
                  Gamify your goals, build habits, and leverage AI to reach the finish line.
              </p>
          </header>

          <section className="timeline-section">
              <h2 className="timeline-heading">Upcoming Tasks & Deadlines</h2>

              {/* "Expand Past" button */}
              <div className="expand-past-container">
                  <button className="expand-past-button" onClick={handleExpandPast}>
                      {showCompleted ? "Hide Past" : "Expand Past"}
                  </button>
              </div>

              {/* Create New Task/Goal Form */}
              <div className="new-task-form-container">
                  <form onSubmit={handleAddTask}>
                      <div>
                          <label>Title:</label>
                          <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              required />
                      </div>
                      <div>
                          <label>Deadline:</label>
                          <input
                              type="date"
                              value={newDeadline}
                              onChange={(e) => setNewDeadline(e.target.value)}
                              required />
                      </div>
                      <div>
                          <label>Description (optional):</label>
                          <input
                              type="text"
                              value={newDesc}
                              onChange={(e) => setNewDesc(e.target.value)} />
                      </div>
                      <div>
                          <label>Type:</label>
                          <select
                              value={newType}
                              onChange={(e) => setNewType(e.target.value)}
                          >
                              <option value="task">Task</option>
                              <option value="shortTermGoal">Short Term Goal</option>
                              <option value="longTermGoal">Long Term Goal</option>
                          </select>
                      </div>
                      <button type="submit">Add Task/Goal</button>
                  </form>
              </div>

              {/* Timeline */}
              <div className="timeline">
                  {loadedItems.map((item) => {
                      const hidden = item.completed && !showCompleted;
                      const orientation = orientationMap.get(item.id) || "left";
                      return (
                          <TimelineItem
                              key={item.id}
                              item={item}
                              orientation={orientation}
                              hidden={hidden}
                              onToggleCompleted={onToggleCompleted} />
                      );
                  })}
              </div>

              {/* "Loading more" prompt if not all tasks are loaded */}
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  {/* If you'd like, you can check if there's more data to load from the server. */}
                  <div className="loading-more">
                      {/* Example: itemsCount < total tasks in DB => "Scroll down to load more" */}
                  </div>
              </div>
          </section>
      </div></>
  );
}
