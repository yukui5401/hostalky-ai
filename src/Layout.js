import { Outlet, Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Layout = () => {
    const [data, setdata] = useState({
        date: "something",
    });

    useEffect(() => {
        // Using fetch to fetch the api from 
        // flask server it will be redirected to proxy
        fetch('/timedate').then((res) =>
            res.json().then((data) => {
                // Setting a data from api
                setdata({
                    date: data.date,
                });
            })
        );
    }, []);

  return (
    <>
        <header className="App-header">
            <Outlet />
            <nav>
                <h6>
                    <Link to="/">Home</Link> &emsp;&emsp;&emsp; / &emsp;&emsp;&emsp;
                    <Link to="/notes">Notes</Link> &emsp;&emsp;&emsp; /  &emsp;&emsp;&emsp;
                    <Link to="/reminder">Reminder</Link> &emsp;&emsp;&emsp; / &emsp;&emsp;&emsp;
                    <Link to="/announce">Announce</Link>
                </h6>
            </nav>
            <h6>Last refreshed: {data.date} </h6>
            <h6>Experience a positive working environment like never before with a dependable healthcare communication app</h6>
        </header>
    </>
  )
};

export default Layout;
