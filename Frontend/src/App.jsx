import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Homepage";
import CreateTaskPage from "./pages/TaskCreate";
import SignIn from "./pages/SignIn";
import AISupport from "./pages/AISupport";
import Account from "./pages/Account";
import EditAccount from "./pages/EditAccount";
import NewPassword from "./pages/NewPassword";
import Signup from "./pages/SignUp";
import LandingPage from "./pages/LandingPage";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignUp" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/create-task" element={<ProtectedRoute><CreateTaskPage /></ProtectedRoute>} />
          <Route path="/Support" element={<ProtectedRoute><AISupport /></ProtectedRoute>} />
          <Route path="/Account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/EditAccount" element={<ProtectedRoute><EditAccount /></ProtectedRoute>} />
          <Route path="/NewPassword" element={<ProtectedRoute><NewPassword /></ProtectedRoute>} />
          <Route path="/Home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
