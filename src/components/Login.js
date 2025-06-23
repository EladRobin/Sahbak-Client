// Client/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import FormHook from './reactHookForm/formHook';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });
      const { token, userId } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      console.error('שגיאה בהתחברות:', err.response?.data || err.message);
      setError('אימייל או סיסמה שגויים');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="container mt-5" style={{ maxWidth: '400px' }}>
        <h4 className="mb-3 text-center">התחברות</h4>
        {error && <div className="alert alert-danger">{error}</div>}
        <input
          type="email"
          className="form-control mb-3"
          placeholder="אימייל"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="סיסמה"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="btn btn-primary w-100" onClick={handleLogin}>
          התחבר
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>הציוד שרשום עליך</h4>
        <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
          התנתק
        </button>
      </div>
      <FormHook />
    </div>
  );
};

export default Login;
