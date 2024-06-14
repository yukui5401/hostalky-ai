import { Outlet, Link, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";
import ViewAnnounce from "./ViewAnnounce";

const Announce = () => {
    const location = useLocation();
    const isViewAnnounceRoute = location.pathname === "/announce/view_announce";

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    const [isRecording, setIsRecording] = useState(false);

    const [selected, setSelected] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [data, setData] = useState({
        id_list: "",
        title: "",
        summary: "",
    });

    useEffect(() => {
        const fetchRecipients = async () => {
            try {
                const response = await fetch('/recipients');
                const data = await response.json();
                setRecipients(data);
            } catch (error) {
                console.error('Error fetching recipients:', error);
            }
        };

        fetchRecipients();
    }, []);

    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            id_list: selected,
        }));
    }, [selected]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/protected", {
                    method: "GET",
                    headers: {
                        'Authorization': `${token}`
                    }
                });

                if (response.ok) {
                    const responseData = await response.json();
                    setData(responseData);
                    console.log("Data fetched successfully");
                } else {
                    console.error("Failed to fetch data");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        if (selected.length === 0) return;

        try {
            const response = await fetch("/announce", {
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
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const handleStartClick = async () => {
        try {
            let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            let mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            setIsRecording(true);

            let chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };

            mediaRecorder.onerror = (e) => {
                alert(e.error);
            };

            mediaRecorder.onstop = async () => {
                setIsRecording(false);
                let blob = new Blob(chunks, { 'type': 'audio/mpeg; codecs=mp3' });
                await uploadAudio(blob);
                let url = URL.createObjectURL(blob);
                document.querySelector('#audio').src = url;
            };

            document.querySelector('button[name="stop"]').addEventListener('click', () => {
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

            const response = await fetch('/record_announce', {
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

    useEffect(() => {
        const button = document.querySelector('button[name="record"]');
        if (button && window.location.pathname === '/announce') {
            button.addEventListener('click', handleStartClick);
            return () => {
                button.removeEventListener('click', handleStartClick);
            };
        }
    }, [isViewAnnounceRoute]);

    const handleSave = async (e) => {
        e.preventDefault();
        const messageElement = document.getElementById('message');
        const errorElement = document.getElementById('error');
        
        const response = await fetch("/announce", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify(data)
        });
        const responseData = await response.json();

        if (response.ok) {
            errorElement.textContent = '';
            messageElement.textContent = responseData.message;
            setData(responseData);
            console.log("It worked");
        } else {
            messageElement.textContent = '';
            errorElement.textContent = responseData.error;
            console.error("Failed to submit");
        }
    };
    

    return (
        <>
        {isViewAnnounceRoute ? (
            <ViewAnnounce token={token} username={username} />
        ) : (
            <div className="center">
                <h2>Announcement</h2>
                <audio id="audio" controls></audio>
                <br></br>
                <button className="custom-button" name="record">Record</button> &emsp;
                <button className="custom-button" name="stop">Stop</button>
                <p style={{ color: 'red', fontSize: '16px', fontWeight: 'bold' }}>
                    {isRecording ? "Recording in progress..." : ""}
                </p>
                <hr />

                <form onSubmit={handleSubmit}>
                    <div className="recipients-style">
                        <h6>
                            <MultiSelect
                                options={recipients}
                                value={selected}
                                onChange={setSelected}
                                labelledBy="Select"
                                overrideStrings={{ "selectSomeItems": "Select recipients"}}
                                required
                            />
                            {formSubmitted && selected.length === 0 && (
                                <div style={{ color: 'red' }}><br />Please select at least one recipient.</div>
                            )}
                        </h6>
                    </div>

                    <textarea
                        className="custom-textfield"
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
                        className="custom-textfield"
                        name="summary"
                        value={data.summary}
                        onChange={handleChange}
                        placeholder="Description"
                        cols="80"
                        rows="10"
                        required
                    />
                    <br />
                    <button className="custom-button" type="submit">Summarize</button>
                    <div className="styled-content">
                        <p className={!data.id_list ? "placeholder" : ""}>
                            To: {data.id_list ? data.id_list.map((item) => {
                            const firstKey = Object.keys(item)[0];
                            return item[firstKey];
                            }).join(', ') : "Recipients"}
                        </p>
                        <h3 className={!data.title ? "placeholder" : ""}>{data.title || "Title"}</h3>
                        <p className={!data.summary ? "placeholder" : ""}>{data.summary || "Description"}</p>
                    </div>
                    <button className="custom-button" type="button" onClick={handleSave}>Save & Submit</button>
                </form>
                <p id="message" style={{ color: 'blue', fontSize: '16px', fontWeight: 'bold' }}></p>
                <p id="error" style={{ color: 'red', fontSize: '16px', fontWeight: 'bold' }}></p>

                <br />
                <nav>
                    <Link to="view_announce" className="custom-link-alt">View Announcements</Link>
                </nav>
            </div>
            )}
        </>
    );
};

export default Announce;


