import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';

const Payments = () => {
  const { user, isAuthenticated } = useAuth();
  const { getUserPayments, processPayment, getUserBookings } = useBookings();
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showReceipt, setShowReceipt] = useState(null);

  useEffect(() => {
    if (user?.id) {
      const userPayments = getUserPayments(user.id);
      const userBookings = getUserBookings(user.id);
      setPayments(userPayments);
      setBookings(userBookings);
    }
    setLoading(false);
  }, [user, getUserPayments, getUserBookings]);

  // Get bookings that need payment (approved but not paid)
  const pendingPayments = bookings.filter(b => 
    b.status === 'Approved' && !payments.find(p => p.bookingId === b.id)
  );

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const handlePayNow = (booking) => {
    const method = window.confirm('Press OK for Cash payment, Cancel for GCash payment') ? 'cash' : 'gcash';
    processPayment(booking.id, user.id, booking.totalPrice, method);
    
    // Refresh data
    const updatedPayments = getUserPayments(user.id);
    setPayments(updatedPayments);
    
    alert(`Payment processed via ${method === 'cash' ? 'Cash' : 'GCash'}! Receipt generated.`);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: { background: '#10b981', color: 'white' },
      pending: { background: '#f59e0b', color: 'white' },
      refunded: { background: '#6b7280', color: 'white' },
      failed: { background: '#ef4444', color: 'white' }
    };
    const style = statusClasses[status] || statusClasses.completed;
    return (
      <span style={{...styles.statusBadge, ...style}}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const totalSpent = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalPending = pendingPayments.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div style={styles.container}>
      <Navbar />
      <Sidebar />
      
      <div style={styles.dashboardContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Payments</h1>
          <p style={styles.pageSubtitle}>View your payment history and manage transactions</p>
        </div>

        {/* Pending Payments Section */}
        {pendingPayments.length > 0 && (
          <div style={styles.pendingSection}>
            <h2 style={styles.pendingTitle}>⚠️ Pending Payments</h2>
            <div style={styles.pendingList}>
              {pendingPayments.map(booking => (
                <div key={booking.id} style={styles.pendingCard}>
                  <div style={styles.pendingInfo}>
                    <strong>{booking.carName}</strong>
                    <span>Booking: {booking.id.slice(-6).toUpperCase()}</span>
                    <span>₱{booking.totalPrice?.toLocaleString()}</span>
                  </div>
                  <button style={styles.payNowBtn} onClick={() => handlePayNow(booking)}>
                    Pay Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Stats */}
        <div style={styles.paymentStats}>
          <div style={styles.paymentStatCard}>
            <div style={styles.statIcon}>💵</div>
            <div style={styles.statDetails}>
              <h3>₱{totalSpent.toLocaleString()}</h3>
              <p>Total Paid</p>
            </div>
          </div>
          
          <div style={styles.paymentStatCard}>
            <div style={styles.statIcon}>⏳</div>
            <div style={styles.statDetails}>
              <h3>₱{totalPending.toLocaleString()}</h3>
              <p>Pending Payments</p>
            </div>
          </div>
          
          <div style={styles.paymentStatCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={styles.statDetails}>
              <h3>{payments.length}</h3>
              <p>Total Transactions</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {['all', 'completed', 'pending'].map(f => (
            <button 
              key={f}
              style={{
                ...styles.filterTab,
                ...(filter === f ? styles.filterTabActive : {})
              }}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({payments.filter(p => f === 'all' || p.status === f).length})
            </button>
          ))}
        </div>

        {/* Payments List */}
        {loading ? (
          <div style={styles.loading}>Loading payments...</div>
        ) : filteredPayments.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No payments found. Make a booking to see payments here.</p>
          </div>
        ) : (
          <div style={styles.paymentsList}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Car</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment.id} style={styles.tr}>
                    <td style={styles.td}>{formatDate(payment.paidAt)}</td>
                    <td style={styles.td}>
                      <div style={styles.paymentCar}>
                        <strong>{payment.carName || 'N/A'}</strong>
                        <span style={styles.bookingId}>Receipt: {payment.receiptNumber}</span>
                      </div>
                    </td>
                    <td style={{...styles.td, fontWeight: 'bold'}}>₱{payment.amount?.toLocaleString()}</td>
                    <td style={styles.td}>
                      {payment.method === 'cash' ? '💵 Cash' : '📱 GCash'}
                    </td>
                    <td style={styles.td}>{getStatusBadge(payment.status)}</td>
                    <td style={styles.td}>
                      <button 
                        style={styles.btnPrimary}
                        onClick={() => setShowReceipt(payment)}
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div style={styles.receiptOverlay} onClick={() => setShowReceipt(null)}>
          <div style={styles.receipt} onClick={e => e.stopPropagation()}>
            <div style={styles.receiptHeader}>
              <h2 style={styles.receiptTitle}>🧾 Official Receipt</h2>
              <p style={styles.receiptNumber}>{showReceipt.receiptNumber}</p>
            </div>
            
            <div style={styles.receiptBody}>
              <div style={styles.receiptRow}>
                <span>Date:</span>
                <strong>{formatDate(showReceipt.paidAt)}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Customer:</span>
                <strong>{showReceipt.userName || user?.name}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Vehicle:</span>
                <strong>{showReceipt.carName}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Booking ID:</span>
                <strong>{showReceipt.bookingId?.slice(-6).toUpperCase()}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Payment Method:</span>
                <strong>{showReceipt.method === 'cash' ? 'Cash upon Pickup' : 'GCash'}</strong>
              </div>
              
              <div style={styles.receiptDivider}></div>
              
              <div style={styles.receiptTotal}>
                <span>Total Amount Paid:</span>
                <strong>₱{showReceipt.amount?.toLocaleString()}</strong>
              </div>
              
              <div style={styles.receiptStatus}>
                <span>Status:</span>
                <span style={styles.paidBadge}>PAID</span>
              </div>
            </div>
            
            <div style={styles.receiptFooter}>
              <p>Thank you for choosing our car rental service!</p>
              <p style={styles.receiptNote}>This is an official receipt. Please keep this for your records.</p>
            </div>
            
            <button style={styles.closeReceiptBtn} onClick={() => setShowReceipt(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inria+Serif&display=swap'); * { box-sizing: border-box; }`}</style>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #e9eefb, #f9fbfe)', fontFamily: 'Inria Serif, serif' },
  dashboardContent: { marginLeft: '250px', marginTop: '60px', padding: '30px', overflowY: 'auto' },
  pageHeader: { marginBottom: '20px' },
  pageTitle: { color: '#121253', fontSize: '28px', fontWeight: '700', margin: '0 0 5px 0' },
  pageSubtitle: { color: '#555', fontSize: '14px', margin: 0 },
  pendingSection: { background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
  pendingTitle: { margin: '0 0 15px', fontSize: '18px', color: '#856404' },
  pendingList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  pendingCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '15px', borderRadius: '8px' },
  pendingInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  payNowBtn: { background: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inria Serif, serif' },
  paymentStats: { display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' },
  paymentStatCard: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)', display: 'flex', alignItems: 'center', gap: '15px', flex: '1', minWidth: '200px' },
  statIcon: { fontSize: '30px' },
  statDetails: { color: '#121253' },
  filterTabs: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  filterTab: { padding: '10px 20px', border: 'none', background: '#e9eefb', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', color: '#555', fontFamily: 'Inria Serif, serif' },
  filterTabActive: { background: '#3f42c7', color: 'white' },
  loading: { textAlign: 'center', padding: '40px', color: '#555' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#555', background: 'white', borderRadius: '8px' },
  paymentsList: { background: 'white', borderRadius: '8px', boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px', textAlign: 'left', background: '#f8f9fa', color: '#555', fontWeight: '600', fontSize: '14px' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '15px', fontSize: '14px', color: '#555' },
  paymentCar: { display: 'flex', flexDirection: 'column' },
  bookingId: { fontSize: '12px', color: '#888' },
  statusBadge: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  btnPrimary: { background: '#3f42c7', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', fontFamily: 'Inria Serif, serif' },
  receiptOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  receipt: { background: 'white', borderRadius: '12px', padding: '30px', width: '90%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto' },
  receiptHeader: { textAlign: 'center', borderBottom: '2px dashed #ddd', paddingBottom: '20px', marginBottom: '20px' },
  receiptTitle: { margin: '0 0 10px', fontSize: '24px' },
  receiptNumber: { margin: 0, color: '#666', fontSize: '14px' },
  receiptBody: { marginBottom: '20px' },
  receiptRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
  receiptDivider: { height: '2px', background: '#ddd', margin: '20px 0' },
  receiptTotal: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '18px', fontWeight: '700' },
  receiptStatus: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' },
  paidBadge: { background: '#28a745', color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: '600', fontSize: '14px' },
  receiptFooter: { textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '15px' },
  receiptNote: { fontSize: '12px', color: '#666', margin: '10px 0 0' },
  closeReceiptBtn: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inria Serif, serif' },
};

export default Payments;
