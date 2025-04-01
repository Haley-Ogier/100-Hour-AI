import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import Logo from "../logo.svg"

function NavBar() {
  return (
    <header className="header-nav">
      <div className="nav-left">
        <Link to="/">
        <img src={Logo} alt="100HourAILogo" />
        </Link>
      </div>
      <div className="nav-right">
        <Link to="/Account" className="nav-btn">
          Profile
        </Link>
        <Link to="/Support" className="nav-btn">
          AI Coaching
        </Link>
        <Link to="/create-task" className="nav-btn">
          Create Task
        </Link>
        <Link to="/SignIn" className="nav-btn">
          Sign In
        </Link>
        <Link to="/SignUp" className="nav-btn">
          Create New Account
        </Link>
      </div>
    </header>
  );
}

export default NavBar;
