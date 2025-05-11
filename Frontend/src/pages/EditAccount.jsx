import React, { useState, useEffect } from 'react';
import './EditAccount.css';
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

function EditAccount() {

    const navigate = useNavigate();

    const { curAccount, signIn, signOut } = useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [tagline, setTagline] = useState("");

    const fetchAcc = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/api/account`);
            const data = await res.json();
            for (var i = 0; i < data.length; i++) {
              if (data[i].userid === curAccount) {
                setUsername(data[i].username);
                setPassword(data[i].password);
                setTagline(data[i].tagline);
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

    const [formData, setFormData] = useState({
        username: '',
        tagline: '',
    });

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch(`${SERVER_URL}/api/account/${curAccount}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    userid: curAccount,
                    username: formData.username,
                    password: password,
                    tagline: formData.tagline
                }),
            });
            if (!res.ok) {
                const msg = await res.json().catch(() => null);
                throw new Error(msg?.error || "Failed to edit account");
            }
        } catch(err) {
            alert(err.message);
            console.error("Error editing account:", err);
        }

        try {
            const res = await fetch(`${SERVER_URL}/api/account`);
            const data = await res.json();
            for (var i = 0; i < data.length; i++) {
              if (data[i].username == formData.username) {
                console.log('Signing up with:', formData.username);
                for (var i = 0; i < data.length; i++) {
                  if (data[i].username == formData.username) {
                    await signOut();

                    await signIn(data[i].userid);

                    navigate('/Account');

                    alert("Account information changed successfully!");
                  }
                }
              }
            }
        } catch (err) {
            alert(err.message);
            console.error("Error editing account:", err);
        }
    }

    return (
        <>
            <NavBar />
            <div className='edit-account-page'>
                <div className="edit-account-header">
                    <h1 className='edit-account-title'>Edit Account Info:</h1>
                </div>

                <div className="edit-account-content">
                        <div className="edit-account-info">
                            <div className="edit-detail-row">
                                <span className="edit-detail-key">Username:</span>
                                <input 
                                    className="edit-detail-username"
                                    id="username" 
                                    name="username"
                                    defaultValue={username}
                                    onLoad={handleChange}
                                    onChange={handleChange} 
                                    required
                                />
                            </div>
                            <div className="edit-detail-row">
                                <span className="edit-detail-key">Tagline:</span>
                                <input
                                    className="edit-detail-tagline"
                                    id="tagline"
                                    name="tagline"
                                    defaultValue={tagline}
                                    onLoad={handleChange}
                                    onChange={handleChange}
                                />
                            </div>
                            <button className="save-profile-button" onClick={handleSubmit}>Save Profile</button>
                        </div>
                </div>
            </div>
        </>
    );
}

export default EditAccount;