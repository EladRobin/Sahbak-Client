import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import logo from '../../assets/LOGO.png'; // ייבוא בתחילת הקובץ


const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#FFDAB9' }}>
      <div className="container">
              <img src={logo} alt="לוגו צופיה" style={{ height: '60px' }} />

        <Link className="navbar-brand" to="/">סחבק</Link>

 

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
          aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
 <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
  <li className="nav-item">
    <Link className="nav-link active" to="/">דף הבית</Link>
  </li>

  <li className="nav-item">
    <Link className="nav-link active" to="/login">אדמין</Link>
  </li>

  {isLoggedIn && (
    <>
      <li className="nav-item">
        <Link className="nav-link active" to="/myform">עמוד משתמש</Link>
      </li>

    </>
  )}
</ul>


          {/* צד ימין של ההדר */}
          {isLoggedIn && (
            <div className="d-flex align-items-center gap-3" onClick={handleProfileClick}>
              {/* כאן האנימציה במקום האייקון */}
             <div style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}>
          <DotLottieReact
            src="https://lottie.host/99cf4331-a261-464d-994e-cdcf6f687ded/WKtGgy1xPd.lottie"
            autoplay
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </div>


                <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2" onClick={handleLogout}>
          <div style={{ width: 30, height: 30, minWidth: 30, minHeight: 30 }}>
            <DotLottieReact
              src="https://lottie.host/9ff76a37-47bb-4b40-bf59-c1a09090a51f/a1LUTAVW10.lottie"
              autoplay
              loop
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          התנתק
        </button>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
