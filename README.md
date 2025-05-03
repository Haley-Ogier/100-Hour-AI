### **1.1 Overview**

**Project Description & Objectives**

Our project is an **AI Coaching App** designed to help users effectively **set and achieve goals** by leveraging proven habit-formation science and personalized AI-driven recommendations. Instead of letting social media distractions dominate attention, we introduce a system that **gamifies goal achievement** with features like monetary deposits for accountability, streak tracking, and AI-based task breakdown.

**Intended Audience**

- Students, professionals, or hobbyists aiming to **build consistent habits** or complete specific goals (e.g., finishing a course, writing a book, developing a new skill).
- Anyone who struggles with **procrastination** or **distractions** and wants a **structured**, AI-assisted approach to stay on track.

**Primary Goals & Motivations**

1. **Create a More Compelling Alternative** to social media by making **goal pursuit “addictive”** in a positive sense.
2. **Leverage Theories Like Atomic Habits & Deep Work** to ensure users form **tiny, consistent improvements** and **focused work blocks**.
3. **Encourage Accountability & Engagement** through **financial stakes** (loss aversion) and community support.

# Getting Started

This guide shows you how to set up and run **both** the React frontend and the Express backend for the AI Coaching App.

---

## 1  Clone the Repository

```bash
git clone https://github.com/Haley-Ogier/100-Hour-AI.git
cd your-repo-name

2 Install Dependencies
2.1 Frontend (React)
cd Frontend        
npm install

2.2 Backend (Express)
cd ../Backend     
npm install

3 Environment Variables
The backend needs a .env file (API keys, DB credentials, etc.).
Contact me @sasanchez@umass.edu to obtain it, then place it in your backend folder:
Backend/.env

4 Running the Project
You’ll need two terminals—one for the React app and one for the Express server.

4.1 Start the React App
cd Frontend        
npm start

4.2 Start the Express Server
cd Backend        # open a new terminal first
node server.js

5 Testing the App
Confirm both servers are running.

Visit http://localhost:3000 in your browser.

Interact with the UI—network calls should hit the backend on port 4000 (or the port in .env).

6 Project Flow
Layer	Responsibilities
React Frontend	UI, routing, user input
Express Backend	AI logic, habit & streak tracking, deposit handling

7 Need Help?
Problems or questions? Reach out to me.

You can also open an issue in this repo if it’s on GitHub.

Happy goal-setting!
