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
            messageElement.textContent = 'Login successful!';
            console.log('Token:', data.token);
            localStorage.setItem('token', data.token);
        } else {
            messageElement.textContent = data.message;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
    };

    return (
        <>
            <div className="center">
                <h1><u>HosTalky</u></h1>
                <h3>Re-defining healthcare communications</h3>
                <form id="loginForm">
                    <input type="text" id="username" name="username" placeholder='Username'/><br/>
                    <input type="password" id="password" name="password" placeholder='Password'/><br/><br/>
                    <button type="button" onClick={login}>Login</button><br/>
                    <button type="button" onClick={logout}>Logout</button>
                </form>

                <p id="message"></p>
            </div>
        </>
    );
};

export default Home;
