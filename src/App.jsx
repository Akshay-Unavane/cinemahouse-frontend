import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import NavBar from "./component/NavBar";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import TvShowDetails from "./pages/TvShowDetails";
import MovieDetails from "./pages/MovieDetail";
import Browse from "./pages/Browse";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Watchlist from "./pages/Watchlist";
import PersonDetails from "./pages/PersonDetails";
import Footer from "./component/Footer";


import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/tv-shows" element={<TVShows />} />

        <Route path="/movie/:id" element={<MovieDetails />} />
        <Route path="/tv/:id" element={<TvShowDetails />} />
        <Route path="/person/:id" element={<PersonDetails />} />

        <Route path="/search" element={<Browse />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/watchlist" element={<Watchlist />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
