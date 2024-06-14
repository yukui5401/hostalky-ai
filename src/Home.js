import React, { useState, useEffect } from "react";

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [username, setUsername] = useState(localStorage.getItem('username') || null);

    useEffect(() => {
        if (isLoggedIn) {
            setUsername(localStorage.getItem('username'));
        } else {
            setUsername(null);
        }
    }, [isLoggedIn]);

    const handleLogin = async () => {
        const usernameInput = document.getElementById('username');
        const password = document.getElementById('password');
        const messageElement = document.getElementById('message');

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: usernameInput.value,
                password: password.value,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            password.value = "";
            messageElement.textContent = `Successfully logged in as: ${usernameInput.value}`;
            console.log('Username:', usernameInput.value);
            console.log('Token:', data.token);
            localStorage.setItem('username', usernameInput.value);
            localStorage.setItem('token', data.token);
            setIsLoggedIn(true);
        } else {
            messageElement.textContent = data.message;
        }
        // testing code
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`${key}: ${value}`);
        }
    };

    const handleLogout = () => {
        const usernameElement = document.getElementById('username');
        const passwordElement = document.getElementById('password');
        const messageElement = document.getElementById('message');
        const token = localStorage.getItem('token');
        if (token) {
            usernameElement.value = "";
            passwordElement.value = "";
            messageElement.textContent = `Successfully logged out`;
        }
    
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        // testing code
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`${key}: ${value}`);
        }
    };
    
    return (
        <>
            <div className="center">
                <h1><u>HosTalky</u></h1>
                <h3>Re-defining healthcare communications</h3>
                <form id="loginForm">
                    <input className="custom-textfield" type="text" id="username" name="username" placeholder='Username'/><br/>
                    <input className="custom-textfield" type="password" id="password" name="password" placeholder='Password'/><br/><br/>
                    {isLoggedIn ? (
                        <button className="custom-button" type="button" onClick={handleLogout}>Logout</button>
                    ) : (
                        <button className="custom-button" type="button" onClick={handleLogin}>Login</button>
                    )}
                </form>
                <p style={{fontSize: '20px'}}>{username ? `Logged in as: ${username}` : 'Not logged in'}</p>
                <p id="message" style={{ color: 'blue', fontSize: '16px', fontWeight: 'bold' }}></p>

            </div>
        </>
    );
};

export default Home;
