import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import MyFlights from './components/MyFlights';
import Profile from './components/Profile';
import FlightSearches from './pages/FlightSearches';
import Support from './pages/Support';
import MyFavorites from './components/MyFavorites';

function App() {
  // Use localStorage to get the user
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Debugging: Print the current user from localStorage
  console.log('Current User from LocalStorage:', currentUser);
  console.log('User ID from LocalStorage:', localStorage.getItem('user_id'));

  return (
    <Router>
      <Navbar user={currentUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <Login />} />
        <Route path="/my-flights" element={currentUser ? <MyFlights /> : <Navigate to="/login" />} />
        <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/support" element={<Support />} />
        <Route path="/my-favorites" element={currentUser ? <MyFavorites /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
