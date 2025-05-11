import React, { useState, useEffect, useRef } from "react";
import "./Homepage.css";
import Confetti from "react-confetti";
import NavBar from "./NavBar";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const SERVER_URL = "http://localhost:4000";
const ITEMS_PER_BATCH = 3;


function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Single item in the vertical timeline
 */
function TimelineItem({ item, orientation, hidden, onToggleCompleted }) {
  const [fadedIn, setFadedIn] = useState(false);
  const itemRef = useRef(null);
  const isPastDue = !item.completed && new Date(item.deadline) < new Date();
  // fade‑in as the card scrolls into view
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

    if (itemRef.current) observer.observe(itemRef.current);
    return () => itemRef.current && observer.unobserve(itemRef.current);
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
      className={`timeline-item ${orientation} fade-in ${fadedIn ? 'show' : ''} ${hidden ? 'hidden' : ''} ${typeClass} ${isPastDue ? 'past-due' : ''}`}
    >
      <div className="timeline-content">
        <h3 className="timeline-title">
          {item.title}
          {item.type === "longTermGoal"
            ? " 🎯"
            : item.type === "shortTermGoal"
            ? " ✅"
            : ""}
            {isPastDue && " ⚠️"}
        </h3>
        <span className="timeline-deadline">Deadline: {formatDate(item.deadline)}</span>
        <p className="timeline-description">{item.description}</p>
        <div className="complete-container">
          <label>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggleCompleted(item)}
            />
            {" "}Mark Completed
          </label>
        </div>
      </div>
    </div>
  );
}

/**
 * -------- Main page --------
 */
export default function HomePage() {
  const { curAccount } = useContext(AuthContext);

  const [allTasks, setAllTasks] = useState([]);
  const [loadedItems, setLoadedItems] = useState([]);
  const [itemsCount, setItemsCount] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiProps, setConfettiProps] = useState({});
  const [streak, setStreak] = useState(0);     // current streak
  const [best,   setBest]   = useState(0);

  /* ------------------------------------------------------------------
   * Data loaders
   * ----------------------------------------------------------------*/

  const fetchAllTasks = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/tasks`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      const filteredData = data.filter((a) => a.userid == curAccount);
      filteredData.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setAllTasks(filteredData);
      setLoadedItems(filteredData.slice(0, ITEMS_PER_BATCH));
      setItemsCount(ITEMS_PER_BATCH);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const fetchStreak = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/streak`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      const { streak, bestStreak } = await res.json();
      setStreak(streak ?? 0);
      setBest(bestStreak ?? 0);
    } catch (err) {
      console.error("Failed to fetch streak:", err);
    }
  };

  useEffect(() => {
    fetchAllTasks();
    fetchStreak();
  }, []);

  /* ------------------------------------------------------------------
   * Infinite scroll
   * ----------------------------------------------------------------*/
  const loadMoreItems = () => {
    const nextSlice = allTasks.slice(itemsCount, itemsCount + ITEMS_PER_BATCH);
    setLoadedItems((prev) => [...prev, ...nextSlice]);
    setItemsCount((prev) => prev + nextSlice.length);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const threshold = document.documentElement.offsetHeight - 10;
      if (scrollPosition >= threshold && itemsCount < allTasks.length) {
        loadMoreItems();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [itemsCount, allTasks]);

  /* ------------------------------------------------------------------
   * Toggle completion + celebration + refresh streak
   * ----------------------------------------------------------------*/
  const triggerCelebration = (type) => {
    const base = { origin: { y: 0.6 } };
    if (type === "longTermGoal") {
      setConfettiProps({ ...base, particleCount: 600, spread: 160 });
    } else if (type === "shortTermGoal") {
      setConfettiProps({ ...base, particleCount: 300, spread: 100 });
    } else {
      setConfettiProps({ ...base, particleCount: 100, spread: 70 });
    }
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const onToggleCompleted = async (item) => {
    const newVal = !item.completed;
    try {
      const res = await fetch(`${SERVER_URL}/api/tasks/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: newVal }),
      });
      const updatedTask = await res.json();
      setAllTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      setLoadedItems((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));

      // 🎉 celebration + streak update
      if (!item.completed && newVal) triggerCelebration(item.type);
      await fetchStreak();
    } catch (err) {
      console.error("Failed to toggle completion:", err);
    }
  };

  /* ------------------------------------------------------------------ */

  return (
    <>
      <NavBar />
      <div className="homepage-container">
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            numberOfPieces={confettiProps.particleCount || 500}
            recycle={false}
            gravity={0.4}
          />
        )}

        <header className="hero-section">
          <h1 className="app-title">AI Coaching App</h1>
          <p className="app-subtitle">Gamify your goals, build habits, and leverage AI to reach the finish line.</p>
          <p className="streak-banner">
            🔥 Current streak:&nbsp;{streak}&nbsp;day{streak !== 1 && "s"}
            &nbsp;&nbsp;|&nbsp;&nbsp;
            🏆 Best:&nbsp;{best}
          </p>
        </header>

        <section className="timeline-section">
          <h2 className="timeline-heading">Upcoming Tasks & Deadlines</h2>
          <div className="expand-past-container">
            <button className="expand-past-button" onClick={() => setShowCompleted(!showCompleted)}>
              {showCompleted ? "Hide Past" : "Expand Past"}
            </button>
          </div>

          <div className="timeline">
            {
              loadedItems
                .filter(item => showCompleted || !item.completed)
                .map((item, index) => {
                  const orientation = index % 2 === 0 ? "left" : "right";
                  return (
                    <TimelineItem
                      key={item.id}
                      item={item}
                      orientation={orientation}
                      hidden={false} // it's already filtered, so don't hide
                      onToggleCompleted={onToggleCompleted}
                    />
                  );
                })
            }
          </div>

        </section>
      </div>
    </>
  );
}