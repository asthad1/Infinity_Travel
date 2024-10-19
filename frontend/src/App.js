import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useNavigate} from 'react-router-dom';
import Home from './pages/Home';
import Support from './pages/Support';
import Footer from './components/Footer';
import FlightSearchResults from './components/FlightSearchResults';
import UserFavoriteFlights from './components/UserFavoriteFlights';
import Register from './Register';
import Login from './Login';
import FlightSearchForm from './components/FlightSearchForm';
import Checkout from './pages/Checkout';

function App() {
  const [user, setUser] = useState(null);  // State to store logged-in user

  return (
    <div className="d-flex flex-column min-vh-100">
      <Router>
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">Infinity Travel</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/support">Support</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/flightsearchresults">Search Flights</Link>
                </li>
              </ul>
              <ul className="navbar-nav ms-auto">
                {user ? (
                  <>
                    <li className="nav-item">
                      <span className="navbar-text">Welcome, {user}!</span>
                    </li>
                    <li className="nav-item">
                      <LogoutButton setUser={setUser} />  {/* Logout button when user is logged in */}
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">Login</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register">Register</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>

        {/* Main content and routes */}
        <div className="flex-grow-1 my-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
            <Route path="/support" element={<Support />} />
            <Route path="/flightsearchresults" element={<FlightSearchResults />} />
            <Route path="/savedflights" element={<UserFavoriteFlights />} />
            <Route path="/flights" element={<FlightSearchForm />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </Router>
    </div>
  );
}

// Logout button component with useNavigate inside
function LogoutButton({ setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);  // Reset user state
    navigate('/login');  // Navigate to login page after logout
  };

  return <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>;
}

export default App;
