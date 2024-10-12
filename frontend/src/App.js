import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Welcome from './Welcome';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/welcome" /> : <Login setUser={setUser} />
          }
        />
        <Route
          path="/welcome"
          element={
            user ? <Welcome user={user} /> : <Navigate to="/login" />
          }
        />
        {/* Redirect any unknown routes to /register */}
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}

export default App;



