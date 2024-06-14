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
            <nav>
                <h6>
                    <Link to="/" className="custom-link">Home</Link> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
                    <Link to="/notes" className="custom-link">Notes</Link> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
                    <Link to="/reminder" className="custom-link">Reminder</Link> &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;
                    <Link to="/announce" className="custom-link">Announce</Link>
                </h6>
            </nav>
            <Outlet />
            <h6>Last refreshed: {data.date} </h6>
        </header>
    </>
  )
};

export default Layout;
