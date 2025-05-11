import React, { useState, useContext } from 'react';
import './SignUp.css';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = "http://localhost:4000";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Variable and functions for making sure password meets the requirements
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  function containsUppercase(str) {
    return /[A-Z]/.test(str);
  }
  function containsNumber(str) {
    return /[0-9]/.test(str);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email ends with one of the following
    // (Chris - My personal email end with .me which is why I included it,
    // despite it being unusual)
    if (!formData.email.endsWith(".com") &&
        !formData.email.endsWith(".edu") &&
        !formData.email.endsWith(".org") &&
        !formData.email.endsWith(".gov") &&
        !formData.email.endsWith(".me")) {
      setError("Not a valid email");
      return
    }

    // Make sure password fits the requirements
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return
    }
    if (formData.password.length > 16) {
      setError("Password must be at most 16 characters");
      return
    }
    if (!format.test(formData.password) && 
        !containsUppercase(formData.password) &&
        !containsNumber(formData.password)) {
      setError("Password requires capitalized letter, special character, and number");
      return
    }
    if (!containsUppercase(formData.password) &&
        !containsNumber(formData.password)) {
      setError("Password requires capitalized letter and number");
      return
    }
    if (!format.test(formData.password) && 
        !containsNumber(formData.password)) {
      setError("Password requires special character and number");
      return
    }
    if (!format.test(formData.password) && 
        !containsUppercase(formData.password)) {
      setError("Password requires capitalized letter and special character");
      return
    }
    if (!format.test(formData.password)) {
      setError("Password requires special character");
      return;
    }
    if (!containsUppercase(formData.password)) {
      setError("Password requires capitalized letter");
      return;
    }
    if (!containsNumber(formData.password)) {
      setError("Password requires number");
      return;
    }

    // Validate that the password matches
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check that an account isn't already using the username or password
    try {
      const res = await fetch(`${SERVER_URL}/api/account`);
      const data = await res.json();
      for (var i = 0; i < data.length; i++) {
        if (data[i].username === formData.username || data[i].password === formData.password) {
          setError("Username and/or password is already taken!");
          return;
        }

      }

    } catch (err) {
      alert(err.message);
      console.error("Error logging in:", err);
    }

    // Create an account and add it to the database
    try {
      const res = await fetch(`${SERVER_URL}/api/account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.error || "Failed to create account");
      }
      // ✅ Simulate successful signup
      // signIn(formData.username); // Mark user as signed in

      // navigate('/Home'); // Redirect to home

    } catch (err) {
      alert(err.message);
      console.error("Error creating account:", err);
    }

    try {
      const res = await fetch(`${SERVER_URL}/api/account`);
      const data = await res.json();
      for (var i = 0; i < data.length; i++) {
        if (data[i].username == formData.username) {
          console.log('Signing up with:', formData);
          signIn(data[i].userid);
          navigate('/Home');
        }
      }
    } catch (err) {
      alert(err.message);
      console.error("Error creating account:", err);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              id="username" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="requirements">
          <label htmlFor="ask">Your password must be 8-16 characters long, and include a capitalized letter (A-Z), special character (!, @, etc.), and a number (0-9)</label>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="signup-btn">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
