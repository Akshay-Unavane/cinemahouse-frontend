import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import ErrorBoundary from "./component/ErrorBoundary";

import ScrollToTop from "./component/ScrollToTop";

import BackToTop from "./component/BackToTop";

import GuestRoute from "./component/GuestRoute";

import ProtectedRoute from "./component/ProtectedRoute";

import Home from "./pages/Home";

import NavBar from "./component/NavBar";

import Movies from "./pages/Movies";

import TVShows from "./pages/TVShows";

import TvShowDetails from "./pages/TvShowDetails";

import MovieDetails from "./pages/MovieDetail";

import Browse from "./pages/Browse";

import Login from "./pages/Login";

import Register from "./pages/Register";

import ForgotPassword from "./pages/ForgotPassword";

import ResetPassword from "./pages/ResetPassword";

import Profile from "./pages/Profile";

import Watchlist from "./pages/Watchlist";

import PersonDetails from "./pages/PersonDetails";

import NotFound from "./pages/NotFound";

import Footer from "./component/Footer";

import AdminRoute from "./component/AdminRoute";

import AdminLayout from "./component/AdminLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";

import AdminUsers from "./pages/admin/AdminUsers";

import AdminMovies from "./pages/admin/AdminMovies";

import AdminReviews from "./pages/admin/AdminReviews";

import AdminHero from "./pages/admin/AdminHero";

import AdminAccount from "./pages/admin/AdminAccount";

import AdminGate from "./component/AdminGate";



import "./App.css";



function App() {

  return (

    <ErrorBoundary>

      <BrowserRouter>

        <ScrollToTop />

        <div className="flex flex-col min-h-screen">

          <NavBar />



          <main className="flex-1">

            <Routes>

              <Route path="/" element={<Home />} />

              <Route path="/movies" element={<Movies />} />

              <Route path="/tv-shows" element={<TVShows />} />

              <Route path="/movie/:id" element={<MovieDetails />} />

              <Route path="/tv/:id" element={<TvShowDetails />} />

              <Route path="/person/:id" element={<PersonDetails />} />

              <Route path="/search" element={<Browse />} />



              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />

              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

              <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

              <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />



              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />



              <Route

                path="/admin"

                element={

                  <AdminRoute>

                    <AdminGate>

                      <AdminLayout />

                    </AdminGate>

                  </AdminRoute>

                }

              >

                <Route index element={<AdminDashboard />} />

                <Route path="users" element={<AdminUsers />} />

                <Route path="movies" element={<AdminMovies />} />

                <Route path="hero" element={<AdminHero />} />

                <Route path="reviews" element={<AdminReviews />} />

                <Route path="account" element={<AdminAccount />} />

              </Route>



              <Route path="*" element={<NotFound />} />

            </Routes>

          </main>



          <Footer />

          <BackToTop />

        </div>

      </BrowserRouter>

    </ErrorBoundary>

  );

}



export default App;


