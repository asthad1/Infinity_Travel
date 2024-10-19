import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:9001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) =>
        response.json().then((data) => ({ status: response.status, body: data }))
      )
      .then(({ status, body }) => {
        if (status === 200) {
          setUser(username);
          navigate('/welcome');
        } else {
          setMessage(body.message || 'Login failed');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setMessage('An error occurred during login');
      });
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
      {/* Register button */}
      <p>Don't have an account? <button onClick={() => navigate('/register')}>Register here</button></p>
    </div>
  );
}

export default Login;
