import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import brandCarImage from '../assets/images/brandcar.png';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar admin-navbar" style={styles.navbar}>
      <div className="navbar-container" style={styles.navbarContainer}>
        <div className="navbar-brand">
          <Link to="/admin" className="brand">
            <img 
              src={brandCarImage} 
              alt="Car" 
              className="brand-icon" 
              style={styles.brandIcon}
            />
            <span className="brand-text" style={styles.brandText}>Admin Panel</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu" style={styles.menuToggle}>
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* User Menu with Welcome Message */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`} style={styles.navbarMenu}>
          <div className="user-menu" style={styles.userMenu}>
            <div style={styles.welcomeSection}>
              <span style={styles.welcomeText}>Welcome,</span>
              <Link to="/admin/settings" className="user-profile" onClick={() => setIsMenuOpen(false)} style={styles.userProfile}>
                <div className="user-avatar" style={styles.userAvatar}>
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="user-name" style={styles.userName}>{user?.name || 'Admin'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-navbar {
          background-color: #000F5B !important;
        }
        .navbar-brand .brand {
          display: flex;
          align-items: center;
        }
        .menu-toggle {
          display: none;
        }
        @media (max-width: 768px) {
          .admin-navbar .brand-text {
            font-size: 16px !important;
            margin-left: 8px !important;
          }
          .admin-navbar {
            padding: 0 12px !important;
          }
          .admin-navbar .navbar-menu {
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background: #000F5B;
            padding: 14px 16px;
            justify-content: center;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
          }
          .admin-navbar .welcomeSection {
            flex-wrap: wrap;
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
        .admin-logout-btn {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          margin-left: 15px;
        }
        .admin-logout-btn:hover {
          background-color: #c0392b;
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
    fontFamily: 'Inria Serif, serif',
    fontSize: '20px',
    fontWeight: 'bold',
    marginLeft: '10px',
  },
  navbarMenu: {
    display: 'flex',
    alignItems: 'center',
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
    fontFamily: 'Inria Serif, serif',
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
    fontFamily: 'Inria Serif, serif',
    fontSize: '14px',
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '600',
    fontFamily: 'Inria Serif, serif',
    marginLeft: '15px',
  },
  menuToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
  },
};

export default AdminNavbar;
