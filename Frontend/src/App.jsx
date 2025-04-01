import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import CreateTaskPage from "./pages/TaskCreate";
import SignIn from "./pages/SignIn";
import AISupport from "./pages/AISupport";
import Account from "./pages/Account";
import Signup from "./pages/SignUp";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-task" element={<CreateTaskPage />} />
        <Route path="/SignUp" element={<Signup />} />
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/Support" element={<AISupport />} />
        <Route path="/Account" element={<Account />} />
      </Routes>
    </Router>
  );
}

export default App;
