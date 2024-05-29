import React, { useState, useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";

const Announce = () => {
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
            <p>{JSON.stringify(data.id_list)}</p>
            <h3>{data.title}</h3>
            <p>{data.summary}</p>   
        </div>
        </>
    )
};
  
export default Announce;

