import React, { useState, useRef, useEffect } from 'react';
import './AISupport.css';
import NavBar from './NavBar';
import { v4 as uuid } from 'uuid';           // npm i uuid  (frontend)

export default function AISupport() {
  /* ---------- state ---------- */
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('ai_convos');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentId, setCurrentId] = useState(() =>
    conversations[0]?.id ?? null
  );
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  /* ---------- helpers ---------- */
  const currentConvo = conversations.find(c => c.id === currentId);

  function persist(convos) {
    localStorage.setItem('ai_convos', JSON.stringify(convos));
    setConversations(convos);
  }

  function startNewChat() {
    const newId   = uuid();
    const newChat = { id: newId, title: 'New Chat', messages: [] };
    persist([newChat, ...conversations]);
    setCurrentId(newId);
  }

  // New function to delete a chat
  function deleteChat(chatId) {
    // Filter out the chat to be deleted
    const updated = conversations.filter(c => c.id !== chatId);

    // Persist changes
    persist(updated);

    // If the deleted chat was the currently selected chat, reset currentId
    if (chatId === currentId && updated.length > 0) {
      setCurrentId(updated[0].id);
    } else if (updated.length === 0) {
      // No chats left
      setCurrentId(null);
    }
  }

  /* ---------- send prompt ---------- */
  async function handleSubmit(e) {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt || !currentConvo) return;

    // optimistic UI
    const updated = conversations.map(c =>
      c.id === currentId
        ? {
            ...c,
            title: c.messages[0]?.text ?? prompt, // first user msg becomes title
            messages: [...c.messages, { from: 'user', text: prompt }]
          }
        : c
    );
    persist(updated);
    setInput('');
    setLoading(true);

    try {
      const res  = await fetch('/api/generate', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ prompt })
      });
      const data = await res.json();

      const done = updated.map(c =>
        c.id === currentId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { from: 'ai', text: data.result }
              ]
            }
          : c
      );
      persist(done);
    } catch (err) {
      const errd = updated.map(c =>
        c.id === currentId
          ? {
              ...c,
              messages: [
                ...c.messages,
                { from: 'ai', text: '❌ Error contacting AI.' }
              ]
            }
          : c
      );
      persist(errd);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* ---------- auto-scroll ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConvo, loading]);

  /* ---------- JSX ---------- */
  return (
    <>
      <NavBar />
      <div className="AI-support-page">
        {/* -------- sidebar list -------- */}
        <div className="sidebar">
          <h1 className="support-title">AI Support</h1>
          <button className="new-chat-btn" onClick={startNewChat}>
            + New Chat
          </button>
          <ul className="chat-list">
            {conversations.map(c => (
              <li
                key={c.id}
                className={c.id === currentId ? 'active' : ''}
              >
                {/* When you click on chat title, set it as currentId */}
                <span onClick={() => setCurrentId(c.id)}>
                  {c.title}
                </span>
                {/* Delete button */}
                <button
                  className="delete-chat-btn"
                  onClick={() => deleteChat(c.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* -------- chat history -------- */}
        <div className="chat-history">
          {currentConvo?.messages.map((m, i) => (
            <div
              key={i}
              className={`chat-bubble ${m.from === 'user' ? 'user-bubble' : 'ai-bubble'}`}
            >
              {m.text}
            </div>
          ))}
          {loading && <div className="chat-bubble ai-bubble">Thinking…</div>}
          <div ref={bottomRef} />
        </div>

        {/* -------- input bar -------- */}
        {currentConvo && (
          <div className="chat-form-container">
            <form className="chat-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Start talking to the AI!"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
            </form>
          </div>
        )}
      </div>
    </>
  );
}
