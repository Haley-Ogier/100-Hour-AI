import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import Logo from "../images/Logo.svg";
import { AuthContext } from "../context/AuthContext";

function NavBar() {
  const { isAuthenticated, signOut } = useContext(AuthContext);

  return (
    <header className="header-nav">
      <div className="nav-left">
        <Link to="/Home">
          <img src={Logo} alt="100HourAILogo" />
        </Link>
      </div>
      <div className="nav-right">
        {isAuthenticated && (
          <>
            <Link to="/Account" className="nav-btn">Profile</Link>
            <Link to="/Support" className="nav-btn">AI Coaching</Link>
            <Link to="/create-task" className="nav-btn">Create Task</Link>
            <button className="important-btn" onClick={signOut}>Sign Out</button>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Link to="/SignIn" className="important-btn">Sign In</Link>
            <Link to="/SignUp" className="important-btn">Create New Account</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default NavBar;
