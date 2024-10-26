// Profile.js
import React, { useState } from 'react';
import axios from 'axios';

function Profile() {
  const user = localStorage.getItem('username');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordChange = () => {
    axios.post('http://localhost:9001/api/change_password', {
      username: user,
      old_password: oldPassword,
      new_password: newPassword
    })
      .then(response => setMessage(response.data.message))
      .catch(error => setMessage(error.response.data.message));
  };

  return (
    <div className="container mt-5">
      <h2>Change Password for {user}</h2>
      <input
        type="password"
        placeholder="Old Password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handlePasswordChange}>Change Password</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Profile;
