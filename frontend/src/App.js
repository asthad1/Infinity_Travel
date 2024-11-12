import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
import CouponsPage from './pages/Coupons';
import MetricsPage from './pages/Metrics';
import PaymentGateway from './pages/PaymentGateway';
import { FlightProvider } from './context/FlightContext';
import MyRentals from './components/MyRentals';
import ThingsToDo from './components/ThingsToDo';
import MyBookings from './components/MyBookings';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });

  const [notificationCount, setNotificationCount] = useState(() => {
    const count = localStorage.getItem('notificationCount');
    return count ? JSON.parse(count) : 0;
  });

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'user') {
        setCurrentUser(event.newValue ? JSON.parse(event.newValue) : null);
      } else if (event.key === 'notificationCount') {
        setNotificationCount(event.newValue ? JSON.parse(event.newValue) : 0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <FlightProvider>
      <Router>
        <Navbar user={currentUser} notificationCount={notificationCount} />
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
          <Route path="/payment-gateway" element={<PaymentGateway />} />
          <Route path="/my-rentals" element={<MyRentals />} />
          <Route path="/things-to-do" element={<ThingsToDo />} />
          {/* Admin-only routes */}
          <Route path="/coupons" element={currentUser?.role === 'admin' ? <CouponsPage /> : <Navigate to="/" />} />
          <Route path="/metrics" element={currentUser?.role === 'admin' ? <MetricsPage /> : <Navigate to="/" />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </FlightProvider>
  );
}

export default App;
