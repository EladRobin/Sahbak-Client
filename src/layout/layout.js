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
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <main className="flex-grow">
        <Outlet context={{ setIsLoggedIn }} />
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center colorrgb(31, 21, 13)">
        <p style={{ color: 'rgb(31, 21, 13)' }}>© {new Date().getFullYear()} כל הזכויות שמורות &nbsp;|&nbsp; אתר זה הוא למטרות הדגמה בלבד</p>
        <div className="mt-2">
          <a href="/privacy" className="underline hover:text-gray-300 mx-2">מדיניות פרטיות</a>
          <a href="/terms" className="underline hover:text-gray-300 mx-2">תנאי שימוש</a>
          <a href="/contact" className="underline hover:text-gray-300 mx-2">צור קשר</a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;


