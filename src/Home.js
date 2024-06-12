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
            // You can save the token in localStorage or cookies for later use
            localStorage.setItem('token', data.token);
        } else {
            messageElement.textContent = data.message;
        }
    };

    return (
        <>
            <div className="center">
                <h1><u>HosTalky</u></h1>
                <h3>Re-defining healthcare communications</h3>
                <form id="loginForm">
                    <label htmlFor="username">Username: </label>
                    <input type="text" id="username" name="username"/><br/><br/>
                    <label htmlFor="password">Password: </label>
                    <input type="password" id="password" name="password"/><br/><br/>
                    <button type="button" onClick={login}>Login</button>
                </form>

                <p id="message"></p>
            </div>
        </>
    );
};

export default Home;



