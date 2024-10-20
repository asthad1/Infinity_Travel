import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice'; // Redux action to set user data

function Login() {
  const [email, setEmail] = useState('');  // Use 'email' instead of 'username'
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    fetch('http://localhost:9001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then(response => response.json())
      .then((data) => {
        if (data.user_id) {
          dispatch(setUser({ user_id: data.user_id, email: data.email }));
          localStorage.setItem('user_id', data.user_id);
          localStorage.setItem('user', JSON.stringify({ user_id: data.user_id, email: data.email }));
          navigate('/profile');
        } else {
          setMessage('Login failed. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setMessage('An error occurred during login.');
      });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}  // Use 'email' instead of 'username'
          onChange={(e) => setEmail(e.target.value)}  // Update state for email
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
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
      <br />
      <p>
        Don't have an account?
        <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
