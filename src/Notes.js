import { Outlet, Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import ViewNotes from "./ViewNotes";


const Notes = () => {
    const location = useLocation();
    const isViewNotesRoute = location.pathname === "/notes/view_notes";
    
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    useEffect(() => {
        const btnStart = document.querySelector('button[name="record"]');
        const btnStop = document.querySelector('button[name="stop"]');
        const audio = document.querySelector('#audio');

        if (!btnStart || !btnStop || !audio) {
            console.error('One or more of btnStart, btnStop, audio are not found in DOM');
            return;
        }

        const handleStartClick = async () => {
            try {
                let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                let mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();

                let chunks = [];
                mediaRecorder.ondataavailable = (e) => {
                    chunks.push(e.data);
                };

                mediaRecorder.onerror = (e) => {
                    alert(e.error);
                };

                mediaRecorder.onstop = async () => {
                    let blob = new Blob(chunks, { 'type': 'audio/mpeg; codecs=mp3' });
                    // options:
                    // audio/ogg; codecs=opus
                    // audio/mpeg; codecs=mp3
                    // audio/wav; codecs=pcm

                    // Call uploadAudio to send the recorded audio to the backend
                    await uploadAudio(blob);

                    // Set the src attribute of the audio element for local playback
                    let url = URL.createObjectURL(blob);
                    audio.src = url;
                };

                btnStop.addEventListener('click', () => {
                    mediaRecorder.stop();
                });
            } catch (err) {
                console.error('Error accessing media devices.', err);
            }
        };

        const uploadAudio = async (audioBlob) => {
            try {
                const formData = new FormData();
                formData.append('audio', audioBlob);

                const response = await fetch('/record', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const responseData = await response.json();
                    setData(responseData);
                    console.log('Audio uploaded successfully');
                } else {
                    console.error('Failed to upload audio');
                }
            } catch (error) {
                console.error('Error uploading audio:', error);
            }
        };

        btnStart.addEventListener('click', handleStartClick);

        // Cleanup event listeners on component unmount
        return () => {
            btnStart.removeEventListener('click', handleStartClick);
        };
    }, []);



    // useState for storing and using data
    const [data, setData] = useState({
        title: "",
        summary: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("/notes", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            const responseData = await response.json();
            setData(responseData);
            console.log("It worked");
        } else {
            console.error("Failed to submit");
        }
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        const response = await fetch("/notes", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            const messageElement = document.getElementById('message');
            messageElement.textContent = `Successfully saved to: ${username}'s Notes`;
            const responseData = await response.json();
            setData(responseData);
            console.log("It worked");
        } else {
            console.error("Failed to submit");
        }
    };


    return (
        <>
        {isViewNotesRoute ? (
            <ViewNotes token={token} username={username} />
        ) : (
            <div className="center">
                <h2>Personal Notes</h2>

                {/* record audio */}
                <audio id="audio" controls></audio>
                <br></br>
                <button name="record">Record</button> &emsp;
                <button name="stop">Stop</button>
                <hr></hr>

                {/* submit form */}
                <form onSubmit={handleSubmit}>
                    <textarea
                        type="text"
                        name="title"
                        value={data.title}
                        onChange={handleChange}
                        placeholder="Title"
                        cols="60"
                        required
                    />
                    <br />
                    <textarea
                        name="summary"
                        value={data.summary}
                        onChange={handleChange}
                        placeholder="Description"
                        cols="80"
                        rows="10"
                        required
                    />
                    <br />
                    <button type="submit">Summarize</button><br/>
                </form>

                <div className="styled-content">
                    <h3 className={!data.title ? "placeholder" : ""}>{data.title || "Title"}</h3>
                    <p className={!data.summary ? "placeholder" : ""}>{data.summary || "Description"}</p>
                </div>
                <button type="button" onClick={handleSave}>Save & Submit</button>
                <p id="message" style={{ color: 'blue', fontSize: '16px', fontWeight: 'bold' }}></p>

                <br />
                <nav>
                    <Link to="view_notes">View Notes</Link>
                </nav>
            </div>
        )}
        </>
    )
};
  
export default Notes;

