import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { useVehicles } from '../context/VehicleContext';
import easyPickupIcon from '../assets/images/easypickup.png';
import affordableIcon from '../assets/images/affordable.png';
import approvedIcon from '../assets/images/approved.png';

const LandingPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState('signUp');
  const [modalActive, setModalActive] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const { getActiveVehicles } = useVehicles();
  
  useEffect(() => {
    // Fetch real vehicles from context
    const activeCars = getActiveVehicles();
    setCars(activeCars);
    setLoading(false);
  }, [getActiveVehicles]);

  const handleRentCar = (car) => {
    // In a real app, this would navigate to booking page
    console.log('Rent car:', car);
  };

  const openModal = (mode) => {
    setModalMode(mode);
    setModalActive(true);
    setErrors({});
    setFormData({ fullName: '', email: '', password: '' });
  };

  const closeModal = () => {
    setModalActive(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (modalMode === 'signUp') {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required.';
      } else if (formData.fullName.trim().length < 3) {
        newErrors.fullName = 'Full name must be at least 3 characters.';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (modalMode === 'signUp') {
      alert(`Sign Up successful!\nName: ${formData.fullName}\nEmail: ${formData.email}`);
    } else {
      alert(`Log In successful!\nEmail: ${formData.email}`);
    }
    closeModal();
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text-wrapper">
          <h1>Find the Perfect Car<br />for Your Next Trip</h1>
          <p>Explore a wide range of vehicles at affordable rates<br />Book now and hit the road!!</p>
        </div>

        {/* Icons textual overlays */}
        <div className="hero-icon-text easy-pickup" title="Easy Pickup">
          <img src={easyPickupIcon} alt="Easy Pickup" />
          Easy Pickup
        </div>
        <div className="hero-icon-text affordable" title="Affordable">
          <img src={affordableIcon} alt="Affordable" />
          Affordable
        </div>
        <div className="hero-icon-text passed-inspection" title="Passed inspection">
          <img src={approvedIcon} alt="Passed inspection" />
          Passed inspection
        </div>

      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-box">
          <div className="feature-icon" title="Wide Selection of Cars">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
              <path d="M544 192h-16l-32-96H144l-32 96H96c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32h16c0 44.11 35.89 80 80 80s80-35.89 80-80h128c0 44.11 35.89 80 80 80s80-35.89 80-80h16c17.67 0 32-14.33 32-32V224c0-17.67-14.33-32-32-32zM144 320c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48zm352 0c-26.47 0-48-21.53-48-48s21.53-48 48-48 48 21.53 48 48-21.53 48-48 48z"></path>
            </svg>
          </div>
          <div className="feature-info">
            <h3>Wide Selection of Cars</h3>
            <p>Choose from a variety of vehicles</p>
          </div>
        </div>
        <div className="feature-box">
          <div className="feature-icon" title="Affordable Rates">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="dollar-sign" className="svg-inline--fa fa-dollar-sign" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 512">
              <path d="M209.3 233.4c3.7-29-14.9-55.9-47.6-62.6v-38.4c0-8.8-7.2-16-16-16s-16 7.2-16 16v38.5c-32.5 5.4-55.4 31.3-53.3 62 .8 14.9 11 28.1 26.6 34.4l23.1 10.8h-11.8c-13 0-24 11-24 24s11 24 24 24h46c8.8 0 16-7.2 16-16s-7.2-16-16-16h-44.5l-7.2-3.4c-15.4-7.3-23.6-25.6-19-42.6 5.6-22.7 26.5-30.9 45.6-30.8 33.5.2 58.3 20.4 58.5 50.9.1 18.2-9.3 31.7-26.6 38.9l-22 10.6v36.8c0 8.8 7.2 16 16 16s16-7.2 16-16v-36.3c33-5.6 56.1-32.7 51.4-63.6zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32 14.3 32 32 32 32-14.3 32-32z"></path>
            </svg>
          </div>
          <div className="feature-info">
            <h3>Affordable Rates</h3>
            <p>Get the best deals on top quality cars</p>
          </div>
        </div>
        <div className="feature-box">
          <div className="feature-icon" title="Flexible Booking">
            <svg xmlns="http://www.w3.org/2000/svg" fill="#368de0" viewBox="0 0 512 512">
              <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm68.9 354.1a12 12 0 01-17 0l-75.3-75V344a12 12 0 01-24 0v-128a12 12 0 0124 0v68.9l74.6 74.5a12 12 0 010 17z"></path>
            </svg>
          </div>
          <div className="feature-info">
            <h3>Flexible Booking</h3>
            <p>Modify or cancel your reservation with ease</p>
          </div>
        </div>
      </section>

      {/* Popular Cars Section */}
      <section className="popular-section">
        <h2>Most Popular Cars</h2>
        <p>Browse our best deals on the most popular rental cars</p>
        
        {loading ? (
          <div className="loading">Loading cars...</div>
        ) : (
          <div className="cars-cards" role="list">
            {cars.map(car => (
              <CarCard 
                key={car.id} 
                car={car} 
                onRent={handleRentCar}
              />
            ))}
          </div>
        )}
      </section>



      {/* SignUp / LogIn Modal */}
      <div className={`modal-overlay ${modalActive ? 'active' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modalTitle" onClick={(e) => e.target === e.currentTarget && closeModal()}>
        <div className="modal" role="document">
          <h2 id="modalTitle">{modalMode === 'signUp' ? 'Sign Up' : 'Log In'}</h2>
          <form id="authForm" onSubmit={handleSubmit} noValidate>
            {modalMode === 'signUp' && (
              <>
                <label htmlFor="fullName">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required 
                  minLength="3" 
                  placeholder="Enter your full name" 
                />
                <div className="error-msg" id="fullNameError" aria-live="assertive">
                  {errors.fullName || ''}
                </div>
              </>
            )}

            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleInputChange}
              required 
              placeholder="Enter your email" 
            />
            <div className="error-msg" id="emailError" aria-live="assertive">
              {errors.email || ''}
            </div>

            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleInputChange}
              required 
              minLength="6" 
              placeholder="Enter your password" 
            />
            <div className="error-msg" id="passwordError" aria-live="assertive">
              {errors.password || ''}
            </div>

            <div className="modal-buttons">
              <button type="submit" className="modal-submit">
                {modalMode === 'signUp' ? 'Sign Up' : 'Log In'}
              </button>
              <button type="button" className="modal-cancel" onClick={closeModal}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
