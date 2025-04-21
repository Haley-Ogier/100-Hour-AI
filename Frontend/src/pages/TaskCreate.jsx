import React, { useState } from 'react';
import './TaskCreate.css';
import NavBar from './NavBar';
import { useNavigate } from "react-router-dom";

function TaskCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("task");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !deadline) {
      alert("Please provide a title and deadline!");
      return;
    }
    try {
      const res = await fetch("http://localhost:4000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          deadline,
          description,
          type,
          completed: false
        })
      });
      if (!res.ok) {
        throw new Error("Failed to create task");
      }
      navigate("/Home");
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  return (
    <>
      <NavBar />
      <div className="task-create-page">
        <h1 className="task-create-title">Create Tasks Here:</h1>
        <div className="questions-container">
          <form className="task-create-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="question-column">
                <label htmlFor="title">Title:</label>
              </div>
              <div className="input-column">
                <input
                  type="text"
                  id="title"
                  className="input-field"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="question-column">
                <label htmlFor="deadline">Deadline:</label>
              </div>
              <div className="input-column">
                <input
                  type="date"
                  id="deadline"
                  className="input-field"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div className="question-column">
                <label htmlFor="description">Description:</label>
              </div>
              <div className="input-column">
                <textarea
                  id="description"
                  className="input-field"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="question-column">
                <label htmlFor="type">Type:</label>
              </div>
              <div className="input-column">
                <select
                  id="type"
                  className="input-field"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="task">Task</option>
                  <option value="shortTermGoal">Short-Term Goal</option>
                  <option value="longTermGoal">Long-Term Goal</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
              <button type="submit" className="submit-button">
                Create task
              </button>
              <button
                type="button"
                className="submit-button"
                onClick={() => navigate("/Home")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default TaskCreate;