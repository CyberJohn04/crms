import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/browse-cars',
      label: 'Browse Cars',
      icon: '🚗'
    },
    {
      path: '/my-bookings',
      label: 'My Bookings',
      icon: '📅'
    },
    {
      path: '/my-returns',
      label: 'Returns',
      icon: '🔄'
    },
    {
      path: '/payments',
      label: 'Payments',
      icon: '💳'
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: '👤'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar user-sidebar" style={styles.sidebar}>
      <nav className="sidebar-nav" style={styles.sidebarNav}>
        <ul className="sidebar-menu" style={styles.sidebarMenu}>
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar-item" style={styles.sidebarItem}>
              <Link 
                to={item.path} 
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                style={{
                  ...styles.sidebarLink,
                  ...(isActive(item.path) ? styles.sidebarLinkActive : {})
                }}
              >
                <span className="sidebar-icon" style={styles.sidebarIcon}>{item.icon}</span>
                <span className="sidebar-label" style={styles.sidebarLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer" style={styles.sidebarFooter}>
        <button 
          onClick={handleLogout} 
          style={styles.logoutBtn}
          className="logout-button"
        >
          Logout
        </button>

        <div className="sidebar-stats" style={styles.sidebarStats}>
          <div className="stat-item" style={styles.statItem}>
            <span className="stat-label" style={styles.statLabel}>Member Since</span>
            <span className="stat-value" style={styles.statValue}>
              {user?.createdAt 
                ? new Date(user.createdAt).toLocaleDateString() 
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .user-sidebar .sidebar-nav {
          scrollbar-width: thin;
        }
        .sidebar-link:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        .logout-button:hover {
          background-color: #c0392b !important;
        }
        @media (max-width: 960px) {
          .user-sidebar {
            width: 100% !important;
            height: auto !important;
            top: 60px !important;
            left: 0 !important;
            right: 0 !important;
            border-right: none !important;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          }
          .user-sidebar .sidebar-nav {
            padding: 10px 12px !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
          }
          .user-sidebar .sidebar-menu {
            display: flex !important;
            gap: 8px !important;
            min-width: max-content;
          }
          .user-sidebar .sidebar-item {
            margin-bottom: 0 !important;
          }
          .user-sidebar .sidebar-link {
            margin: 0 !important;
            padding: 10px 14px !important;
            white-space: nowrap;
          }
          .user-sidebar .sidebar-footer {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: '#000F5B',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: '60px',
    zIndex: 999,
  },
  sidebarNav: {
    flex: 1,
    padding: '15px 0',
    overflowY: 'auto',
  },
  sidebarMenu: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  sidebarItem: {
    marginBottom: '5px',
  },
  sidebarLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 15px',
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    borderRadius: '8px',
    margin: '0 10px',
    transition: 'all 0.3s ease',
  },
  sidebarLinkActive: {
    backgroundColor: '#3f42c7',
    color: 'white',
  },
  sidebarIcon: {
    fontSize: '18px',
  },
  sidebarLabel: {
    fontSize: '14px',
    fontWeight: '500',
  },
  sidebarFooter: {
    padding: '15px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  logoutBtn: {
    width: '100%',
    padding: '10px 15px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '15px',
    transition: 'background-color 0.3s ease',
  },
  sidebarStats: {
    paddingTop: '10px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
  },
};

export default Sidebar;
