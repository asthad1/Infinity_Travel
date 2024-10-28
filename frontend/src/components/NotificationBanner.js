// NotificationBanner.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    message = `Welcome to your dashboard, Infinity Travel currently has: ${userCount !== null ? userCount : '...'} users! Keep it up!!!`;
  } else if (user && user.role === 'frequentflyer') {
    message = '***Use the code HOLID50 to get 50% off till New Years***';
  } else if (user && user.role === 'regular') {
    message = '***Use the code HOLID30 to get 30% off till New Years***';
  }

  if (!message) {
    return null; // Don't display the banner if there's no message
  }

  return (
    <div>
      <h1>Test Notification</h1>
      {message}
    </div>
  );
}

export default NotificationBanner;

