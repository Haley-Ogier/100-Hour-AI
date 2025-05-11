import React, { useState, useContext } from 'react';
import './SignIn.css';
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const SERVER_URL = "http://localhost:4000";

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const { signIn } = useContext(AuthContext);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Checks the database for an account with the entered username and password
    try {
      const res = await fetch(`${SERVER_URL}/api/account`);
      const data = await res.json();
      for (var i = 0; i < data.length; i++) {
        if (data[i].username === formData.username && data[i].password === formData.password) {
          // For now this just simulates a successful login.
          console.log('Signing in with:', formData);

          // ✅ Mark the user as authenticated
          signIn(data[i].userid);

          // ✅ Redirect to a protected route
          navigate('/Home');
        }

      }

      // If entered information isn't tied to an account or is incorrect
      setError("Username and/or password is incorrect");
      return

    } catch (err) {
      alert(err.message);
      console.error("Error logging in:", err);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <h2>Sign In:</h2>
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

          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="signin-btn">Sign In</button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
