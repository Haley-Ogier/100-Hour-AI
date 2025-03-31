import React, { useState, useEffect, useRef } from 'react';
import './AISupport.css';
import NavBar from './NavBar';

function AISupport() {
    return(
        <>
            <NavBar />
            <div className='AI-support-page'>
                <div className='sidebar'>
                    <h1 className='support-title'>AI Support</h1>
                </div>
                <div className='chat-history'></div>
                <div className='chat-form-container'>
                    <form className='chat-form'>
                        <input type="text" placeholder='Start talking to the AI!' /><br></br>
                    </form>
                </div>
            </div>
        </>
    );
}

export default AISupport