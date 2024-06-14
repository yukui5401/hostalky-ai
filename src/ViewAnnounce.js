import React, { useState, useEffect } from "react";

const ViewAnnounce = (props) => {
    const { token, username } = props;

    const [announce, setAnnounce] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the data from the API
        fetch("/view_announce", {
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
            setAnnounce(data);
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
        <h3>{username}'s Announcements</h3>
        <div className="styled-content">
            {announce.length > 0 ? (
                announce.slice().reverse().map((note, index) => (
                <div key={index}>
                    <hr />
                    {note.id_list && note.id_list.length > 0 && (
                        <p>
                            To: {note.id_list.map((item, idx) => {
                                const firstKey = Object.keys(item)[0];
                                return item[firstKey];
                            }).join(', ')}
                        </p>
                    )}
                    <h4>{note.title}</h4>
                    <p>{note.summary}</p>
                </div>
                ))
            ) : (
                <p>No announcements available</p>
            )}
        </div>
        
        </>
    );
}

export default ViewAnnounce;
