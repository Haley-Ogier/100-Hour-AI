import React, { useState, useEffect, useRef } from 'react';
import './SignIn.css';
import NavBar from './NavBar';

function SignIn() {
    return(
        <>
            <NavBar />
            <div className='Sign-in-page'>
                <h1 className='Sign-in-title'>Please Sign In:</h1>
                <div className='form-container'>
                    <form className='sign-in-form'>
                        <input type="text" placeholder='Enter username' className="username-and-password" required /><br></br>
                        <input type="password" placeholder='Enter password' className="username-and-password" required/>
                        <button type="submit">Sign In</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default SignIn