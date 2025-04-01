import React, { useState, useEffect } from "react";
import "./Homepage.css";
import Confetti from "react-confetti";
import NavBar from "./NavBar";

const SERVER_URL = "http://localhost:4000";
const ITEMS_PER_BATCH = 3;

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

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

  const typeClass =
    item.type === "shortTermGoal"
      ? "short-term-goal"
      : item.type === "longTermGoal"
      ? "long-term-goal"
      : "regular-task";

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
          {item.type === "longTermGoal"
            ? " 🎯"
            : item.type === "shortTermGoal"
            ? " ✅"
            : ""}
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
  const [allTasks, setAllTasks] = useState([]);
  const [loadedItems, setLoadedItems] = useState([]);
  const [itemsCount, setItemsCount] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiProps, setConfettiProps] = useState({});

  useEffect(() => {
    fetchAllTasksFromServer();
  }, []);

  const fetchAllTasksFromServer = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/tasks`);
      const data = await res.json();
      data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setAllTasks(data);
      setLoadedItems(data.slice(0, ITEMS_PER_BATCH));
      setItemsCount(ITEMS_PER_BATCH);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const loadMoreItems = () => {
    const nextSlice = allTasks.slice(itemsCount, itemsCount + ITEMS_PER_BATCH);
    setLoadedItems((prev) => [...prev, ...nextSlice]);
    setItemsCount((prev) => prev + nextSlice.length);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition =
        window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.offsetHeight - 10;
      if (scrollPosition >= threshold && itemsCount < allTasks.length) {
        loadMoreItems();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [itemsCount, allTasks]);

  const handleExpandPast = () => {
    setShowCompleted(!showCompleted);
  };

  const onToggleCompleted = async (item) => {
    const newVal = !item.completed;
    try {
      const res = await fetch(`${SERVER_URL}/api/tasks/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newVal })
      });
      const updatedTask = await res.json();
      setAllTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      setLoadedItems((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      if (!item.completed && newVal) {
        triggerCelebration(item.type);
      }
    } catch (err) {
      console.error("Failed to toggle completion:", err);
    }
  };

  const triggerCelebration = (type) => {
    if (type === "longTermGoal") {
      setConfettiProps({
        particleCount: 600,
        spread: 160,
        origin: { y: 0.6 }
      });
    } else if (type === "shortTermGoal") {
      setConfettiProps({
        particleCount: 300,
        spread: 100,
        origin: { y: 0.6 }
      });
    } else {
      setConfettiProps({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const visibleItems = loadedItems.filter(
    (task) => showCompleted || !task.completed
  );
  const orientationMap = new Map();
  visibleItems.forEach((task, index) => {
    orientationMap.set(task.id, index % 2 === 0 ? "left" : "right");
  });

  return (
    <>
      <NavBar />
      <div className="homepage-container">
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={confettiProps.particleCount || 200}
            recycle={false}
            gravity={0.4}
          />
        )}
        <header className="hero-section">
          <h1 className="app-title">AI Coaching App</h1>
          <p className="app-subtitle">
            Gamify your goals, build habits, and leverage AI to reach the finish line.
          </p>
        </header>
        <section className="timeline-section">
          <h2 className="timeline-heading">Upcoming Tasks & Deadlines</h2>
          <div className="expand-past-container">
            <button className="expand-past-button" onClick={handleExpandPast}>
              {showCompleted ? "Hide Past" : "Expand Past"}
            </button>
          </div>
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
                  onToggleCompleted={onToggleCompleted}
                />
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
