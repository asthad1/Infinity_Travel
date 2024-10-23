import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';  // Redux action to set user

function Login({ setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch('http://localhost:9001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then(response => response.json())
      .then((data) => {
        setLoading(false);
        if (data.user_id) {
          // Save user data to localStorage and update currentUser in state
          const userData = { user_id: data.user_id, email: data.email };
          localStorage.setItem('user', JSON.stringify(userData));
          dispatch(setUser(userData));  // Redux action to set user

          // Update currentUser state in App.js to trigger re-render
          setCurrentUser(userData);

          // Redirect to profile page
          navigate('/');  
        } else {
          setMessage('Login failed. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
        setMessage('An error occurred during login.');
      });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && <p>{message}</p>}
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
