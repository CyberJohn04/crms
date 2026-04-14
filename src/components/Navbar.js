import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import brandCarImage from '../assets/images/brandcar.png';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar" style={styles.navbar}>
      <div className="navbar-container" style={styles.navbarContainer}>
        <div className="navbar-brand">
          <Link to="/" className="brand">
            <img 
              src={brandCarImage} 
              alt="Car" 
              className="brand-icon" 
              style={styles.brandIcon}
            />
            <span className="brand-text" style={styles.brandText}>Rent A Car</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu" style={styles.menuToggle}>
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Navigation Links */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="navbar-nav" style={styles.navbarNav}>
            {!isAuthenticated && (
              <li className="nav-item">
                <Link to="/" className="nav-link" style={styles.navLink} onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
              </li>
            )}
            
            {isAuthenticated ? (
              <></>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/signup" className="nav-link btn-signup" style={styles.btnSignup} onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="nav-link btn-login" style={styles.btnLogin} onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* User Menu with Welcome Message */}
          {isAuthenticated && (
            <div className="user-menu" style={styles.userMenu}>
              <div style={styles.welcomeSection}>
                <span style={styles.welcomeText}>Welcome,</span>
                <Link to="/profile" className="user-profile" onClick={() => setIsMenuOpen(false)} style={styles.userProfile}>
                  <div className="user-avatar" style={styles.userAvatar}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="user-name" style={styles.userName}>{user?.name || 'User'}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-brand .brand {
          display: flex;
          align-items: center;
        }
        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .menu-toggle {
          display: none;
        }
        @media (max-width: 768px) {
          .brand-text {
            font-size: 16px !important;
            margin-left: 8px !important;
          }
          .navbar {
            padding: 0 12px !important;
          }
          .navbar-menu {
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background: #000F5B;
            padding: 14px 16px;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
          }
          .navbar-nav {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
          }
          .user-menu {
            justify-content: center;
          }
          .menu-toggle {
            display: block;
          }
          .navbar-menu {
            display: none;
          }
          .navbar-menu.active {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#000F5B',
    padding: '0 20px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  navbarContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  brandIcon: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  },
  brandText: {
    color: 'white',
    fontFamily: 'Cantata One',
    fontSize: '20px',
    fontWeight: 'bold',
    marginLeft: '10px',
  },
  navbarNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navLink: {
    color: 'white',
    fontFamily: 'Cantata One',
    textDecoration: 'none',
    fontSize: '14px',
  },
  btnSignup: {
    backgroundColor: '#00C91E',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '5px',
    textDecoration: 'none',
    fontFamily: 'Cantata One',
    fontSize: '14px',
    fontWeight: '600',
  },
  btnLogin: {
    backgroundColor: '#170DA9',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '5px',
    textDecoration: 'none',
    fontFamily: 'Cantata One',
    fontSize: '14px',
    fontWeight: '600',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  welcomeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  welcomeText: {
    color: 'white',
    fontFamily: 'Cantata One',
    fontSize: '14px',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#3f42c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  userName: {
    color: 'white',
    fontFamily: 'Cantata One',
    fontSize: '14px',
    fontWeight: '600',
  },
  menuToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
  },
};

export default Navbar;
