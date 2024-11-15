import React, { useState, useEffect  } from 'react';
import './AddEmails.css';  // Import the CSS file
import axios from 'axios';

const AddEmails = () => {
  const [email, setEmail] = useState('');
  const [emailList, setEmails] = useState([]);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.user_id;

  // Fetch existing emails on component mount
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get(`http://localhost:9001/api/email_notifications?user_id=${userId}`);
        
        // Axios automatically parses JSON, so data is already in JSON format
        const emailList = response.data.map((item) => item.email); // Assuming each item has an "email" field
        setEmails(emailList);
      } catch (err) {
        setError(err.message || 'Failed to fetch emails.');
      }
    };

    fetchEmails();
  }, []);

  const addEmail = async () => {
    setError(''); // Reset any previous errors

    // Validate the email format
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // Ensure the email is not already in the list
    if (emailList.includes(email)) {
      setError('This email is already added.');
      return;
    }

    try {
      // Call the API to create a new email notification
      const response = await fetch('http://localhost:9001/api/email_notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, user_id: userId }), // Replace 1 with actual user ID
      });

      if (!response.ok) {
        throw new Error('Failed to add email.');
      }

      // Add the email to the list if API call is successful
      setEmails((prevEmails) => [...prevEmails, email]);
      setEmail(''); // Clear email input
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to remove an email via API
  const removeEmail = async (emailToRemove) => {
    try {
      // Call the API to delete the email notification
      const response = await fetch('http://localhost:9001/api/email_notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToRemove, user_id: userId }), // Replace 1 with actual user ID
      });

      if (!response.ok) {
        throw new Error('Failed to remove email.');
      }

      // Remove the email from the list if API call is successful
      setEmails((prevEmails) => prevEmails.filter((e) => e !== emailToRemove));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Manage Trip Notifications</h1>

      <div className="add-email-section">
        <h3>Add Emails</h3>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={addEmail}>Add Email</button>
        
        {error && <p className="error">{error}</p>}

        <div className="emails-list">
          {emailList.length > 0 ? (
            emailList.map((emailItem, index) => (
              <div key={index} className="email-item">
                <span>{emailItem}</span>
                <button onClick={() => removeEmail(emailItem)}>Remove</button>
              </div>
            ))
          ) : (
            <p>No emails added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEmails;
