import React, { useState, useEffect } from "react";

const ViewNotes = (props) => {
    const { token, username } = props;

    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the data from the API
        fetch("/view_notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            setNotes(data);
            setLoading(false);
        })
        .catch((error) => {
            setError(error);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <>
        <h3>{username}'s Notes</h3>
        <div className="styled-content">
            {notes.length > 0 ? (
                notes.slice().reverse().map((note, index) => (
                <div key={index}>
                    <hr />
                    <h4>{note.title}</h4>
                    <p>{note.summary}</p>
                </div>
                ))
            ) : (
                <p>No notes available</p>
            )}
        </div>
        
        </>
    );
}

export default ViewNotes;
