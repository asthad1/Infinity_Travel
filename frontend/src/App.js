import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import FlightSearches from './pages/FlightSearches';
import Support from './pages/Support';
import Footer from './components/Footer';
import UserFavoriteFlights from './components/UserFavoriteFlights';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar'; 

function App() {
  const [user, setUser] = useState(null);  // State to store logged-in user

  return (
    <div className="d-flex flex-column min-vh-100">
      <Router>
        {/* Navbar */}
        <Navbar user={user} setUser={setUser} /> {/* Pass user and setUser as props */}

        {/* Main content and routes */}
        <div className="flex-grow-1 my-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
            <Route path="/support" element={<Support />} />
            <Route path="/flightsearches" element={<FlightSearches />} />
            <Route path="/savedflights" element={<UserFavoriteFlights />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </Router>
    </div>
  );
}

export default App;
