// Client/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', formData);


      setMessage('נרשמת בהצלחה!');
      setFormData({ email: '', fullName: '', password: '' });
    } catch (err) {
      setMessage('שגיאה בהרשמה: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 400 }}>
      <h2 className="mb-4">הרשמה</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          className="form-control mb-2"
          placeholder="אימייל"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="fullName"
          className="form-control mb-2"
          placeholder="שם מלא"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          className="form-control mb-3"
          placeholder="סיסמה"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn btn-primary w-100">הרשם</button>
      </form>
      {message && <div className="mt-3 alert alert-info">{message}</div>}
    </div>
  );
};

export default Register;
//     <div className="text-center"> 