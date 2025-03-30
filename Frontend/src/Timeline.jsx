import React, { useState, useEffect, useRef } from 'react';
import './Timeline.css';
import NavBar from './NavBar';

function Timeline() {
  const allTasks = [
    { title: 'Gather Materials', description: 'Collect items needed to start.', id: 1, completed: false },
    { title: 'Build Base', description: 'Lay down foundation.', id: 2, completed: false },
    { title: 'Initial Testing', description: 'Run early tests.', id: 3, completed: false },
    { title: 'Draft Blueprint', description: 'Create design documents.', id: 4, completed: false },
    { title: 'Assemble Team', description: 'Get the right people involved.', id: 5, completed: false },
    { title: 'Prototype v2', description: 'Second version of the prototype.', id: 6, completed: false },
    { title: 'User Feedback', description: 'Gather feedback from beta testers.', id: 7, completed: false },
    { title: 'Refine & Polish', description: 'Clean up and fix known issues.', id: 8, completed: false },
    { title: 'Final QA Pass', description: 'Final quality checks.', id: 9, completed: false },
    { title: 'Launch', description: 'Deploy to production.', id: 10, completed: false },
    { title: 'Post-Launch Review', description: 'Collect metrics and user satisfaction.', id: 11, completed: false },
  ];

  const [tasks, setTasks] = useState(allTasks);
  const [showPast, setShowPast] = useState(false);
  const [tasksToShow, setTasksToShow] = useState(4);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const sentinelRef = useRef(null);
  const containerRef = useRef(null);
  const taskRefs = useRef([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const fadeObserverRef = useRef(null);

  useEffect(() => {
    const scrollObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (tasksToShow < tasks.length) {
            setTasksToShow((prev) => prev + 4);
          }
        }
      },
      { threshold: 1.0 }
    );
    if (sentinelRef.current) {
      scrollObserver.observe(sentinelRef.current);
    }
    return () => {
      if (sentinelRef.current) {
        scrollObserver.unobserve(sentinelRef.current);
      }
    };
  }, [tasksToShow, tasks]);

  useEffect(() => {
    fadeObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
          }
        });
      },
      {
        threshold: 0,
      }
    );
    taskRefs.current.forEach((ref) => {
      if (ref) fadeObserverRef.current.observe(ref);
    });
    return () => {
      taskRefs.current.forEach((ref) => {
        if (ref) fadeObserverRef.current.unobserve(ref);
      });
    };
  }, [tasksToShow]);

  useEffect(() => {
    if (showPast) {
      setTasksToShow(tasks.length);
    } else {
      setTasksToShow(4);
    }
    setTimeout(() => {
      if (!fadeObserverRef.current) return;
      taskRefs.current.forEach((ref) => {
        if (ref) {
          fadeObserverRef.current.observe(ref);
        }
      });
    }, 200);
  }, [showPast, tasks.length]);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onAddTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newTask = {
      title: newTitle,
      description: newDesc,
      id: Date.now(),
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTitle('');
    setNewDesc('');
  };

  const toggleComplete = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const filteredTasks = tasks.filter((t) => showPast || !t.completed);
  const visibleTasks = showPast ? filteredTasks : filteredTasks.slice(0, tasksToShow);
  const verticalSpacing = 160;
  const tasksCount = visibleTasks.length;
  const timelineHeight = tasksCount * verticalSpacing + 300;
  const centerX = containerWidth / 2;
  const amplitude = containerWidth / 3;
  const frequency = 0.02;
  const yOffset = 120;

  const generatePathD = () => {
    if (!containerWidth) return '';
    const points = [];
    for (let y = yOffset; y <= timelineHeight + yOffset; y += 20) {
      const x = centerX + amplitude * Math.sin(y * frequency);
      points.push([x, y]);
    }
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i][0]} ${points[i][1]}`;
    }
    return d;
  };

  const getTaskPosition = (index) => {
    const y = yOffset + index * verticalSpacing;
    const x = centerX + amplitude * Math.sin(y * frequency);
    return { x, y };
  };

  return (
    <>
      <NavBar />
      <div className="timeline-page">
        <h1 className="timeline-title">My Vibrant Path Timeline</h1>
        <button
          onClick={() => setShowPast(!showPast)}
          style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          {showPast ? 'Hide Past' : 'Expand Past'}
        </button>
        <div className="form-container">
          <form className="task-form" onSubmit={onAddTask}>
            <input
              type="text"
              placeholder="Task Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Task Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <button type="submit">Add Task</button>
          </form>
        </div>
        <div
          className="timeline-container"
          style={{ height: timelineHeight }}
          ref={containerRef}
        >
          <svg className="timeline-svg" width="100%" height={timelineHeight}>
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f6d365" />
                <stop offset="100%" stopColor="#fda085" />
              </linearGradient>
            </defs>
            <path
              d={generatePathD()}
              className="wave-path"
              fill="none"
            />
          </svg>
          {visibleTasks.map((task, index) => {
            const { x, y } = getTaskPosition(index);
            return (
              <div
                key={task.id}
                className="task-box hidden"
                style={{ left: x, top: y }}
                ref={(el) => (taskRefs.current[index] = el)}
              >
                <input
                  type="checkbox"
                  style={{ marginBottom: '0.5rem' }}
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                />
                <div>{task.title}</div>
                <div className="tooltip">{task.description}</div>
              </div>
            );
          })}
          <div
            ref={sentinelRef}
            style={{ position: 'absolute', bottom: 0, left: '50%' }}
          />
        </div>
      </div>
    </>
  );
}

export default Timeline;
