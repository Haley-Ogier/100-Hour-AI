import React, { useState, useEffect, useRef } from 'react';
import './SignIn.css';

function SignIn() {

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Signing in with:', formData);
    };

    return(
        <>
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
        </>
    );
}

export default SignIn