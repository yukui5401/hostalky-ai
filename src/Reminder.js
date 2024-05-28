import React, { useState, useEffect } from "react";

const Reminder = () => {
    // useState for storing and using data
    const [data, setData] = useState({
        title: "",
        summary: "",
        date_time: "",
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
        const response = await fetch("/reminder", {
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
            <h2>Reminder</h2>
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
                <h6>Select date & time:&nbsp;
                    <input 
                        type="datetime-local"
                        name="date_time"
                        value={data.date_time}
                        onChange={handleChange}
                        required 
                    />
                </h6>
                <button type="submit">Submit</button>
            </form>

            <h3>{data.title}</h3>
            <p>{data.summary}</p>
            <p>{data.date_time}</p>
        </div>
        </>
    )
};
  
export default Reminder;