import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import { useLocation } from 'react-router-dom';

const ResetPasswordWithOtp = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleReset = async () => {
    setMessage('');
    setError('');

    if (password !== confirm) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/users/reset-password-with-otp', {
        email, otp, newPassword: password
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'שגיאה באיפוס');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-4 text-center">איפוס סיסמה עם קוד</h3>
      <input className="form-control mb-2" placeholder="מייל" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="form-control mb-2" placeholder="קוד OTP" value={otp} onChange={e => setOtp(e.target.value)} />
      <input className="form-control mb-2" type="password" placeholder="סיסמה חדשה" value={password} onChange={e => setPassword(e.target.value)} />
      <input className="form-control mb-2" type="password" placeholder="אישור סיסמה" value={confirm} onChange={e => setConfirm(e.target.value)} />
      <Button variant="success" className="w-100" onClick={handleReset}>אפס סיסמה</Button>
      {message && <div className="alert alert-success mt-3">{message}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default ResetPasswordWithOtp;
