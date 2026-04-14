import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import { useBookings } from '../context/BookingContext';
import { useVehicles } from '../context/VehicleContext';

// Simple chart component without external library
const SimpleChart = ({ data, chartType }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '250px', padding: '20px 10px' }}>
      {data.map((item, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div style={{ 
            width: '40px', 
            height: `${(item.value / maxValue) * 180}px`, 
            backgroundColor: chartType === 'revenue' ? '#2846e3' : '#28a745',
            borderRadius: '6px 6px 0 0',
            transition: 'height 0.3s ease',
            minHeight: item.value > 0 ? '10px' : '0'
          }}></div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>{item.label}</span>
          <span style={{ fontSize: '11px', color: '#999' }}>
            {chartType === 'revenue' ? `₱${item.value.toLocaleString()}` : item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { getBookings, getPayments } = useBookings();
  const { vehicles } = useVehicles();
  const [stats, setStats] = useState({
    activeRentals: 0,
    vehiclesAvailable: 0,
    upcomingReservations: 0,
    totalEarnings: 0,
    totalBookings: 0,
    totalCustomers: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [chartType, setChartType] = useState('weekly');

  // Get real data from contexts
  const allBookings = useMemo(() => getBookings(), [getBookings]);
  const allPayments = useMemo(() => getPayments(), [getPayments]);

  // Calculate monthly bookings from real data starting from March
  const monthlyBookingsData = useMemo(() => {
    const months = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // For weekly view, show last 7 days of bookings
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      const bookingsOnDay = allBookings.filter(booking => {
        const bookingDate = new Date(booking.pickupDate || booking.createdAt);
        return bookingDate.toDateString() === date.toDateString();
      });
      weekData.push({
        label: dayName,
        value: bookingsOnDay.length
      });
    }
    return weekData;
  }, [allBookings]);

  // Calculate monthly bookings for monthly view (starting March)
  const monthlyViewData = useMemo(() => {
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const currentYear = new Date().getFullYear();
    
    return months.map(month => {
      const monthIndex = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].indexOf(month);
      const bookingsInMonth = allBookings.filter(booking => {
        const bookingDate = new Date(booking.pickupDate || booking.createdAt);
        return bookingDate.getMonth() === monthIndex + 2 && bookingDate.getFullYear() === currentYear;
      });
      return {
        label: month,
        value: bookingsInMonth.length
      };
    });
  }, [allBookings]);

  // Calculate monthly revenue from real payments
  const monthlyRevenueData = useMemo(() => {
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const currentYear = new Date().getFullYear();
    
    return months.map(month => {
      const monthIndex = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].indexOf(month);
      const paymentsInMonth = allPayments.filter(payment => {
        const paymentDate = new Date(payment.paidAt || payment.createdAt);
        return paymentDate.getMonth() === monthIndex + 2 && 
               paymentDate.getFullYear() === currentYear && 
               payment.status === 'Completed';
      });
      const revenue = paymentsInMonth.reduce((sum, p) => sum + (p.amount || 0), 0);
      return {
        label: month,
        value: revenue
      };
    });
  }, [allPayments]);

  useEffect(() => {
    // Calculate statistics
    const activeRentals = allBookings.filter(b => b.status === 'Approved').length;
    const vehiclesAvailable = vehicles.filter(v => v.status === 'active').length;
    const upcomingReservations = allBookings.filter(b => b.status === 'Pending').length;
    const completedPayments = allPayments.filter(p => p.status === 'Completed');
    const totalEarnings = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Get unique customers
    const uniqueCustomers = new Set(allBookings.map(b => b.userId)).size;
    
    setStats({
      activeRentals,
      vehiclesAvailable,
      upcomingReservations,
      totalEarnings,
      totalBookings: allBookings.length,
      totalCustomers: uniqueCustomers
    });
    
    // Get recent bookings (last 5)
    const sorted = [...allBookings].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    }).slice(0, 5);
    setRecentBookings(sorted);
  }, [allBookings, allPayments, vehicles]);

  // Get chart data based on type
  const chartData = useMemo(() => {
    if (chartType === 'weekly') {
      return monthlyBookingsData;
    } else {
      return monthlyViewData;
    }
  }, [chartType, monthlyBookingsData, monthlyViewData]);

  const formatBookingId = (value) => {
    if (value === undefined || value === null || value === '') {
      return 'N/A';
    }
    return String(value).slice(-6).toUpperCase();
  };

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <AdminSidebar />
      
      <main className="responsive-main" style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <h2 style={styles.pageTitle}>Dashboard Summary</h2>

          {/* Cards Row */}
          <div style={styles.cardsRow}>
            <div style={styles.card} aria-label={`Active Rentals ${stats.activeRentals}`}>
              <div style={styles.cardIconBg}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2846e3" strokeWidth="2" style={styles.cardIcon}>
                  <path d="M4 6h16v9h2v1h-1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4H2v-1h2V6Z"/>
                </svg>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.cardValue}>{stats.activeRentals}</div>
                <div style={styles.cardTitle}>Active Rentals</div>
              </div>
            </div>
            
            <div style={styles.card} aria-label={`Vehicles Available ${stats.vehiclesAvailable}`}>
              <div style={{...styles.cardIconBg, backgroundColor: '#fff3e0'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2" style={styles.cardIcon}>
                  <path d="M3 11v6a3 3 0 0 0 6 0v-6H3Zm14 0v6a3 3 0 0 0 6 0v-6h-6ZM3 18v2h18v-2H3Z"/>
                </svg>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.cardValue}>{stats.vehiclesAvailable}</div>
                <div style={styles.cardTitle}>Vehicles Available</div>
              </div>
            </div>
            
            <div style={styles.card} aria-label={`Upcoming Reservations ${stats.upcomingReservations}`}>
              <div style={{...styles.cardIconBg, backgroundColor: '#e8f5e9'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" style={styles.cardIcon}>
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.cardValue}>{stats.upcomingReservations}</div>
                <div style={styles.cardTitle}>Upcoming Reservations</div>
              </div>
            </div>
            
            <div style={{...styles.card, ...styles.earningsCard}} aria-label={`Total Earnings ${stats.totalEarnings} Philippine Peso`}>
              <div style={{...styles.cardIconBg, backgroundColor: '#e8f5e9'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#22822d" strokeWidth="2" style={styles.cardIcon}>
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div style={styles.cardContent}>
                <div style={{...styles.cardValue, color: '#22822d'}}>₱{stats.totalEarnings.toLocaleString()}</div>
                <div style={styles.cardTitle}>Total Earnings</div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div style={styles.chartSection}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>📊 Rental Statistics (Starting March {new Date().getFullYear()})</h3>
              <div style={styles.chartTabs}>
                <button 
                  style={chartType === 'weekly' ? {...styles.chartTab, ...styles.chartTabActive} : styles.chartTab}
                  onClick={() => setChartType('weekly')}
                >
                  Weekly
                </button>
                <button 
                  style={chartType === 'monthly' ? {...styles.chartTab, ...styles.chartTabActive} : styles.chartTab}
                  onClick={() => setChartType('monthly')}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div style={styles.chartContainer}>
              <SimpleChart data={chartData} chartType="bookings" />
            </div>
          </div>

          {/* Stats and Recent Bookings */}
          <div style={styles.statsSection}>
            <section style={styles.statsContainer} aria-label="Quick Stats">
              <div style={styles.quickStats}>
                <div style={styles.quickStat}>
                  <span style={styles.quickStatValue}>{stats.totalBookings}</span>
                  <span style={styles.quickStatLabel}>Total Bookings</span>
                </div>
                <div style={styles.quickStat}>
                  <span style={{...styles.quickStatValue, color: '#2846e3'}}>{stats.totalCustomers}</span>
                  <span style={styles.quickStatLabel}>Total Customers</span>
                </div>
                <div style={styles.quickStat}>
                  <span style={{...styles.quickStatValue, color: '#ff9800'}}>{vehicles.length}</span>
                  <span style={styles.quickStatLabel}>Total Vehicles</span>
                </div>
              </div>
            </section>

            <aside style={styles.recentBookings} aria-label="Recent Bookings Summary">
              <h3 style={styles.recentTitle}>📋 Recent Bookings</h3>
              {recentBookings.length === 0 ? (
                <div style={styles.noBookings}>No recent bookings</div>
              ) : (
                recentBookings.map(booking => (
                  <div key={booking.id} style={styles.bookingDetails} aria-live="polite">
                    <div style={styles.bookingHeader}>
                      <span style={styles.bookingId}>#{formatBookingId(booking.id)}</span>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: booking.status === 'Approved' ? '#28a745' : 
                          booking.status === 'Pending' ? '#ffc107' : 
                          booking.status === 'Completed' ? '#17a2b8' : '#dc3545'
                      }}>{booking.status || 'Pending'}</span>
                    </div>
                    <div style={styles.bookingInfo}>
                      <span>🚗 {booking.carName || 'N/A'}</span>
                      <span>👤 {booking.userName || 'Unknown User'}</span>
                      <span>💰 ₱{booking.totalPrice?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </aside>
          </div>

        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inria+Serif:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'Inria Serif, serif' },
  mainContent: { flex: 1, marginLeft: '250px', marginTop: '60px', padding: '20px' },
  contentWrapper: { maxWidth: '1200px', margin: '0 auto' },
  pageTitle: { marginBottom: '24px', fontWeight: '700', fontSize: '28px', color: '#1a1a2e' },
  cardsRow: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' },
  card: { flex: '1 1 220px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' },
  cardIconBg: { width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#e8effc', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardIcon: { width: '28px', height: '28px' },
  cardContent: { flex: 1 },
  cardValue: { fontSize: '28px', fontWeight: '700', color: '#2846e3', lineHeight: 1.2 },
  cardTitle: { fontSize: '13px', color: '#666', marginTop: '4px', fontWeight: '600' },
  earningsCard: {},
  chartSection: { background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px', marginBottom: '24px' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  chartTitle: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a1a2e' },
  chartTabs: { display: 'flex', gap: '8px' },
  chartTab: { padding: '8px 20px', borderRadius: '20px', border: 'none', background: '#f0f0f0', color: '#666', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inria Serif, serif', transition: 'all 0.2s' },
  chartTabActive: { background: '#2846e3', color: '#fff' },
  chartContainer: { height: '280px', position: 'relative' },
  statsSection: { display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' },
  statsContainer: { flex: '1 1 300px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px' },
  quickStats: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  quickStat: { flex: '1 1 100px', textAlign: 'center', padding: '15px', borderRadius: '12px', background: '#f8f9fa' },
  quickStatValue: { display: 'block', fontSize: '32px', fontWeight: '700', color: '#28a745' },
  quickStatLabel: { fontSize: '12px', color: '#666', fontWeight: '600', marginTop: '4px' },
  recentBookings: { flex: '1 1 350px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px' },
  recentTitle: { margin: '0 0 16px', fontSize: '20px', fontWeight: '700', color: '#1a1a2e' },
  noBookings: { textAlign: 'center', padding: '30px', color: '#999' },
  bookingDetails: { padding: '12px', borderRadius: '10px', background: '#f8f9fa', marginBottom: '10px' },
  bookingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  bookingId: { fontWeight: '700', color: '#2846e3', fontSize: '14px' },
  statusBadge: { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', color: '#fff' },
  bookingInfo: { display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#555' },
  infoRow: { marginTop: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px 30px', display: 'flex', gap: '30px', justifyContent: 'space-between', flexWrap: 'wrap' },
  infoBox: { display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 250px' },
  infoIconBox: { width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
  infoText: { display: 'flex', flexDirection: 'column' },
};

export default AdminDashboard;
