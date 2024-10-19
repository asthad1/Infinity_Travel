import React from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Support from './pages/Support';
import Footer from './components/Footer';
import FlightSearches from './pages/FlightSearches';
import SavedFlights from './components/SavedFlights';
import SharedFlightDetails from './components/SharedFlightDetails';
import MyFlights from './components/MyFlights';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';

function App() {
  // Correctly access currentUser from Redux store
  const currentUser = useSelector((state) => state.user?.currentUser);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Router>
        {/* Navbar */}
        <Navbar user={currentUser} /> {/* Pass user prop to Navbar */}

        {/* Main content and routes */}
        <div className="flex-grow-1 my-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
            <Route path="/support" element={<Support />} />
            <Route path="/flightsearches" element={<FlightSearches />} />
            <Route path="/savedflights" element={<SavedFlights />} />
            <Route path="/my-flights" element={<MyFlights />} />
            <Route path="/shared-flights/:flightId" element={<SharedFlightDetails />} />
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
