import React, { useState, useEffect, useRef } from 'react';
import './Account.css';
import NavBar from './NavBar';

const sampleData = {
    username: "Username",
    email: "username@example.com",
    joinDate: "January 1, 2025",
    tagline: "Here is my tagline"
};

function Account() {
    return (
        <>
            <NavBar />
            <div className='account-page'>
                <div className="account-header">
                    <h1 className='account-title'>Welcome, {sampleData.username}!</h1>
                    <p className="account-subtitle">{sampleData.tagline}</p>
                </div>

                <div className="account-content">
                    <section className="account-section account-info">
                        <h2 className="section-title">Account Information</h2>
                        <div className="account-info">
                            <div className="detail-row">
                                <span className="detail-key">Username:</span>
                                <span className="detail-value">{sampleData.username}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-key">Email:</span>
                                <span className="detail-value">{sampleData.email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-key">Member Since:</span>
                                <span className="detail-value">{sampleData.joinDate}</span>
                            </div>
                            <button className="edit-profile-button">Edit Profile</button>
                        </div>
                    </section>

                    <section className="account-section settings-section">
                        <h2 className="section-title">Account Settings</h2>
                        <div className="settings-options">
                            <button className="settings-button">
                                Change Password
                            </button>
                            <button className="settings-button">
                                Preferences
                            </button>
                            <button className="settings-button">
                                Logout
                            </button>
                            <button className="settings-button danger">
                                Delete Account
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

export default Account;