import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import InfoRow from '../components/InfoRow';
import { useBookings } from '../context/BookingContext';

const ManageBookings = () => {
  const { getBookings, updateBookingStatus, getPayments } = useBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState('');

  const allBookings = getBookings();
  const allPayments = getPayments();

  const filteredBookings = allBookings.filter(booking => {
    const matchesSearch = booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         booking.carName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || booking.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getPaymentForBooking = (bookingId) => {
    return allPayments.find(p => p.bookingId === bookingId);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setRemarks(booking.remarks || '');
    setShowModal(true);
  };

  const handleApprove = () => {
    if (selectedBooking) {
      updateBookingStatus(selectedBooking.id, 'Approved', remarks || 'Your booking has been approved!');
      setShowModal(false);
      setSelectedBooking(null);
    }
  };

  const handleNotApprove = () => {
    if (selectedBooking) {
      updateBookingStatus(selectedBooking.id, 'Not Approved', remarks || 'Your booking has not been approved.');
      setShowModal(false);
      setSelectedBooking(null);
    }
  };

  const handleComplete = () => {
    if (selectedBooking) {
      updateBookingStatus(selectedBooking.id, 'Completed', remarks || 'Booking completed successfully.');
      setShowModal(false);
      setSelectedBooking(null);
    }
  };

  const handleCancel = () => {
    if (selectedBooking) {
      updateBookingStatus(selectedBooking.id, 'Cancelled', remarks || 'Booking has been cancelled.');
      setShowModal(false);
      setSelectedBooking(null);
    }
  };

  const totalBookings = allBookings.length;
  const pendingBookings = allBookings.filter(b => b.status === 'Pending').length;
  const approvedBookings = allBookings.filter(b => b.status === 'Approved').length;
  const completedBookings = allBookings.filter(b => b.status === 'Completed').length;
  const totalRevenue = allBookings.filter(b => b.status === 'Completed' || b.status === 'Approved').reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <AdminSidebar />
      
      <main style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <h2 style={styles.pageTitle}>Manage Bookings</h2>

          {/* Summary Cards */}
          <div style={styles.summaryCards} aria-label="Booking summary">
            <div style={styles.card} aria-label={`${totalBookings} total bookings`}>
              <div style={styles.iconContainer}>
                <svg viewBox="0 0 24 24" style={styles.iconSvg}>
                  <path d="M3 10h18v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7z" fill="white"/>
                </svg>
              </div>
              <div style={styles.cardText}>
                <div style={styles.cardValue}>{totalBookings} <span style={styles.cardDesc}>Total Bookings</span></div>
              </div>
            </div>
            <div style={{...styles.card, backgroundColor: '#fff3cd'}} aria-label={`${pendingBookings} pending bookings`}>
              <div style={{...styles.iconContainer, backgroundColor: '#ffc107'}}>
                <svg viewBox="0 0 24 24" style={styles.iconSvg}>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
                  <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div style={styles.cardText}>
                <div style={{...styles.cardValue, color: '#856404'}}>{pendingBookings} <span style={styles.cardDesc}>Pending</span></div>
              </div>
            </div>
            <div style={{...styles.card, backgroundColor: '#d4edda'}} aria-label={`${approvedBookings} approved bookings`}>
              <div style={{...styles.iconContainer, backgroundColor: '#28a745'}}>
                <svg viewBox="0 0 24 24" style={styles.iconSvg}>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div style={styles.cardText}>
                <div style={{...styles.cardValue, color: '#28a745'}}>{approvedBookings} <span style={styles.cardDesc}>Approved</span></div>
              </div>
            </div>
            <div style={{...styles.card, backgroundColor: '#f8f9fa'}} aria-label={`₱${totalRevenue} total revenue`}>
              <div style={{...styles.iconContainer, backgroundColor: '#f79726'}}>
                <svg viewBox="0 0 24 24" style={styles.iconSvg}>
                  <path d="M12 3v18M7 8h10M7 16h10" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div style={styles.cardText}>
                <div style={{...styles.cardValue, color: '#f79726'}}>₱{totalRevenue.toLocaleString()}</div>
                <div style={styles.cardDesc}>Total Revenue</div>
              </div>
            </div>
          </div>

          {/* Filter Row */}
          <div style={styles.filterRow} role="search" aria-label="Filters and search bookings">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select} aria-label="Filter by status">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Not Approved">Not Approved</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input type="search" placeholder="Search by user or car..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} aria-label="Search bookings" />
          </div>

          {/* Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Car</th>
                  <th style={styles.th}>Dates</th>
                  <th style={styles.th}>Days</th>
                  <th style={styles.th}>Total Price</th>
                  <th style={styles.th}>Payment</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                      No bookings yet. Users will appear here after making a booking.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map(booking => {
                    const payment = getPaymentForBooking(booking.id);
                    return (
                      <tr key={booking.id} style={styles.tr}>
                        <td style={styles.td}>{booking.userName || 'N/A'}</td>
                        <td style={styles.td}>{booking.carName || 'N/A'}</td>
                        <td style={styles.td}>{booking.startDate} to {booking.endDate}</td>
                        <td style={styles.td}>{booking.days || 1}</td>
                        <td style={{...styles.td, ...styles.revenueCell}}>₱{booking.totalPrice?.toLocaleString() || 0}</td>
                        <td style={styles.td}>
                          {payment ? (
                            <span style={styles.paymentBadge}>
                              {payment.method === 'cash' ? '💵 Cash' : '📱 GCash'}
                            </span>
                          ) : (
                            <span style={styles.noPaymentBadge}>Not Paid</span>
                          )}
                        </td>
                        <td style={{...styles.td, ...styles.statusCell}}>
                          <span style={{
                            ...styles.statusBadge,
                            ...(booking.status === 'Approved' ? styles.statusApproved : 
                               booking.status === 'Pending' ? styles.statusPending :
                               booking.status === 'Not Approved' ? styles.statusNotApproved :
                               booking.status === 'Completed' ? styles.statusCompleted : styles.statusCancelled)
                          }}>
                            {booking.status || 'Pending'}
                          </span>
                        </td>
                        <td style={{...styles.td, ...styles.actionsCell}}>
                          <button style={styles.viewBtn} onClick={() => handleViewBooking(booking)}>👁️ View</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Info Row */}
          <InfoRow />
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedBooking && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Booking Details</h3>
            
            <div style={styles.detailSection}>
              <div style={styles.detailRow}><span style={styles.detailLabel}>User:</span><span style={styles.detailValue}>{selectedBooking.userName}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Car:</span><span style={styles.detailValue}>{selectedBooking.carName}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Start Date:</span><span style={styles.detailValue}>{formatDate(selectedBooking.startDate)}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>End Date:</span><span style={styles.detailValue}>{formatDate(selectedBooking.endDate)}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Days:</span><span style={styles.detailValue}>{selectedBooking.days}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Total Price:</span><span style={styles.detailValue}>₱{selectedBooking.totalPrice?.toLocaleString()}</span></div>
              
              {/* Payment Info */}
              {(() => {
                const payment = getPaymentForBooking(selectedBooking.id);
                return payment ? (
                  <>
                    <div style={styles.detailRow}><span style={styles.detailLabel}>Payment Method:</span><span style={styles.detailValue}>{payment.method === 'cash' ? '💵 Cash upon Pickup' : '📱 GCash'}</span></div>
                    <div style={styles.detailRow}><span style={styles.detailLabel}>Receipt #:</span><span style={styles.detailValue}>{payment.receiptNumber}</span></div>
                    <div style={styles.detailRow}><span style={styles.detailLabel}>Paid At:</span><span style={styles.detailValue}>{formatDate(payment.paidAt)}</span></div>
                  </>
                ) : (
                  <div style={styles.detailRow}><span style={styles.detailLabel}>Payment:</span><span style={{...styles.detailValue, color: '#dc3545'}}>Not Paid Yet</span></div>
                );
              })()}
              
              <div style={styles.detailRow}><span style={styles.detailLabel}>Status:</span><span style={{...styles.detailValue, color: selectedBooking.status === 'Approved' ? '#28a745' : selectedBooking.status === 'Not Approved' ? '#dc3545' : '#ffc107'}}>{selectedBooking.status}</span></div>
              <div style={styles.detailRow}><span style={styles.detailLabel}>Remarks:</span><span style={styles.detailValue}>{selectedBooking.remarks || 'No remarks'}</span></div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Add Remarks</label>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} style={styles.textarea} placeholder="Add remarks for the user..." rows="3" />
            </div>

            <div style={styles.modalButtons}>
              {selectedBooking.status === 'Pending' && (
                <>
                  <button style={styles.approveBtn} onClick={handleApprove}>Approve</button>
                  <button style={styles.notApproveBtn} onClick={handleNotApprove}>Not Approve</button>
                </>
              )}
              {selectedBooking.status === 'Approved' && (
                <>
                  <button style={styles.completeBtn} onClick={handleComplete}>Mark Completed</button>
                  <button style={styles.cancelBtn} onClick={handleCancel}>Cancel Booking</button>
                </>
              )}
            </div>

            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inria+Serif&display=swap'); * { box-sizing: border-box; }`}</style>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f9f9', fontFamily: 'Inria Serif, serif' },
  mainContent: { flex: 1, marginLeft: '250px', marginTop: '60px', padding: '20px' },
  contentWrapper: { maxWidth: '1040px', margin: '0 auto' },
  pageTitle: { fontSize: '22px', fontWeight: 700, marginBottom: '20px', fontFamily: 'Inria Serif, serif' },
  summaryCards: { display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' },
  card: { flex: '1 1 0', background: 'white', padding: '15px 18px', borderRadius: '10px', boxShadow: '0 1.4px 6px rgb(129 158 219 / 0.16)', display: 'flex', alignItems: 'center', gap: '13px', minWidth: '180px' },
  iconContainer: { width: '34px', height: '34px', borderRadius: '45%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#5366fd', flexShrink: 0 },
  iconSvg: { width: '20px', height: '20px', stroke: 'white', fill: 'none', strokeWidth: '2' },
  cardText: { fontWeight: 700, fontSize: '17px', letterSpacing: '0.9px' },
  cardValue: { color: '#5366fd', fontFamily: 'Inria Serif, serif' },
  cardDesc: { fontWeight: 600, fontSize: '13px', color: '#777a8d', marginLeft: '5px' },
  filterRow: { background: 'white', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', padding: '13px 20px', boxShadow: '0 5px 10px rgb(0 0 0 / 0.1)', marginBottom: '20px' },
  select: { fontFamily: 'Inria Serif, serif', fontWeight: 600, fontSize: '13.8px', border: '1.6px solid #afb4c5', borderRadius: '10px', padding: '6.5px 12px', color: '#444', minWidth: '140px' },
  searchInput: { fontFamily: 'Inria Serif, serif', fontWeight: 600, fontSize: '13.8px', border: '1.6px solid #afb4c5', borderRadius: '10px', padding: '6.5px 12px', color: '#444', minWidth: '230px', flexGrow: 1, fontStyle: 'italic' },
  tableContainer: { maxWidth: '100%', background: 'white', borderRadius: '15px', boxShadow: '0 4px 14px rgb(104 114 153 / 0.2)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontFamily: 'Inria Serif, serif' },
  th: { padding: '15px 12px', color: '#4d55af', fontWeight: 700, cursor: 'pointer', textAlign: 'left', backgroundColor: '#e6eaf6', borderBottom: '3px solid #5366fd', fontSize: '14px' },
  td: { fontSize: '14px', padding: '13px 12px', color: '#393d6c', whiteSpace: 'nowrap', borderBottom: '1.4px solid #e6e9f8' },
  tr: { borderBottom: '1.4px solid #e6e9f8' },
  revenueCell: { fontWeight: 700, color: '#207626' },
  statusCell: { textAlign: 'center' },
  statusBadge: { padding: '8px 17px', borderRadius: '16px', fontWeight: 700, fontSize: '13.6px', color: 'white', textTransform: 'capitalize' },
  statusPending: { backgroundColor: '#ffc107', color: '#000' },
  statusApproved: { backgroundColor: '#28a745' },
  statusNotApproved: { backgroundColor: '#dc3545' },
  statusCompleted: { backgroundColor: '#3a913f' },
  statusCancelled: { backgroundColor: '#c43333' },
  paymentBadge: { padding: '4px 10px', borderRadius: '4px', fontWeight: 600, fontSize: '12px', backgroundColor: '#e8f5e9', color: '#2e7d32' },
  noPaymentBadge: { padding: '4px 10px', borderRadius: '4px', fontWeight: 600, fontSize: '12px', backgroundColor: '#ffebee', color: '#c62828' },
  actionsCell: { textAlign: 'right', width: '100px' },
  viewBtn: { background: '#5366fd', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '12px' },
  infoRow: { marginTop: '36px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 11px rgba(30,34,81,0.15)', padding: '22px 30px', display: 'flex', justifyContent: 'space-between', gap: '38px' },
  infoBox: { display: 'flex', gap: '18px', maxWidth: '33%' },
  infoSvg: { width: '48px', height: '48px', stroke: '#222' },
  infoText: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: 'white', borderRadius: '12px', padding: '25px', width: '90%', maxWidth: '500px' },
  modalTitle: { marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 700 },
  detailSection: { marginBottom: '20px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
  detailLabel: { fontWeight: 600, color: '#555' },
  detailValue: { fontWeight: 600, color: '#121253' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'Inria Serif, serif', resize: 'vertical' },
  modalButtons: { display: 'flex', gap: '10px', marginBottom: '15px' },
  approveBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#28a745', color: 'white', fontWeight: 600, cursor: 'pointer' },
  notApproveBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#dc3545', color: 'white', fontWeight: 600, cursor: 'pointer' },
  completeBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#3a913f', color: 'white', fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#c43333', color: 'white', fontWeight: 600, cursor: 'pointer' },
  closeBtn: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', color: '#555', fontWeight: 600, cursor: 'pointer' },
};

export default ManageBookings;
