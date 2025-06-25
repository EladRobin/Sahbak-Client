import React, { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordOTP = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

const sendOtp = async () => {
  setMessage('');
  setError('');
  try {
    const res = await axios.post('http://localhost:5000/api/users/send-otp', { email });
    setMessage(res.data.message);

    const token = res.data.token; // צריך שהשרת ישלח את זה

    if (token) {
      setTimeout(() => {
        navigate(`/set-new-password/${token}`);
      }, 1500);
    } else {
      // אם אין טוקן, אפשר לשלוח רק לכתובת כללית (בלי טוקן)
      setTimeout(() => {
        navigate('/set-new-password/:token');
      }, 1500);
    }
  } catch (err) {
    setError(err.response?.data?.message || 'שגיאה בשליחת קוד');
  }
};


  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-4 text-center">שליחת קוד איפוס</h3>
      <input
        className="form-control mb-3"
        placeholder="הכנס כתובת מייל"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <Button variant="primary" className="w-100" onClick={sendOtp}>
        שלח קוד
      </Button>
      {message && <div className="alert alert-success mt-3">{message}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default ForgotPasswordOTP;
