// Client/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Link } from 'react-router-dom';


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
    <div className="container-fluid vh-100 d-flex align-items-center">
      <div className="row w-100">
        {/* אנימציה בצד שמאל */}
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center ">
          <DotLottieReact
            src="https://lottie.host/185a63c1-c1e8-49f8-aefb-b67335b00bad/9C8axemjuC.lottie"
            autoplay
            loop
          />
        </div>
        {/* טופס בצד */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div style={{ maxWidth: 400, width: '100%' }}>
            <h2 className="mb-4 text-center">הרשמה</h2>
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

            {/* כאן מוסיפים קישור לעמוד התחברות */}
            <div className="mt-3 text-center">
              <p>כבר רשום? <Link to="/login">לחץ כאן להתחברות</Link></p>
            </div>

            {message && <div className="mt-3 alert alert-info">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;