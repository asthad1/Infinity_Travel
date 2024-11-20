// App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './store/userSlice';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './pages/Home';
import MyFlights from './components/MyFlights';
import MyHotels from './components/MyHotels';
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
import { HotelProvider } from './context/HotelContext';
import MyRentals from './components/MyRentals';
import ThingsToDo from './components/ThingsToDo';
import MyBookings from './components/MyBookings';
import AddEmails from './components/AddEmails';
import AdminRevenue from './pages/AdminRevenue';

function App() {
  const dispatch = useDispatch();

  // Load user from localStorage into Redux store
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      dispatch(setUser(parsedUser));
    }
  }, [dispatch]);

  // Retrieve user data from Redux store
  const user = useSelector((state) => state.user);

  return (
    <FlightProvider>
      <HotelProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/my-flights"
              element={user?.user_id ? <MyFlights /> : <Navigate to="/login" />}
            />
            <Route
              path="/my-hotels"
              element={user?.user_id ? <MyHotels /> : <Navigate to="/login" />}
            />
            <Route
              path="/profile"
              element={user?.user_id ? <Profile /> : <Navigate to="/login" />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/support" element={<Support />} />
            <Route path="/addemails" element={<AddEmails />} />
            <Route
              path="/my-favorites"
              element={user?.user_id ? <MyFavorites /> : <Navigate to="/login" />}
            />
            <Route path="/savedflights" element={<SavedFlights />} />
            <Route path="/shared-flights/:flightId" element={<SharedFlightDetails />} />
            <Route path="/flightsearchresults" element={<FlightSearchResults />} />
            <Route path="/saved-searches" element={<SavedSearches />} />
            <Route path="/flights" element={<FlightSearchForm />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-gateway" element={<PaymentGateway />} />
            <Route path="/my-rentals" element={<MyRentals />} />
            <Route path="/things-to-do" element={<ThingsToDo />} />
            <Route path="/my-bookings" element={<MyBookings />} />

            {/* Admin-only routes */}
            <Route
              path="/coupons"
              element={user?.role === 'admin' ? <CouponsPage /> : <Navigate to="/" />}
            />
            <Route
              path="/metrics"
              element={user?.role === 'admin' ? <MetricsPage /> : <Navigate to="/" />}
            />
            <Route
              path="/revenue"
              element={user?.role === 'admin' ? <AdminRevenue /> : <Navigate to="/" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </HotelProvider>
    </FlightProvider>
  );
}

export default App;

