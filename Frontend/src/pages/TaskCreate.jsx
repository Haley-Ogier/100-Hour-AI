import React, { useState } from "react";
import "./TaskCreate.css";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";

function TaskCreate() {
  const navigate = useNavigate();

  /* -------------------------------------------------------------
   * form state
   * ----------------------------------------------------------- */
  const [title, setTitle]         = useState("");
  const [deadline, setDeadline]   = useState("");
  const [description, setDesc]    = useState("");
  const [type, setType]           = useState("task");

  const [mode, setMode]           = useState("easy");     // Easy/Medium/Hard
  const [deposit, setDeposit]     = useState("");         // string keeps <input> happy

  /* -------------------------------------------------------------
   * submit handler
   * ----------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    /* basic required fields */
    if (!title || !deadline) {
      alert("Please provide a TITLE and DEADLINE.");
      return;
    }

    /* extra validation for accountability modes */
    if (["medium", "hard"].includes(mode)) {
      if (!deposit || Number(deposit) <= 0) {
        alert("Enter a positive deposit for Medium/Hard mode.");
        return;
      }
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
          mode,
          deposit: deposit ? Number(deposit) : null,
          completed: false
        })
      });

      if (!res.ok) {
        /* try to surface server-side validation / payment errors */
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.error || "Failed to create task");
      }

      navigate("/Home");        // success 🎉
    } catch (err) {
      alert(err.message);
      console.error("Error creating task:", err);
    }
  };

  /* -------------------------------------------------------------
   * component
   * ----------------------------------------------------------- */
  return (
    <>
      <NavBar />

      <div className="task-create-page">
        <h1 className="task-create-title">Create Tasks Here:</h1>

        <div className="questions-container">
          <form className="task-create-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* ---- Title ------------------------------------------------ */}
              <div className="question-column">
                <label htmlFor="title">Title:</label>
              </div>
              <div className="input-column">
                <input
                  id="title"
                  className="input-field"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* ---- Deadline --------------------------------------------- */}
              <div className="question-column">
                <label htmlFor="deadline">Deadline:</label>
              </div>
              <div className="input-column">
                <input
                  id="deadline"
                  className="input-field"
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              {/* ---- Description ------------------------------------------ */}
              <div className="question-column">
                <label htmlFor="description">Description:</label>
              </div>
              <div className="input-column">
                <textarea
                  id="description"
                  className="input-field"
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              {/* ---- Type -------------------------------------------------- */}
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

              {/* ---- Accountability mode ---------------------------------- */}
              <div className="question-column">
                <label htmlFor="mode">Accountability:</label>
              </div>
              <div className="input-column">
                <select
                  id="mode"
                  className="input-field"
                  value={mode}
                  onChange={(e) => {
                    setMode(e.target.value);
                    setDeposit("");  // reset deposit when switching back to Easy
                  }}
                >
                  <option value="easy">Easy (no deposit)</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* ---- Deposit – only for Medium/Hard ----------------------- */}
              {["medium", "hard"].includes(mode) && (
                <>
                  <div className="question-column">
                    <label htmlFor="deposit">Deposit&nbsp;($):</label>
                  </div>
                  <div className="input-column">
                    <input
                      id="deposit"
                      className="input-field"
                      type="number"
                      min="1"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* ---- Actions -------------------------------------------------- */}
            <div className="form-actions">
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
