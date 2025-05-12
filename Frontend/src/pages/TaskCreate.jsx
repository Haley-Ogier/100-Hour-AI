import React, { useState, useEffect } from "react";
import "./TaskCreate.css";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const SERVER_URL = "http://localhost:4000";

function TaskCreate() {
  const navigate = useNavigate();
  const { curAccount } = useContext(AuthContext);

  /* -------------------------------------------------------------
   * form state
   * ----------------------------------------------------------- */
  const [userid, setId] = useState("");
  const [username, setName] = useState("");
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDesc] = useState("");
  const [type, setType] = useState("task");
  const [mode, setMode] = useState("easy");
  const [deposit, setDeposit] = useState("");
  const [balance, setBalance] = useState(100);  // Faking balance for testing
  // const [balance, setBalance] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  
  /* -------------------------------------------------------------
   * AI suggestion state
   * ----------------------------------------------------------- */
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  /* -------------------------------------------------------------
   * Fetch account info including balance
   * ----------------------------------------------------------- */
  const fetchAcc = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/account`);
      const data = await res.json();
      for (let i=0; i<data.length; ++i) {
        if (data[i].userid === curAccount) {
          setId(data[i].userid);
          setName(data[i].username);
          setBalance(data[i].balance || 0);
        }
      }
    } catch (err) {
      alert(err.message);
      console.error("Error getting account info:", err);
    }
  };

  useEffect(() => { fetchAcc(); }, []);

  /* -------------------------------------------------------------
   * Process payment for the deposit
   * ----------------------------------------------------------- */
  const processPayment = async (amount) => {
    try {
      setProcessingPayment(true);

      const res = await fetch(`${SERVER_URL}/api/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid: curAccount,
          amount: Number(amount),
          description: `Task deposit: ${title}`
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Payment failed");
      }

      const data = await res.json();
      setBalance(data.newBalance);
      return true;
    } catch (err) {
      alert(`Payment error: ${err.message}`);
      return false;
    } finally {
      setProcessingPayment(false);
    }
  };

  /* -------------------------------------------------------------
   * handleTitleChange
   * - calls AI after user types, for demonstration
   * ----------------------------------------------------------- */
  async function handleTitleChange(e) {
    const userInput = e.target.value;
    setTitle(userInput);
  
    if (!userInput || userInput.length < 3) {
      setAiSuggestions("");
      return;
    }
  
    try {
      setLoadingSuggestions(true);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `User typed this partial task title: "${userInput}". Suggest a refined or more descriptive task title.`
        }),
      });
  
      if (!res.ok) throw new Error("Failed to fetch AI suggestions");
      const data = await res.json();
      setAiSuggestions(data.result || "");
    } catch (err) {
      console.error("AI suggestion error:", err);
      setAiSuggestions("❌ Error getting suggestions from AI.");
    } finally {
      setLoadingSuggestions(false);
    }
  }

  /* -------------------------------------------------------------
   * submit handler with payment processing
   * ----------------------------------------------------------- */
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!title || !deadline) {
      alert("Please provide a TITLE and DEADLINE.");
      return;
    }

    if (["medium", "hard"].includes(mode)) {
      if (!deposit || Number(deposit) <= 0) {
        alert("Enter a positive deposit for Medium/Hard mode.");
        return;
      }

      // Check if user has sufficient balance
      if (Number(deposit) > balance) {
        alert(`Insufficient balance. Your current balance is $${balance}`);
        return;
      }

      // Process payment
      const paymentSuccess = await processPayment(Number(deposit));
      if (!paymentSuccess) return;
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid,
          title,
          deadline,
          description,
          type,
          mode,
          deposit: deposit ? Number(deposit) : null,
          completed: false,
          paymentStatus: ["medium", "hard"].includes(mode) ? "paid" : "none",
        }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.error || "Failed to create task");
      }

      // success
      navigate("/Home");
    } catch (err) {
      alert(err.message);
      console.error("Error creating task:", err);
      
      // If task creation fails after payment, refund the amount
      if (["medium", "hard"].includes(mode)) {
        await processPayment(-Number(deposit)); // Negative amount for refund
      }
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
                  onChange={handleTitleChange}
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
                    setDeposit("");
                  }}
                >
                  <option value="easy">Easy (no deposit)</option>
                  <option value="medium">Medium (refund if quit)</option>
                  <option value="hard">Hard (forfeit if quit)</option>
                </select>
              </div>

              {/* ---- Deposit – only for Medium/Hard ----------------------- */}
              {["medium", "hard"].includes(mode) && (
                <>
                  <div className="question-column">
                    <label htmlFor="deposit">Deposit ($):</label>
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
                    <div className="balance-info">
                      Your current balance: ${balance.toFixed(2)}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ---- Actions -------------------------------------------------- */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-button"
                disabled={processingPayment}
              >
                {processingPayment ? "Processing..." : "Create task"}
              </button>
              <button
                type="button"
                className="submit-button"
                onClick={() => navigate("/Home")}
              >
                Cancel
              </button>
            </div>

            {/* ---- Payment Info -------------------------------------------- */}
            {["medium", "hard"].includes(mode) && deposit > 0 && (
              <div className="payment-info">
                <p>
                  <strong>Payment Terms:</strong><br />
                  {mode === "medium" 
                    ? "You'll get your deposit back if you quit early or complete the goal."
                    : "You'll get your deposit back only if you complete the goal. Quitting means forfeiting the deposit."}
                </p>
              </div>
            )}

            {/* ---- AI SUGGESTIONS SECTION --------------------------------- */}
            <div className="ai-suggestions-box">
              {loadingSuggestions && <p>AI is thinking…</p>}
              {aiSuggestions && (
                <div className="ai-suggestion-bubble">
                  <strong>AI Suggestion:</strong> {aiSuggestions}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default TaskCreate;