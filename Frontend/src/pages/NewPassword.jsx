import React, { useState, useEffect, useContext } from 'react';
import './NewPassword.css';
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const SERVER_URL = "http://localhost:4000";

function ChangePassword() {
  const navigate = useNavigate();
  const { curAccount } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [username, setUsername] = useState("");
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setUsername(curAccount);
  }, []);

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

    // Tries to change the password
    try {

        // Make sure password fits the requirements
        if (formData.newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return
        }
        if (formData.newPassword.length > 16) {
            setError("Password must be at most 16 characters");
            return
        }
        if (!format.test(formData.newPassword) && 
            !containsUppercase(formData.newPassword) &&
            !containsNumber(formData.newPassword)) {
            setError("Password requires capitalized letter, special character, and number");
            return
        }
        if (!containsUppercase(formData.newPassword) &&
            !containsNumber(formData.newPassword)) {
            setError("Password requires capitalized letter and number");
            return
        }
        if (!format.test(formData.newPassword) && 
            !containsNumber(formData.newPassword)) {
            setError("Password requires special character and number");
            return
        }
        if (!format.test(formData.newPassword) && 
            !containsUppercase(formData.newPassword)) {
            setError("Password requires capitalized letter and special character");
            return
        }
        if (!format.test(formData.newPassword)) {
            setError("Password requires special character");
            return;
        }
        if (!containsUppercase(formData.newPassword)) {
            setError("Password requires capitalized letter");
            return;
        }
        if (!containsNumber(formData.newPassword)) {
            setError("Password requires number");
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const res = await fetch(`${SERVER_URL}/api/account/${curAccount}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                username: username,
                password: formData.newPassword 
            }),
        });

        if (!res.ok) {
            const msg = await res.json().catch(() => null);
            throw new Error(msg?.error || "Failed to change password");
        }
        
        navigate('/Home'); // Redirect to home

    } catch (err) {
      alert(err.message);
      console.error("Error changing password:", err);
    }
  };

  return (
    <div className="password-page">
      <div className="password-container">
        <h2>Change Password:</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input 
              id="newPassword" 
              name="newPassword"
              type="password"
              value={formData.newPassword} 
              onChange={handleChange} 
              required
            />
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
          
          <button type="submit" className="password-btn">Change Password</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;