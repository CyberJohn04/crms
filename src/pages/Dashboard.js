import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import InfoRow from '../components/InfoRow';

const Dashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 5,
    activeRentals: 1,
    totalSpent: 12000,
    completedReturns: 4
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const userName = user?.name || 'Dennis Gresola';

  return (
    <div style={styles.container}>
      <Navbar />
      <Sidebar />
      
      <div style={styles.dashboardContent}>
        {/* Cards Row */}
        <section style={styles.cardsRow} aria-label="Highlights">
          <div style={styles.card} aria-labelledby="currentRentalTitle">
            <h3 id="currentRentalTitle" style={styles.cardTitle}>Current Rental</h3>
            <div style={styles.cardValue}>
              <img src="https://www.autoindustriya.com/cdn-cgi/image/width=540,quality=50/images/new-cars/Toyota/2022_Camry-1.jpg" alt="Toyota Camry" style={styles.cardCarImg} />
              Toyota Camry
            </div>
          </div>

          <div style={styles.card} aria-labelledby="nextReservationTitle">
            <h3 id="nextReservationTitle" style={styles.cardTitle}>Next Reservation</h3>
            <div style={styles.cardValue}>
              <img src="https://imgcdnblog.carmudi.com.ph/wp-content/uploads/2021/07/14150638/Toyota-Wigo-2.jpg" alt="Toyota Wigo" style={styles.cardCarImg} />
              Toyota Wigo
            </div>
            <small style={{color: '#555'}}>May 15, 10:00 AM</small>
          </div>

          <div style={{...styles.card, justifyContent: 'center', fontSize: '22px', fontWeight: '700'}} aria-labelledby="rentalHistoryTitle">
            <h3 id="rentalHistoryTitle" style={styles.cardTitle}>Rental History</h3>
            <div style={styles.rentalHistoryValue} aria-label="Total rentals count">{stats.totalBookings}</div>
          </div>
        </section>

        {/* Rental Details and Upcoming Reservations */}
        <section style={styles.rentalSection}>
          <div style={styles.rentalDetails} aria-labelledby="rentalDetailsTitle">
            <div style={styles.rentalDetailsContent}>
              <h3 id="rentalDetailsTitle" style={styles.rentalDetailsTitle}>Rental Details</h3>
              <div style={styles.rentalInfo}>
                <p><strong>Pickup:</strong> April 24, 2026 | 10:00 AM</p>
                <p><strong>Return:</strong> April 28, 2026 | 11:00 AM</p>
                <p><strong>Rental Cost:</strong> Php 12,000.00</p>
                <button type="button" style={styles.manageBtn} aria-label="Manage Rental">Manage Rental</button>
              </div>
            </div>
            <img src="https://www.autoindustriya.com/cdn-cgi/image/width=540,quality=50/images/new-cars/Toyota/2022_Camry-1.jpg" alt="Toyota Camry" style={styles.rentalCarImg} />
          </div>

          <div style={styles.upcomingReservations} aria-labelledby="upcomingReservationsTitle">
            <h3 id="upcomingReservationsTitle" style={styles.reservationTitle}>Upcoming Reservations</h3>
            <div style={styles.reservationInfo}>
              <img src="https://imgcdnblog.carmudi.com.ph/wp-content/uploads/2021/07/14150638/Toyota-Wigo-2.jpg" alt="Toyota Wigo" style={styles.reservationImg} />
              <strong>TOYOTA WIGO</strong>
              <span>May 15, 2026<br />10:00 AM</span>
            </div>
            <button type="button" style={styles.viewDetailsBtn} aria-label="View Details of upcoming reservation">View Details</button>
          </div>
        </section>

        {/* Footer Advantages */}
        <InfoRow />
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#EDFBFA',
  },
  dashboardContent: {
    marginLeft: '250px',
    marginTop: '60px',
    padding: '30px',
    overflowY: 'auto',
  },
  cardsRow: {
    display: 'flex',
    gap: '18px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    background: 'white',
    padding: '18px 25px',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)',
    flex: '1',
    minWidth: '220px',
    maxWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  cardTitle: {
    color: '#555',
    fontWeight: '600',
    marginBottom: '10px',
  },
  cardValue: {
    fontWeight: '700',
    fontSize: '20px',
    color: '#121253',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cardCarImg: {
    width: '70px',
    height: '40px',
    objectFit: 'contain',
    borderRadius: '4px',
    border: '1px solid #ececec',
  },
  rentalHistoryValue: {
    fontSize: '36px',
    color: '#121253',
  },
  rentalSection: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '30px',
    marginTop: '30px',
  },
  rentalDetails: {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)',
    display: 'flex',
    gap: '30px',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '900px',
    flex: '0 1 60%',
  },
  rentalDetailsContent: {
    flex: 1,
  },
  rentalDetailsTitle: {
    color: '#121253',
    marginBottom: '20px',
    fontWeight: '700',
  },
  rentalInfo: {
    fontSize: '15px',
    color: '#222',
  },
  rentalCarImg: {
    width: '240px',
    height: '140px',
    objectFit: 'cover',
    borderRadius: '8px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
  },
  manageBtn: {
    background: '#3f42c7',
    border: 'none',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '18px',
    transition: 'background-color 0.3s ease',
  },
  upcomingReservations: {
    background: 'white',
    padding: '20px 25px',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)',
    width: '270px',
    fontSize: '14px',
    color: '#222',
    flex: '0 1 32%',
  },
  reservationTitle: {
    color: '#2c47db',
    fontWeight: '600',
    marginBottom: '10px',
    fontSize: '16px',
  },
  reservationInfo: {
    marginBottom: '18px',
  },
  reservationImg: {
    width: '100%',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  viewDetailsBtn: {
    backgroundColor: '#2f3bc9',
    color: 'white',
    padding: '10px 18px',
    borderRadius: '6px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.3s ease',
  },
  footerAdvantages: {
    margin: '60px auto 30px',
    background: 'white',
    padding: '18px 30px',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    maxWidth: '920px',
  },
  advantage: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    maxWidth: '280px',
  },
  advantageIcon: {
    border: '2px solid #121253',
    color: '#121253',
    padding: '10px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
  },
  advantageText: {
    fontSize: '14px',
    color: '#121253',
  },
  iconSvg: {
    width: '22px',
    height: '22px',
    fill: 'currentColor',
  },
};

export default Dashboard;
