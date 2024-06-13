import logo from './logo.svg';
import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from "./Layout";
import Home from "./Home";
import Notes from "./Notes";
import Reminder from "./Reminder";
import Announce from "./Announce";
import NoPage from "./NoPage";
import ViewNotes from "./ViewNotes";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="notes" element={<Notes />}>
            <Route path="view_notes" element={<ViewNotes />} />
          </Route>
          <Route path="reminder" element={<Reminder />} />
          <Route path="announce" element={<Announce />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}