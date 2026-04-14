import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const ACTIVE_STATUSES = ['Approved', 'Returning'];
const UPCOMING_STATUSES = ['Pending', 'Approved', 'Completed', 'Returning'];

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatCurrency = (value) =>
  `PHP ${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getBookingImage = (booking) => booking?.carImage || 'https://via.placeholder.com/320x180?text=Vehicle';

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserBookings, getUserPayments, getUserReturns } = useBookings();
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      setBookings([]);
      setPayments([]);
      setReturns([]);
      return;
    }

    setBookings(getUserBookings(user.id));
    setPayments(getUserPayments(user.id));
    setReturns(getUserReturns(user.id));
  }, [user, getUserBookings, getUserPayments, getUserReturns]);

  const activeRental = useMemo(() => {
    return [...bookings]
      .filter((booking) => ACTIVE_STATUSES.includes(booking.status))
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0] || null;
  }, [bookings]);

  const nextReservation = useMemo(() => {
    const startOfToday = new Date(new Date().toDateString());

    return [...bookings]
      .filter((booking) => {
        if (!UPCOMING_STATUSES.includes(booking.status) || !booking.startDate) {
          return false;
        }

        return new Date(booking.startDate) >= startOfToday;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0] || null;
  }, [bookings]);

  const stats = useMemo(() => {
    const totalSpent = payments
      .filter((payment) => (payment.status || '').toLowerCase() === 'completed')
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return {
      totalBookings: bookings.length,
      activeRentals: bookings.filter((booking) => ACTIVE_STATUSES.includes(booking.status)).length,
      totalSpent,
      completedReturns: returns.filter((item) => item.status === 'Approved').length,
    };
  }, [bookings, payments, returns]);

  return (
    <div style={styles.container}>
      <Navbar />
      <Sidebar />

      <div className="responsive-dashboard" style={styles.dashboardContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Welcome back, {user?.name || 'Customer'}</h1>
          <p style={styles.pageSubtitle}>This dashboard now reflects your live bookings, payments, and return activity.</p>
        </div>

        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total Bookings</span>
            <strong style={styles.statValue}>{stats.totalBookings}</strong>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Active Rentals</span>
            <strong style={styles.statValue}>{stats.activeRentals}</strong>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total Spent</span>
            <strong style={styles.statValue}>{formatCurrency(stats.totalSpent)}</strong>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Completed Returns</span>
            <strong style={styles.statValue}>{stats.completedReturns}</strong>
          </div>
        </section>

        <section style={styles.contentGrid}>
          <article style={styles.panel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Current Rental</h2>
              <Link to="/my-bookings" style={styles.linkButton}>View bookings</Link>
            </div>

            {activeRental ? (
              <div style={styles.panelBody}>
                <img src={getBookingImage(activeRental)} alt={activeRental.carName} style={styles.mainImage} />
                <div style={styles.panelDetails}>
                  <strong style={styles.vehicleName}>{activeRental.carName}</strong>
                  <span style={styles.meta}>Pickup: {formatDate(activeRental.startDate)}</span>
                  <span style={styles.meta}>Return: {formatDate(activeRental.endDate)}</span>
                  <span style={styles.meta}>Status: {activeRental.status}</span>
                  <span style={styles.price}>{formatCurrency(activeRental.totalPrice)}</span>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No active rental right now.</p>
                <Link to="/browse-cars" style={styles.primaryButton}>Browse vehicles</Link>
              </div>
            )}
          </article>

          <article style={styles.sidePanel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Next Reservation</h2>
              <Link to="/browse-cars" style={styles.linkButton}>Reserve</Link>
            </div>

            {nextReservation ? (
              <div style={styles.sidePanelBody}>
                <img src={getBookingImage(nextReservation)} alt={nextReservation.carName} style={styles.sideImage} />
                <strong style={styles.vehicleName}>{nextReservation.carName}</strong>
                <span style={styles.meta}>{formatDate(nextReservation.startDate)}</span>
                <span style={styles.meta}>Status: {nextReservation.status}</span>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No upcoming reservation yet.</p>
                <Link to="/browse-cars" style={styles.primaryButton}>Make a booking</Link>
              </div>
            )}
          </article>
        </section>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#edfbfa',
  },
  dashboardContent: {
    marginLeft: '250px',
    marginTop: '60px',
    padding: '30px',
    overflowY: 'auto',
  },
  pageHeader: {
    marginBottom: '24px',
  },
  pageTitle: {
    margin: 0,
    color: '#121253',
    fontSize: '30px',
    fontWeight: '700',
  },
  pageSubtitle: {
    margin: '8px 0 0',
    color: '#475467',
    fontSize: '15px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '18px',
    marginBottom: '28px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)',
  },
  statLabel: {
    display: 'block',
    color: '#667085',
    fontSize: '14px',
    marginBottom: '10px',
  },
  statValue: {
    color: '#121253',
    fontSize: '26px',
    fontWeight: '700',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
    gap: '24px',
    alignItems: 'start',
  },
  panel: {
    background: '#fff',
    borderRadius: '10px',
    padding: '24px',
    boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)',
  },
  sidePanel: {
    background: '#fff',
    borderRadius: '10px',
    padding: '24px',
    boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '18px',
  },
  panelTitle: {
    margin: 0,
    color: '#121253',
    fontSize: '20px',
    fontWeight: '700',
  },
  linkButton: {
    color: '#3f42c7',
    textDecoration: 'none',
    fontWeight: '600',
  },
  panelBody: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sidePanelBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  mainImage: {
    width: '280px',
    maxWidth: '100%',
    height: '170px',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  sideImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '8px',
  },
  panelDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '220px',
    flex: 1,
  },
  vehicleName: {
    color: '#111827',
    fontSize: '22px',
    fontWeight: '700',
  },
  meta: {
    color: '#4b5563',
    fontSize: '14px',
  },
  price: {
    color: '#237643',
    fontWeight: '700',
    fontSize: '20px',
    marginTop: '6px',
  },
  emptyState: {
    padding: '8px 0 4px',
  },
  emptyText: {
    color: '#4b5563',
    marginBottom: '14px',
  },
  primaryButton: {
    display: 'inline-block',
    background: '#3f42c7',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default Dashboard;
