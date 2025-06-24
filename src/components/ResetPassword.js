// 1. ResetPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('אנא הזן מייל תקין');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/reset-password', { email });
      setMessage(response.data.message || 'קישור נשלח');
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בשליחת הבקשה');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-4 text-center">איפוס סיסמה</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">כתובת מייל</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="הכנס את כתובת המייל שלך"
            required
          />
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <Button type="submit" variant="primary" className="w-100">שלח</Button>
      </form>
    </div>
  );
};

export default ResetPassword;