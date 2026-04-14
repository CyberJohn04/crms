import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginBg from '../assets/images/loginbg.png';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setError('Email or username is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const result = await login(trimmedIdentifier, password);

      if (!result.success) {
        setError(result.error || 'Login failed. Please try again.');
        return;
      }

      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.pageWrapper, backgroundImage: `url(${loginBg})` }}>
      <div style={styles.loginContainer}>
        <form id="loginForm" onSubmit={handleSubmit} noValidate style={styles.form}>
          <div style={styles.logoContainer}>
            <img
              src="https://img.icons8.com/ios-filled/50/0000FF/car.png"
              alt=""
              style={styles.logoIcon}
              aria-hidden="true"
              draggable="false"
            />
            <div>
              <div style={styles.logoTextMain}>Rent a Car</div>
              <div style={styles.logoTextSub}>Management System</div>
            </div>
          </div>

          <h2 style={styles.heading}>Welcome Back!</h2>
          <p style={styles.subtitle}>Please login to your account</p>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <label htmlFor="identifier" style={styles.label}>Email or Username</label>
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon} aria-hidden="true">&#128100;</span>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter email or username"
              autoComplete="username"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <label htmlFor="password" style={styles.label}>Password</label>
          <div style={styles.inputGroup}>
            <span style={styles.inputIcon} aria-hidden="true">&#128274;</span>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.optionsRow}>
            <Link to="/forgot-password" style={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" style={styles.btnLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cantata+One&display=swap');

        input:focus {
          border-color: #3b41f3 !important;
          outline: none;
        }

        button:hover:not(:disabled) {
          background-color: #2d31c5 !important;
        }

        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    margin: 0,
    fontFamily: "'Cantata One', serif",
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  loginContainer: {
    background: 'white',
    padding: '34px 42px 44px 42px',
    width: '420px',
    maxWidth: '100%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    borderRadius: '6px',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  form: {
    display: 'block',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    gap: '10px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.1))',
  },
  logoTextMain: {
    fontWeight: '600',
    fontSize: '18px',
    color: '#000',
    userSelect: 'none',
  },
  logoTextSub: {
    fontSize: '11px',
    color: '#555',
    lineHeight: '1.1',
    userSelect: 'none',
  },
  heading: {
    margin: '0 0 6px 0',
    fontWeight: '600',
    fontSize: '20px',
    color: '#000',
    userSelect: 'none',
  },
  subtitle: {
    margin: '0 0 20px 0',
    fontSize: '13px',
    color: '#555',
    userSelect: 'none',
  },
  label: {
    fontSize: '13px',
    display: 'block',
    marginBottom: '5px',
    color: '#444',
    textAlign: 'left',
    userSelect: 'none',
  },
  inputGroup: {
    position: 'relative',
    marginBottom: '15px',
  },
  inputIcon: {
    position: 'absolute',
    top: '50%',
    left: '10px',
    transform: 'translateY(-50%)',
    color: '#888',
    fontSize: '17px',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  input: {
    width: '100%',
    padding: '10px 10px 10px 35px',
    border: '1.5px solid #ccc',
    borderRadius: '5px',
    fontSize: '14px',
    transition: 'border-color 0.25s ease',
    outlineOffset: '2px',
    boxSizing: 'border-box',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: '20px',
    fontSize: '13px',
    color: '#555',
  },
  forgotPassword: {
    color: '#3b41f3',
    textDecoration: 'none',
    fontWeight: '500',
    userSelect: 'none',
  },
  btnLogin: {
    width: '100%',
    backgroundColor: '#3b41f3',
    border: 'none',
    padding: '12px 0',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    borderRadius: '7px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    userSelect: 'none',
  },
  errorMessage: {
    color: '#e74c3c',
    fontSize: '11px',
    marginBottom: '12px',
    textAlign: 'left',
    userSelect: 'none',
    minHeight: '14px',
  },
};

export default Login;
