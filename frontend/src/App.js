import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Support from './pages/Support';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FlightSearchResults from './components/FlightSearchResults';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Router>
        <Navbar />
        <div className="flex-grow-1 my-4"> {/* Add space with 'my-4' class */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={user ? <Navigate to="/welcome" /> : <Login setUser={setUser} />} />
            <Route path="/welcome" element={user ? <Welcome user={user} /> : <Navigate to="/login" />} />
            <Route path="/support" element={<Support />} />
            <Route path="/flightsearchresults" element={<><FlightSearchResults /></>} />
            <Route path="*" element={<Navigate to="/" />} />
            
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
}

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser(username);
    navigate('/welcome');
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-control mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
        />
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
    </div>
  );
}

function Welcome({ user }) {
  return (
    <div className="container mt-5">
      <h2>Welcome, {user}!</h2>
    </div>
  );
}


export default App;
