import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import MyFlights from './components/MyFlights';
import Profile from './components/Profile';
import Support from './pages/Support';
import MyFavorites from './components/MyFavorites';
import SavedFlights from './components/SavedFlights';
import SavedSearches from './components/SavedSearches';
import SharedFlightDetails from './components/SharedFlightDetails';
import FlightSearchResults from './components/FlightSearchResults';
import FlightSearchForm from './components/FlightSearchForm';
import Checkout from './pages/Checkout';

function App() {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    // Listen for changes to localStorage, especially on login and logout
    const handleStorageChange = () => {
      setCurrentUser(JSON.parse(localStorage.getItem('user')));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Re-check localStorage on app load to set the currentUser
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  return (
    <Router>
      <Navbar user={currentUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/my-flights" element={currentUser ? <MyFlights /> : <Navigate to="/login" />} />
        <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/support" element={<Support />} />
        <Route path="/my-favorites" element={currentUser ? <MyFavorites /> : <Navigate to="/login" />} />
        <Route path="/savedflights" element={<SavedFlights />} />
        <Route path="/shared-flights/:flightId" element={<SharedFlightDetails />} />
        <Route path="/flightsearchresults" element={<FlightSearchResults />} />
        <Route path="/saved-searches" element={<SavedSearches />} />
        <Route path="/flights" element={<FlightSearchForm />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
