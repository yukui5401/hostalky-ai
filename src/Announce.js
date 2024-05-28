import React, { useState, useEffect } from "react";

const Announce = () => {
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
            <h2>Announcement</h2>
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
                <button type="submit">Submit</button>
            </form>

            <h3>{data.title}</h3>
            <p>{data.summary}</p>   
        </div>
        </>
    )
};
  
export default Announce;