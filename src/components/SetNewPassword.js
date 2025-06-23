// SetNewPassword.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from 'react-bootstrap/Button';

const SetNewPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password.length < 6) {
      setError('הסיסמה צריכה להכיל לפחות 6 תווים');
      return;
    }

    if (password !== confirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/users/set-new-password`, {
        token,
        password
      });
      setMessage('הסיסמה עודכנה בהצלחה!');
      setTimeout(() => navigate('/login'), 3000); // מעבר אחרי 3 שניות
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה בעדכון הסיסמה');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-4 text-center">הגדר סיסמה חדשה</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          className="form-control mb-2"
          placeholder="סיסמה חדשה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="אישור סיסמה"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <Button type="submit" variant="success" className="w-100">איפוס סיסמה</Button>
      </form>
    </div>
  );
};

export default SetNewPassword;
