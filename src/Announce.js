import React, { useState, useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";

const Announce = () => {
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

        btnStart.addEventListener('click', handleStartClick);

        // Cleanup event listeners on component unmount
        return () => {
            btnStart.removeEventListener('click', handleStartClick);
        };
    }, []);

    const [selected, setSelected] = useState([]);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const recipients = [
        {label: "brookeyang", value: "&brookeyang"},
        {label: "ross", value: "&ross"},
        {label: "pratheepan", value: "&pratheepan"},
    ]

    // useState for storing and using data
    const [data, setData] = useState({
        id_list: [],
        title: "",
        summary: "",
    });

    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            id_list: selected,
        }));
    }, [selected]);

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
    };


    return (
        <>
        <div className="center">
            <h2>Announcement</h2>
            {/* record audio */}
            <audio id="audio" controls></audio>
            <br></br>
            <button name="record">Record</button> &emsp;
            <button name="stop">Stop</button>
            <hr></hr>

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
                <button type="submit">Submit</button>
            </form>
            <p>JSON recipient data: {JSON.stringify(data.id_list)}</p>
            <h3>{data.title}</h3>
            <p>{data.summary}</p>   
        </div>
        </>
    )
};
  
export default Announce;

