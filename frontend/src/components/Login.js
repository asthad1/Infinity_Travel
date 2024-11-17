// Login.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { setTravelCredit } from '../store/travelCreditSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faLock,
  faSignInAlt,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:9001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.user_id) {
        // Updated userData to include 'role'
        const userData = {
          user_id: data.user_id,
          email: data.email,
          role: data.role,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        dispatch(setUser(userData));

        // Fetch and store travel credit
        const creditResponse = await fetch(`http://localhost:9001/api/travel_credits/${data.user_id}`);
        if (creditResponse.ok) {
          const creditData = await creditResponse.json();
          dispatch(setTravelCredit(creditData.balance));
        } else {
          // Handle error, e.g., set travel credit to 0
          dispatch(setTravelCredit(0));
        }

        navigate('/');
      } else {
        setMessage('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred during login. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FontAwesomeIcon icon={faSignInAlt} className="login-icon" />
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="input-group">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="form-control"
              />
            </div>
          </div>

          {message && (
            <div className="alert alert-danger">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {message}
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Signing in...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="register-link">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
