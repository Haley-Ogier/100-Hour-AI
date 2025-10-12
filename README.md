# 100-Hour AI Goal Coach

## Overview
The **100-Hour AI Goal Coach** is an interactive goal-setting and coaching web application designed to make personal growth engaging, structured, and motivating. It combines habit science, accountability mechanisms, and AI-powered assistance to help users set, track, and achieve their goals.

---

## Features

### 🎯 Interactive Homepage
- Displays **daily streaks** and **personal bests** to keep motivation high.  
- Provides a **timeline view** of tasks, short-term goals, and long-term goals with their deadlines.  
- Past-due items are **highlighted in red** with a warning symbol for quick visibility.  
- Different symbols clearly distinguish **tasks**, **short-term goals**, and **long-term goals**.  

### ✅ Goal Completion & Progress
- Marking a goal as complete triggers a **celebratory confetti animation**.  
- Completed items are hidden for focus but can be expanded in the **“Past” view** to reflect on accomplishments.  

### 💰 Accountability System
- Users choose a difficulty level when creating a goal:  
  - **Easy**: No deposit required.  
  - **Medium**: Deposit refunded upon completion or if the goal is quit.  
  - **Hard**: Deposit is only refunded upon completion (no refund if forfeited).  
- This monetary system encourages accountability and commitment.  

### 🤖 AI Integration
- An **AI assistant** helps break down large goals into smaller, actionable steps.  
- Provides **motivation, encouragement, and guidance** to refine goals.  
- A dedicated **AI support page** allows users to chat for motivation, habit advice, and goal-related questions.  
- Supports **multiple AI chat threads** so users can organize different conversations.  

### 👤 Profile & Settings
- Profile page displays **deposit balances** and account information.  
- Allows users to manage their **personal settings**.  

---

## Tech Stack
- **Frontend**: React, HTML, CSS  
- **Backend**: Node.js, Express  
- **AI Assistant**: Integrated through external API (API key not included in repo)  

---

## Project Goal
The mission of the **100-Hour AI Goal Coach** is to create a tool that helps people achieve their ambitions through gamification, accountability, and AI-driven support. It is designed to provide structure, motivation, and personalized guidance while remaining simple and enjoyable to use.

# Getting Started

This guide shows you how to set up and run **both** the React frontend and the Express backend for the AI Coaching App.

## 1)  Clone the Repository

```bash
git clone https://github.com/Haley-Ogier/100-Hour-AI.git
cd "100-Hour-AI"

```
## 2) Install Dependencies
### 2.1 Frontend (React)
```bash
cd Frontend        
npm install
```

### 2.2 Backend (Express)
```bash
cd ../Backend     
npm install
```

## 3) Running the Project
You’ll need two terminals—one for the React app and one for the Express server.

### 3.1 Start the React App
```bash
cd Frontend        
npm start
```
### 3.2 Start the Express Server
```bash
cd Backend        # open a new terminal first
node server.js
```

## 4) Testing the App
Confirm both servers are running.

Visit http://localhost:3000 in your browser.

Interact with the UI—network calls should hit the backend on port 4000 (or the port in .env).

## 5) Project Flow
Layer	Responsibilities
React Frontend	UI, routing, user input
Express Backend	AI logic, habit & streak tracking, deposit handling

## 6 Need Help?
Problems or questions? Reach out to me.

You can also open an issue in this repo if it’s on GitHub.

Happy goal-setting!
