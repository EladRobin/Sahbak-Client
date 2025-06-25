import React, { useState } from 'react';
import axios from 'axios';
import { useOutletContext, useNavigate } from 'react-router-dom';  // <-- הוספתי useNavigate
import FormHook from './reactHookForm/formHook';
import Button from 'react-bootstrap/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setIsLoggedIn } = useOutletContext();
  const navigate = useNavigate();  // <-- ניווט בין דפים

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
      const { token, userId, isAdmin } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('isAdmin', isAdmin.toString());

      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      setError('אימייל או סיסמה שגויים');
    }
  };

  const isLoggedIn = !!localStorage.getItem('token');

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
        <Button className="w-100 mb-3" onClick={handleLogin}>
          התחבר
        </Button>

        {/* כפתור "שכחתי סיסמה" */}
        <div className="text-center">
          <Button variant="link" onClick={() => navigate('/reset-password')} style={{ textDecoration: 'none' }}>
            שכחתי סיסמה
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h4>הציוד שרשום עליך</h4>
      <FormHook />
    </div>
  );
};
