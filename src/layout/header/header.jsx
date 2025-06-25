// HeaderWithSidebar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import logo from '../../assets/LOGO.png';

const HeaderWithSidebar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Navbar Header */}
      <nav className="d-flex align-items-center justify-content-between px-3 py-2" style={{ backgroundColor: '#FFDAB9' }}>
        <div className="d-flex align-items-center gap-2">
          <img src={logo} alt="Logo" style={{ height: '50px' }} />
          <Link to="/" className="fw-bold fs-4 text-dark text-decoration-none">סחבק</Link>
        </div>

        <button className="btn btn-outline-secondary d-lg-none" onClick={toggleSidebar}>
          <FaBars size={22} />
        </button>

        {/* Desktop buttons */}
        <div className="d-none d-lg-flex align-items-center gap-3">
          <Link className="nav-link" to="/">דף הבית</Link>
          {isLoggedIn && <Link className="nav-link" to="/myform">עמוד משתמש</Link>}
          {isAdmin && <Link className="nav-link" to="/admin/defective-items">ציוד לא כשיר</Link>}
          {isLoggedIn && (
            <>
              <div style={{ width: 50, height: 50, cursor: 'pointer' }} onClick={handleProfileClick}>
                <DotLottieReact
                  src="https://lottie.host/99cf4331-a261-464d-994e-cdcf6f687ded/WKtGgy1xPd.lottie"
                  autoplay
                  loop
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                <FaSignOutAlt /> התנתק
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Sidebar Panel */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={toggleSidebar} />
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleSidebar}><FaTimes /></button>
        <ul className="list-unstyled p-3">
          <li><Link to="/" onClick={toggleSidebar}>דף הבית</Link></li>
          {isLoggedIn && <li><Link to="/myform" onClick={toggleSidebar}>עמוד משתמש</Link></li>}
          {isAdmin && <li><Link to="/admin/defective-items" onClick={toggleSidebar}>ציוד לא כשיר</Link></li>}
          {isLoggedIn && (
            <>
              <li><button onClick={handleProfileClick} className="btn btn-link">פרופיל</button></li>
              <li><button onClick={handleLogout} className="btn btn-danger btn-sm">התנתק</button></li>
            </>
          )}
        </ul>
      </div>

      {/* CSS */}
      <style>{`
  .sidebar {
    position: fixed;
    top: 0;
    right: -250px;
    width: 250px;
    height: 100%;
    background-color: #fff;
    box-shadow: -2px 0 5px rgb(255, 255, 255);
    transition: right 0.3s ease;
    z-index: 1050;
  }
  .sidebar.open {
    right: 0;
  }
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    z-index: 1049;
    display: none;
  }
  .sidebar-overlay.open {
    display: block;
  }
  .close-btn {
    position: absolute;
    top: 10px;
    right: 25px; /* ✅ זה העדכון המבוקש */
    background: none;
    border: none;
    font-size: 24px;
  }
`}
</style>

    </>
  );
};

export default HeaderWithSidebar;
