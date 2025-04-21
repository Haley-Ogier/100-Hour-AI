import React, { useState, useContext } from 'react';
import './SignIn.css';
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

function SignIn() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // For now this just simulates a successful login.
    console.log('Signing in with:', formData);

    // ✅ Mark the user as authenticated
    signIn();

    // ✅ Redirect to a protected route
    navigate('/Home');
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
          
          <button type="submit" className="signin-btn">Sign In</button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
