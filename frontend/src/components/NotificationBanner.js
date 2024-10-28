import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationBanner.css'; // Import the CSS file

function NotificationBanner({ user }) {
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUserCount();
    }
  }, [user]);

  const fetchUserCount = async () => {
    try {
      const response = await axios.get('http://localhost:9001/api/users/count');
      setUserCount(response.data.count);
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  let message = '';

  if (user && user.role === 'admin') {
    message = `Welcome to your dashboard, Infinity Travel currently has: ${
      userCount !== null ? userCount : '...'
    } users! Keep it up!!!`;
  } else if (user && user.role === 'frequentflyer') {
    message = (
      <span>
        ***Use code <strong>HOLID50</strong> for <strong>50% off</strong> flights till New Years***
      </span>
    );
  } else if (user && user.role === 'regular') {
    message = (
      <span>
        ***Use code <strong>HOLID30</strong> for <strong>30% off</strong> flights till New Years***
      </span>
    );
  }

  if (!message) {
    return null; // Don't display the banner if there's no message
  }

  return (
    <div className="notification-banner">
      <h1>LIMITED TIME PROMOTIONAL OFFER</h1>
      <p>{message}</p>
    </div>
  );
}

export default NotificationBanner;



