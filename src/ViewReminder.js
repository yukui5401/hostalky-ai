import React, { useState, useEffect } from "react";

const ViewReminder = (props) => {
    const { token, username } = props;

    const [reminder, setReminder] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the data from the API
        fetch("/view_reminder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        })
        .then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error || "Network response was not ok";
                throw new Error(errorMessage);
            }
            return response.json();
        })
        .then((data) => {
            setReminder(data);
            setLoading(false);
        })
        .catch((error) => {
            setError(error);
            setLoading(false);
        });
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <>
        <h3>{username}'s Reminders</h3>
        <div className="styled-content">
            {reminder.length > 0 ? (
                reminder.slice().reverse().map((note, index) => (
                <div key={index}>
                    <hr />
                    <h4>{note.title}</h4>
                    <p>{note.summary}</p>
                    <br />
                    <p>Date: {note.date_time}</p>
                </div>
                ))
            ) : (
                <p>No reminders available</p>
            )}
        </div>
        
        </>
    );
}

export default ViewReminder;
