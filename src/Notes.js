import React, { useState, useEffect } from "react";

var btnStart, btnStop, audio;

const Notes = () => {

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

                mediaRecorder.onstop = () => {
                    let blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
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


    return (
        <>
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
                    placeholder="Summary"
                    cols="80"
                    rows="10"
                    required
                />
                <br />
                <button type="submit">Submit</button>
            </form>

            <h3>{data.title}</h3>
            <p>{data.summary}</p>
        </div>
            
        </>
    )
};
  
export default Notes;


// import React, { useState, useEffect } from "react";


// const Notes = () => {
//     // useState for storing and using data
//     const [data, setData] = useState({
//         title: "",
//         summary: "",
//     });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setData((prevData) => ({
//             ...prevData,
//             [name]: value,
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const response = await fetch("/notes", {
//             method: "POST",
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//         });
//         if (response.ok) {
//             const responseData = await response.json();
//             setData(responseData);
//             console.log("It worked");
//         } else {
//             console.error("Failed to submit");
//         }
//     };

//     const handleRecord = async (e) => {
//         e.preventDefault();
//         const response = await fetch('/record')
//         if (response.ok) {
//             const responseData = await response.json();
//             setData(responseData);
//             console.log("It worked");
//         } else {
//             console.error("Failed to retrieve recording");
//         }
//     }

//     return (
//         <>
//         <div className="center">
//             <h2>Personal Notes</h2>

//             <form onSubmit={handleRecord}>
//             <button type="button" onClick={handleRecord}>Record audio</button>
//             </form>
//             <p>or</p> <br /> 

//             <form onSubmit={handleSubmit}>
//                 <textarea
//                     type="text"
//                     name="title"
//                     value={data.title}
//                     onChange={handleChange}
//                     placeholder="Title"
//                     cols="60"
//                     required
//                 />
//                 <br />
//                 <textarea
//                     name="summary"
//                     value={data.summary}
//                     onChange={handleChange}
//                     placeholder="Summary"
//                     cols="80"
//                     rows="10"
//                     required
//                 />
//                 <br />
//                 <button type="submit">Submit</button>
//             </form>

//             <h3>{data.title}</h3>
//             <p>{data.summary}</p>
//         </div>
            
//         </>
//     )
// };
  
// export default Notes;

