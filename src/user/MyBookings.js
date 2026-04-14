import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';

const MyBookings = () => {
  const { user, isAuthenticated } = useAuth();
  const { getUserBookings } = useBookings();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusTab, setSelectedStatusTab] = useState('All');
  const [currentSearch, setCurrentSearch] = useState('');

  useEffect(() => {
    if (user?.id) {
      const userBookings = getUserBookings(user.id);
      setBookings(userBookings);
    }
    setLoading(false);
  }, [user, getUserBookings]);

  const filterBookings = () => {
    const searchText = currentSearch.trim().toLowerCase();
    
    return bookings.filter(booking => {
      const bookingID = booking.id?.toString().toLowerCase() || '';
      const carModel = booking.carName?.toLowerCase() || '';
      
      const statusMatch = selectedStatusTab === 'All' || 
        (selectedStatusTab === 'Pending' && booking.status === 'Pending') ||
        (selectedStatusTab === 'Approved' && booking.status === 'Approved') ||
        (selectedStatusTab === 'Completed' && booking.status === 'Completed') ||
        (selectedStatusTab === 'Cancelled' && (booking.status === 'Cancelled' || booking.status === 'Not Approved'));
      
      const searchMatch = !searchText || 
        bookingID.includes(searchText) || 
        carModel.includes(searchText);
      
      return statusMatch && searchMatch;
    });
  };

  const filteredBookings = filterBookings();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatBookingId = (value) => {
    if (value === undefined || value === null || value === '') {
      return 'N/A';
    }
    return String(value).slice(-6).toUpperCase();
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending':
        return { bg: '#ffc107', color: '#000', text: 'Pending' };
      case 'Approved':
        return { bg: '#28a745', color: '#fff', text: 'Approved' };
      case 'Completed':
        return { bg: '#3a913f', color: '#fff', text: 'Completed' };
      case 'Cancelled':
      case 'Not Approved':
        return { bg: '#dc3545', color: '#fff', text: status };
      default:
        return { bg: '#6c757d', color: '#fff', text: status };
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg key={i} aria-hidden="true" viewBox="0 0 24 24" fill={i < rating ? "#ffc107" : "none"} stroke="#ffc107" strokeWidth="2" focusable="false" style={{width: '16px', height: '16px'}}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
    ));
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <Sidebar />
      
      <div className="responsive-dashboard" style={styles.dashboardContent}>
        <h2 style={styles.pageTitle}>My Bookings</h2>

        <div style={styles.filterBar}>
          <div style={styles.statusTabs}>
            {['All', 'Pending', 'Approved', 'Completed'].map(status => (
              <button
                key={status}
                type="button"
                style={selectedStatusTab === status ? styles.statusTabActive : styles.statusTabInactive}
                onClick={() => setSelectedStatusTab(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <input
            type="search"
            placeholder="Search by booking ID or car..."
            style={styles.searchInput}
            value={currentSearch}
            onChange={(e) => setCurrentSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={styles.loading}>Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No bookings found. Browse cars to make your first booking!</p>
          </div>
        ) : (
          <div style={styles.bookingsContainer}>
            {filteredBookings.map(booking => {
              const statusBadge = getStatusBadge(booking.status);
              return (
                <div key={booking.id} style={styles.bookingCard}>
                  <div style={styles.carImageContainer}>
                    <img src={booking.carImage || 'https://via.placeholder.com/130x90'} alt={booking.carName} style={styles.carImage} />
                  </div>
                  
                  <div style={styles.mainInfo}>
                    <div>
                      <strong style={styles.bookingId}>{formatBookingId(booking.id)}</strong>
                      <span style={styles.carModel}>{booking.carName}</span>
                    </div>
                    
                    <div style={styles.dateRange}>
                      <svg style={styles.icon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </div>
                    
                    <div style={styles.priceRow}>
                      <span>{booking.days || 1} day(s)</span>
                      <strong style={styles.price}>₱{booking.totalPrice?.toLocaleString() || 0}</strong>
                    </div>
                  </div>

                  <div style={styles.actions}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color
                    }}>
                      {statusBadge.text}
                    </span>
                    
                    {booking.remarks && (
                      <div style={styles.remarksBox}>
                        <small style={styles.remarksLabel}>Admin Remarks:</small>
                        <p style={styles.remarksText}>{booking.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#f9fcfd' },
  dashboardContent: { marginLeft: '250px', marginTop: '60px', padding: '30px', overflowY: 'auto' },
  pageTitle: { fontWeight: '600', fontSize: '24px', marginBottom: '15px', color: '#333' },
  filterBar: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', alignItems: 'center' },
  statusTabs: { display: 'flex', gap: '5px' },
  statusTabActive: { padding: '6px 14px', border: '1px solid #7971ea', backgroundColor: '#5751ea', color: 'white', fontWeight: '600', borderRadius: '4px', cursor: 'pointer' },
  statusTabInactive: { padding: '6px 14px', border: '1px solid #ccc', backgroundColor: 'white', color: '#555', fontWeight: '600', borderRadius: '4px', cursor: 'pointer' },
  searchInput: { padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '13px', width: '240px', color: '#666' },
  loading: { textAlign: 'center', padding: '40px', color: '#555' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#555', background: 'white', borderRadius: '8px' },
  bookingsContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  bookingCard: { background: 'white', borderRadius: '7px', border: '1px solid #ddd', display: 'flex', padding: '15px 20px', alignItems: 'center', gap: '20px', boxShadow: '2px 2px 10px #ccc', flexWrap: 'wrap' },
  carImageContainer: { flexShrink: 0 },
  carImage: { width: '130px', height: '90px', objectFit: 'cover', borderRadius: '6px' },
  mainInfo: { flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' },
  bookingId: { fontSize: '19px', fontWeight: '700', color: '#1a1a1a', marginRight: '8px' },
  carModel: { color: '#4c4c4c', fontWeight: '600' },
  dateRange: { fontSize: '13.5px', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '6px' },
  icon: { width: '16px', height: '16px', stroke: '#777' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: '18px', fontWeight: '700', color: '#28a745' },
  actions: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' },
  statusBadge: { padding: '6px 14px', borderRadius: '12px', fontWeight: '600', fontSize: '13px' },
  remarksBox: { background: '#f8f9fa', padding: '8px 12px', borderRadius: '6px', maxWidth: '250px' },
  remarksLabel: { fontWeight: '600', color: '#666', fontSize: '11px' },
  remarksText: { margin: '4px 0 0', fontSize: '12px', color: '#333' },
};

export default MyBookings;
