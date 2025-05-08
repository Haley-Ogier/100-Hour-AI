import React, { useState, useEffect, useRef } from 'react';
import './Account.css';
import NavBar from './NavBar';
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

const SERVER_URL = "http://localhost:4000";

const sampleData = {
    username: "Username",
    email: "username@example.com",
    joinDate: "January 1, 2025",
    tagline: "Here is my tagline"
};

function formatDate(dateString) {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

function Account() {

    const { isAuthenticated, curAccount } = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [email, setEmail]       = useState("");
    const [joinDate, setJoinDate] = useState("");

    const fetchAcc = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/api/account`);
            const data = await res.json();
            for (var i = 0; i < data.length; i++) {
              if (data[i].username == curAccount) {
                setUsername(data[i].username);
                setEmail(data[i].email);
                setJoinDate(formatDate(data[i].createdAt));
              }
            }
          } catch (err) {
            alert(err.message);
            console.error("Error getting account info:", err);
          }
    }

    useEffect(() => {
        fetchAcc();
    }, []);

    return (
        <>
            <NavBar />
            <div className='account-page'>
                <div className="account-header">
                    <h1 className='account-title'>Welcome, {username}!</h1>
                    <p className="account-subtitle">{sampleData.tagline}</p>
                </div>

                <div className="account-content">
                    <section className="account-section account-info">
                        <h2 className="section-title">Account Information</h2>
                        <div className="account-info">
                            <div className="detail-row">
                                <span className="detail-key">Username:</span>
                                <span className="detail-value">{username}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-key">Email:</span>
                                <span className="detail-value">{email}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-key">Member Since:</span>
                                <span className="detail-value">{joinDate}</span>
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