import React, { useState, useEffect } from 'react';
import './Account.css';
import NavBar from './NavBar';
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { useNavigate } from 'react-router-dom';

const SERVER_URL = "http://localhost:4000";

// const sampleData = {
//      username: "Username",
//      email: "username@example.com",
//      joinDate: "January 1, 2025",
//      tagline: "Here is my tagline"
// };

function formatDate(dateString) {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

function Account() {

    const navigate = useNavigate();

    const { curAccount, signOut } = useContext(AuthContext);

    const [username, setUsername] = useState("");
    const [email, setEmail]       = useState("");
    const [tagline, setTagline]   = useState("");
    const [joinDate, setJoinDate] = useState("");
    const [balance, setBalance]   = useState(0);

    const fetchAcc = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/api/account`);
            const data = await res.json();
            for (var i = 0; i < data.length; i++) {
              if (data[i].userid === curAccount) {
                setUsername(data[i].username);
                setEmail(data[i].email);
                setTagline(data[i].tagline);
                setJoinDate(formatDate(data[i].createdAt));
                setBalance(data[i].balance);
              }
            }
          } catch (err) {
            alert(err.message);
            console.error("Error getting account info:", err);
          }
    }

    useEffect(() => {
        fetchAcc();
    });

    const handlePassword = () => {
        navigate('/NewPassword');
    }

    const handleEdit = () => {
        navigate('/EditAccount');
    }

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete your account?") == true) {
            // ---- Delete all tasks tied to account ---- //
            try {
                const res = await fetch(`${SERVER_URL}/api/tasks/${curAccount}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        userid: curAccount
                    }),
                });
                if (!res.ok) {
                    const msg = await res.json().catch(() => null);
                    throw new Error(msg?.error || "Failed to remove all tasks");
                }
            } catch(err) {
                alert(err.message);
                console.error("Error deleting tasks:", err);
            }
            try {
                const res = await fetch(`${SERVER_URL}/api/account/${curAccount}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        userid: curAccount
                    }),
                });
                if (!res.ok) {
                    const msg = await res.json().catch(() => null);
                    throw new Error(msg?.error || "Failed to remove account");
                }
            } catch(err) {
                alert(err.message);
                console.error("Error deleting account:", err);
            }

            signOut();
        }
        else {
            // Nothing Happens
        }
    }

    return (
        <>
            <NavBar />
            <div className='account-page'>
                <div className="account-header">
                    <h1 className='account-title'>Welcome, {username}!</h1>
                    <p className="account-subtitle">{tagline}</p>
                </div>

                <div className="account-content">
                    <section className="account-section account-section">
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
                                <span className="detail-key">Balance:</span>
                                <span className="detail-value">${balance}</span>
                            </div>
                            <div className="detail-bottom-row">
                                <span className="detail-key">Member Since:</span>
                                <span className="detail-value">{joinDate}</span>
                            </div>
                        </div>
                    </section>

                    <section className="account-section settings-section">
                        <h2 className="section-title">Account Settings</h2>
                        <div className="settings-options">
                        <button className="settings-button" onClick={handleEdit}>
                                Edit Profile
                            </button>
                            <button className="settings-button" onClick={handlePassword}>
                                Change Password
                            </button>
                            <button className="settings-button" onClick={signOut}>
                                Logout
                            </button>
                            <button className="settings-button danger" onClick={handleDelete}>
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