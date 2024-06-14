import React from 'react';

const Home = () => {

    const login = async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const messageElement = document.getElementById('message');

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            messageElement.textContent = `Successfully logged in as: ${username}`;
            console.log('Username:', username);
            console.log('Token:', data.token);
            localStorage.setItem('username', username);
            localStorage.setItem('token', data.token);
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

    const logout = () => {
        const messageElement = document.getElementById('message');
        const username = localStorage.getItem('username');
        if (username) {
            messageElement.textContent = `Successfully logged out`;
        } else {
            messageElement.textContent = 'Already logged out';
        }
    
        localStorage.removeItem('token');
        localStorage.removeItem('username');

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
                    <button className="custom-button" type="button" onClick={login}>Login</button><br/>
                    <button className="custom-button" type="button" onClick={logout}>Logout</button>
                </form>

                <p id="message" style={{ color: 'blue', fontSize: '16px', fontWeight: 'bold' }}></p>
            </div>
        </>
    );
};

export default Home;
