import React, { useState } from 'react';
import './AddEmails.css';  // Import the CSS file

const AddEmails = () => {
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState('');

  // Handle adding email to the list
  const addEmail = () => {
    // Reset any previous errors
    setError('');

    // Validate the email format
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // Ensure the email is not already in the list
    if (emails.includes(email)) {
      setError('This email is already added.');
      return;
    }

    // Add the email to the list
    setEmails((prevEmails) => [...prevEmails, email]);
    setEmail(''); // Clear email input
  };

  // Handle removing an email from the list
  const removeEmail = (emailToRemove) => {
    setEmails((prevEmails) => prevEmails.filter((e) => e !== emailToRemove));
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
          {emails.length > 0 ? (
            emails.map((emailItem, index) => (
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
