import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header/header';

const Layout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    // בדיקה אם המשתמש התחבר בדפים אחרים
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div>
      <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <Outlet context={{ setIsLoggedIn }} />
    </div>
  );
};

export default Layout;
