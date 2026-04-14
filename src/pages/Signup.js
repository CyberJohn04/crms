import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import signupBg from '../assets/images/loginbg.png';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChecklist, setShowPasswordChecklist] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const validateName = (value) => /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(value);
  const validatePhone = (value) => /^\d{11}$/.test(value);
  const hasMinPasswordLength = password.length >= 6;
  const hasPasswordNumber = /\d/.test(password);
  const hasPasswordSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinPasswordLength && hasPasswordNumber && hasPasswordSpecial;

  const sanitizeNameInput = (value) => value.replace(/[^A-Za-z\s]/g, '').replace(/\s+/g, ' ').trimStart();
  const sanitizePhoneInput = (value) => value.replace(/\D/g, '').slice(0, 11);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedFirstName = firstName.trim();
    const trimmedMiddleName = middleName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedUsername = username.trim();
    const fullName = [trimmedFirstName, trimmedMiddleName, trimmedLastName].filter(Boolean).join(' ');

    if (!trimmedFirstName || !trimmedLastName) {
      setError('First name and last name are required');
      return;
    }

    if (!validateName(trimmedFirstName)) {
      setError('First name must contain letters only');
      return;
    }

    if (trimmedMiddleName && !validateName(trimmedMiddleName)) {
      setError('Middle name must contain letters only');
      return;
    }

    if (!validateName(trimmedLastName)) {
      setError('Last name must contain letters only');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePhone(trimmedPhone)) {
      setError('Phone number must be exactly 11 digits');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must be at least 6 characters and include 1 number and 1 special character');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        name: fullName,
        firstName: trimmedFirstName,
        middleName: trimmedMiddleName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        phone: trimmedPhone,
        username: trimmedUsername,
        password,
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
    signupContainer: {
      background: 'white',
      padding: '40px 30px',
      width: '520px',
      maxWidth: '100%',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      borderRadius: '6px',
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
      margin: '0 0 20px 0',
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
    row: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
    },
    field: {
      flex: 1,
    },
    inputGroup: {
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      top: '50%',
      left: '12px',
      transform: 'translateY(-50%)',
      color: '#888',
      fontSize: '17px',
      pointerEvents: 'none',
      userSelect: 'none',
    },
    input: {
      width: '100%',
      padding: '12px 12px 12px 40px',
      border: '1.5px solid #ccc',
      borderRadius: '5px',
      fontSize: '14px',
      transition: 'border-color 0.25s ease',
      outlineOffset: '2px',
      boxSizing: 'border-box',
    },
    signupBtn: {
      width: '100%',
      backgroundColor: '#3030cc',
      color: 'white',
      fontWeight: '600',
      padding: '12px 0',
      border: 'none',
      borderRadius: '8px',
      fontSize: '15px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      userSelect: 'none',
      marginTop: '20px',
    },
    errorMessage: {
      color: '#e74c3c',
      fontSize: '12px',
      marginBottom: '20px',
      textAlign: 'left',
      userSelect: 'none',
      minHeight: '20px',
    },
    checklist: {
      marginTop: '10px',
      marginBottom: '6px',
      padding: '12px',
      background: '#f8fafc',
      border: '1px solid #dbe4f0',
      borderRadius: '8px',
      textAlign: 'left',
    },
    checklistTitle: {
      margin: '0 0 8px 0',
      fontSize: '12px',
      color: '#374151',
    },
    checklistItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      marginBottom: '6px',
    },
    checklistValid: {
      color: '#1f7a3d',
    },
    checklistInvalid: {
      color: '#9ca3af',
    },
    checklistIcon: {
      fontWeight: 700,
      width: '14px',
      display: 'inline-block',
      textAlign: 'center',
    },
  };

  return (
    <div style={{ ...styles.pageWrapper, backgroundImage: `url(${signupBg})` }}>
      <div style={styles.signupContainer}>
        <form id="signupForm" onSubmit={handleSubmit} noValidate style={styles.form}>
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

          <h2 style={styles.heading}>Create an account</h2>
          <p style={styles.subtitle}>Sign up to get started</p>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <div style={styles.row}>
            <div style={styles.field}>
              <div style={styles.inputGroup}>
                <span style={styles.inputIcon} aria-hidden="true">&#128100;</span>
                <input type="text" placeholder="First Name" autoComplete="given-name" required style={styles.input} disabled={loading} value={firstName} onChange={(e) => setFirstName(sanitizeNameInput(e.target.value))} />
              </div>
            </div>

            <div style={styles.field}>
              <div style={styles.inputGroup}>
                <span style={styles.inputIcon} aria-hidden="true">&#128100;</span>
                <input type="text" placeholder="Middle Name" autoComplete="additional-name" style={styles.input} disabled={loading} value={middleName} onChange={(e) => setMiddleName(sanitizeNameInput(e.target.value))} />
              </div>
            </div>

            <div style={styles.field}>
              <div style={styles.inputGroup}>
                <span style={styles.inputIcon} aria-hidden="true">&#128100;</span>
                <input type="text" placeholder="Last Name" autoComplete="family-name" required style={styles.input} disabled={loading} value={lastName} onChange={(e) => setLastName(sanitizeNameInput(e.target.value))} />
              </div>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <div style={styles.inputGroup}>
                <span style={styles.inputIcon} aria-hidden="true">&#9993;</span>
                <input type="email" placeholder="Email" autoComplete="email" required style={styles.input} disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div style={styles.field}>
              <div style={styles.inputGroup}>
                <span style={styles.inputIcon} aria-hidden="true">&#128222;</span>
                <input type="tel" placeholder="Phone" autoComplete="tel" required style={styles.input} disabled={loading} value={phone} onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))} />
              </div>
            </div>
          </div>

          <div style={{ ...styles.inputGroup, marginBottom: '20px' }}>
            <span style={styles.inputIcon} aria-hidden="true">&#128100;</span>
            <input type="text" placeholder="Username" autoComplete="username" required minLength="3" style={styles.input} disabled={loading} value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <div style={styles.inputGroup}>
                <span style={styles.inputIcon} aria-hidden="true">&#128274;</span>
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  required
                  minLength="6"
                  style={styles.input}
                  disabled={loading}
                  value={password}
                  onFocus={() => setShowPasswordChecklist(true)}
                  onBlur={() => setShowPasswordChecklist(password.length > 0)}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {showPasswordChecklist && (
                <div style={styles.checklist}>
                  <p style={styles.checklistTitle}>Password must have:</p>
                  <div style={{ ...styles.checklistItem, ...(hasMinPasswordLength ? styles.checklistValid : styles.checklistInvalid) }}>
                    <span style={styles.checklistIcon}>{hasMinPasswordLength ? '✓' : '•'}</span>
                    At least 6 characters
                  </div>
                  <div style={{ ...styles.checklistItem, ...(hasPasswordNumber ? styles.checklistValid : styles.checklistInvalid) }}>
                    <span style={styles.checklistIcon}>{hasPasswordNumber ? '✓' : '•'}</span>
                    At least 1 number
                  </div>
                  <div style={{ ...styles.checklistItem, ...(hasPasswordSpecial ? styles.checklistValid : styles.checklistInvalid) }}>
                    <span style={styles.checklistIcon}>{hasPasswordSpecial ? '✓' : '•'}</span>
                    At least 1 special character
                  </div>
                </div>
                )}
              </div>
            </div>

            <div style={styles.field}>
              <div style={styles.inputGroup}>
                <span style={styles.inputIcon} aria-hidden="true">&#128274;</span>
                <input type="password" placeholder="Confirm Password" autoComplete="new-password" required minLength="6" style={styles.input} disabled={loading} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
          </div>

          <button type="submit" style={styles.signupBtn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cantata+One&display=swap');

        input:focus {
          border-color: #3030cc !important;
          outline: none;
        }

        button:hover:not(:disabled) {
          background-color: #1f1f8a !important;
        }
      `}</style>
    </div>
  );
};

export default Signup;
