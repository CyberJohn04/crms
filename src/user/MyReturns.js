import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../context/BookingContext';

const MyReturns = () => {
  const { user, isAuthenticated } = useAuth();
  const { getApprovedBookingsForReturn, getUserReturns, submitReturn, getUserBookings, getBookingPayment } = useBookings();
  
  const [returns, setReturns] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [unpaidBookings, setUnpaidBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [returnForm, setReturnForm] = useState({
    rating: 5,
    userRemarks: '',
    hasDamage: false,
    damageDescription: '',
    paymentStatus: 'paid',
    returnPhoto: '',
    returnPhotoName: '',
  });

  useEffect(() => {
    if (user?.id) {
      const userReturns = getUserReturns(user.id);
      setReturns(userReturns);
      
      const approvedBookings = getApprovedBookingsForReturn(user.id);
      setAvailableBookings(approvedBookings);

      const approvedButUnpaidBookings = getUserBookings(user.id).filter((booking) => {
        if (!(booking.status === 'Approved' || booking.status === 'Completed')) {
          return false;
        }

        const payment = getBookingPayment(booking.id);
        return !payment || (payment.status || '').toLowerCase() !== 'completed';
      });
      setUnpaidBookings(approvedButUnpaidBookings);
    }
    setLoading(false);
  }, [user, getUserReturns, getApprovedBookingsForReturn, getUserBookings, getBookingPayment]);

  const showTimedMessage = (type, text, timeout = 4000) => {
    setMessage({ type, text });
    window.clearTimeout(window.__returnsMessageTimer);
    window.__returnsMessageTimer = window.setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, timeout);
  };

  const handleSubmitReturn = async () => {
    if (!selectedBooking) return;
    
    if (returnForm.paymentStatus === 'unpaid' || returnForm.paymentStatus === 'partial') {
      showTimedMessage('error', 'Please settle your payment before submitting the return.');
      return;
    }

    if (returnForm.hasDamage && !returnForm.damageDescription.trim()) {
      showTimedMessage('error', 'Please describe the vehicle damage before submitting the return.');
      return;
    }

    if (!returnForm.returnPhoto) {
      showTimedMessage('error', 'Please upload a photo of the vehicle before submitting the return.');
      return;
    }

    const returnData = {
      bookingId: selectedBooking.id,
      userId: user.id,
      carName: selectedBooking.carName,
      carImage: selectedBooking.carImage,
      returnDate: new Date().toISOString().split('T')[0],
      rating: returnForm.rating,
      userRemarks: returnForm.userRemarks,
      hasDamage: returnForm.hasDamage,
      damageDescription: returnForm.damageDescription,
      paymentStatus: returnForm.paymentStatus,
      totalAmount: selectedBooking.totalPrice,
      returnPhoto: returnForm.returnPhoto,
      returnPhotoName: returnForm.returnPhotoName,
    };

    setSubmitting(true);

    try {
      await submitReturn(returnData);
      setReturns(getUserReturns(user.id));
      setAvailableBookings(getApprovedBookingsForReturn(user.id));
      setShowReturnModal(false);
      setSelectedBooking(null);
      setReturnForm({
        rating: 5,
        userRemarks: '',
        hasDamage: false,
        damageDescription: '',
        paymentStatus: 'paid',
        returnPhoto: '',
        returnPhotoName: '',
      });
      showTimedMessage('success', 'Return submitted successfully. Waiting for admin inspection.');
    } catch (error) {
      showTimedMessage('error', error.message || 'Failed to submit return. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartReturn = (booking) => {
    setSelectedBooking(booking);
    setReturnForm({
      rating: 5,
      userRemarks: '',
      hasDamage: false,
      damageDescription: '',
      paymentStatus: 'paid',
      returnPhoto: '',
      returnPhotoName: '',
    });
    setShowReturnModal(true);
  };

  const handleReturnPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showTimedMessage('error', 'Please upload an image file for the returned vehicle.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showTimedMessage('error', 'Vehicle photo must be 5MB or smaller.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReturnForm((prev) => ({
        ...prev,
        returnPhoto: typeof reader.result === 'string' ? reader.result : '',
        returnPhotoName: file.name,
      }));
    };
    reader.onerror = () => {
      showTimedMessage('error', 'Failed to read the uploaded image. Please try again.');
    };
    reader.readAsDataURL(file);
  };

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
        return { bg: '#ffc107', color: '#000', text: 'Pending Inspection' };
      case 'Approved':
        return { bg: '#28a745', color: '#fff', text: 'Approved - No Damage' };
      case 'Rejected':
        return { bg: '#dc3545', color: '#fff', text: 'Rejected - Issues Found' };
      default:
        return { bg: '#6c757d', color: '#fff', text: status };
    }
  };

  const filterReturns = returns.filter(r => {
    if (activeStatus === 'all') return true;
    return r.status?.toLowerCase() === activeStatus.toLowerCase();
  });

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        viewBox="0 0 24 24" 
        fill={i < rating ? "#ffc107" : "none"} 
        stroke="#ffc107" 
        strokeWidth="2"
        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
        onClick={() => setReturnForm({...returnForm, rating: i + 1 })}
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
    ));
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <Sidebar />
      
      <div className="responsive-dashboard" style={styles.dashboardContent}>
        <h2 style={styles.pageTitle}>My Returns</h2>

        {message.text && (
          <div
            style={{
              ...styles.message,
              ...(message.type === 'success' ? styles.successMessage : styles.errorMessage),
            }}
          >
            {message.text}
          </div>
        )}

        {unpaidBookings.length > 0 && (
          <div style={styles.noticeBox}>
            Please complete payment for your approved booking{unpaidBookings.length > 1 ? 's' : ''} in the Payments page before managing a vehicle return.
          </div>
        )}

        {/* Return a Vehicle Button */}
        {availableBookings.length > 0 && (
          <div style={styles.actionSection}>
            <p style={styles.actionText}>You have approved bookings ready for return:</p>
            <div style={styles.bookingButtons}>
              {availableBookings.map(booking => (
                <button 
                  key={booking.id} 
                  style={styles.returnVehicleBtn}
                  onClick={() => handleStartReturn(booking)}
                >
                  Return {booking.carName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        <div style={styles.filterBar}>
          <button 
            style={activeStatus === 'all' ? styles.filterBtnActive : styles.filterBtnInactive}
            onClick={() => setActiveStatus('all')}
          >
            All
          </button>
          <button 
            style={activeStatus === 'Pending' ? styles.filterBtnActive : styles.filterBtnInactive}
            onClick={() => setActiveStatus('Pending')}
          >
            Pending
          </button>
          <button 
            style={activeStatus === 'Approved' ? styles.filterBtnActive : styles.filterBtnInactive}
            onClick={() => setActiveStatus('Approved')}
          >
            Approved
          </button>
          <button 
            style={activeStatus === 'Rejected' ? styles.filterBtnActive : styles.filterBtnInactive}
            onClick={() => setActiveStatus('Rejected')}
          >
            Rejected
          </button>
        </div>

        {/* Returns List */}
        <div style={styles.returnsContainer}>
          {loading ? (
            <div style={styles.loading}>Loading returns...</div>
          ) : filterReturns.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No returns yet. Complete a booking to see returns here.</p>
            </div>
          ) : (
            filterReturns.map((returnItem) => {
              const statusBadge = getStatusBadge(returnItem.status);
              return (
                <div key={returnItem.id} style={styles.returnCard}>
                  <img 
                    src={returnItem.carImage || 'https://via.placeholder.com/130x90'} 
                    alt={returnItem.carName} 
                    style={styles.carImage} 
                  />
                  
                  <div style={styles.returnInfo}>
                    <div style={styles.headerRow}>
                      <strong style={styles.bookingId}>{formatBookingId(returnItem.bookingId)}</strong>
                      <span style={styles.carName}>{returnItem.carName}</span>
                    </div>
                    
                    {/* Rating */}
                    <div style={styles.ratingRow}>
                      {Array(5).fill(0).map((_, i) => (
                        <svg 
                          key={i} 
                          viewBox="0 0 24 24" 
                          fill={i < (returnItem.rating || 0) ? "#ffc107" : "none"} 
                          stroke="#ffc107" 
                          strokeWidth="2"
                          style={{ width: '18px', height: '18px' }}
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      ))}
                      <span style={styles.ratingText}>{returnItem.rating || 0} Stars</span>
                    </div>
                    
                    <div style={styles.dateRow}>
                      <span>Return Date: {formatDate(returnItem.returnDate)}</span>
                    </div>

                    {/* Payment Status */}
                    <div style={styles.paymentRow}>
                      <span style={{
                        ...styles.paymentBadge,
                        backgroundColor: returnItem.paymentStatus === 'paid' ? '#28a745' : '#dc3545'
                      }}>
                        {returnItem.paymentStatus === 'paid' ? '✓ Paid' : '✕ Unpaid'}
                      </span>
                    </div>

                    {/* User Remarks */}
                    {returnItem.userRemarks && (
                      <div style={styles.remarksBox}>
                        <strong>Your Remarks:</strong> {returnItem.userRemarks}
                      </div>
                    )}

                    {returnItem.returnPhoto && (
                      <div style={styles.returnPhotoPreviewBox}>
                        <strong>Uploaded Vehicle Photo:</strong>
                        <img
                          src={returnItem.returnPhoto}
                          alt={`${returnItem.carName} return`}
                          style={styles.returnPhotoPreview}
                        />
                      </div>
                    )}
                  </div>

                  <div style={styles.statusSection}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: statusBadge.bg,
                      color: statusBadge.color
                    }}>
                      {statusBadge.text}
                    </span>
                    
                    {/* Admin Remarks */}
                    {returnItem.adminRemarks && (
                      <div style={styles.adminRemarksBox}>
                        <strong>Admin Remarks:</strong> {returnItem.adminRemarks}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Return Modal */}
      {showReturnModal && selectedBooking && (
        <div style={styles.modalOverlay} onClick={() => setShowReturnModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Submit Return - {selectedBooking.carName}</h3>
            
            <div style={styles.modalContent}>
              {/* Rating */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Rate your experience:</label>
                <div style={styles.starsContainer}>
                  {renderStars(returnForm.rating)}
                </div>
              </div>

              {/* User Remarks */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Your Remarks:</label>
                <textarea
                  value={returnForm.userRemarks}
                  onChange={(e) => setReturnForm({...returnForm, userRemarks: e.target.value})}
                  style={styles.textarea}
                  placeholder="Share your experience..."
                  rows="3"
                />
              </div>

              {/* Damage Checkbox */}
              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input 
                    type="checkbox"
                    checked={returnForm.hasDamage}
                    onChange={(e) => setReturnForm({...returnForm, hasDamage: e.target.checked})}
                    style={styles.checkbox}
                  />
                  Is there any damage to the vehicle?
                </label>
              </div>

              {/* Damage Description */}
              {returnForm.hasDamage && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Describe the damage:</label>
                  <textarea
                    value={returnForm.damageDescription}
                    onChange={(e) => setReturnForm({...returnForm, damageDescription: e.target.value})}
                    style={styles.textarea}
                    placeholder="Describe any damage..."
                    rows="2"
                  />
                </div>
              )}

              {/* Payment Status */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Payment Status:</label>
                <select 
                  value={returnForm.paymentStatus}
                  onChange={(e) => setReturnForm({...returnForm, paymentStatus: e.target.value})}
                  style={styles.select}
                >
                  <option value="paid">Fully Paid</option>
                  <option value="partial">Partial Payment</option>
                  <option value="unpaid">Unpaid</option>
                </select>
                {returnForm.paymentStatus !== 'paid' && (
                  <p style={styles.warningText}>
                    ⚠️ You must settle your payment before submitting the return.
                  </p>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Vehicle Photo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReturnPhotoChange}
                  style={styles.fileInput}
                />
                <p style={styles.helperText}>
                  Upload a clear photo of the returned vehicle. This is required and will be visible to the admin.
                </p>
                {returnForm.returnPhotoName && (
                  <div style={styles.photoFileName}>Selected: {returnForm.returnPhotoName}</div>
                )}
                {returnForm.returnPhoto && (
                  <img
                    src={returnForm.returnPhoto}
                    alt="Vehicle return preview"
                    style={styles.uploadPreview}
                  />
                )}
              </div>

              <div style={styles.priceInfo}>
                <span>Total Amount:</span>
                <strong>₱{selectedBooking.totalPrice?.toLocaleString()}</strong>
              </div>
            </div>

            <div style={styles.modalButtons}>
              <button style={styles.cancelBtn} onClick={() => setShowReturnModal(false)}>
                Cancel
              </button>
              <button 
                style={styles.submitBtn} 
                disabled={submitting}
                onClick={handleSubmitReturn}
              >
                {submitting ? 'Submitting...' : 'Submit Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inria+Serif&display=swap'); * { box-sizing: border-box; }`}</style>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#e7f2f1', fontFamily: 'Inria Serif, serif' },
  dashboardContent: { marginLeft: '250px', marginTop: '60px', padding: '30px', overflowY: 'auto', maxWidth: '1040px' },
  pageTitle: { fontWeight: '700', fontSize: '22px', marginBottom: '20px' },
  message: { padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', fontWeight: '600' },
  successMessage: { background: '#d4edda', color: '#155724' },
  errorMessage: { background: '#f8d7da', color: '#721c24' },
  actionSection: { background: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  noticeBox: { background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', padding: '15px', marginBottom: '20px', color: '#856404', fontWeight: '500' },
  actionText: { margin: '0 0 10px', fontWeight: '600' },
  bookingButtons: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  returnVehicleBtn: { background: '#237643', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inria Serif, serif' },
  filterBar: { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtnActive: { background: '#5054d2', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' },
  filterBtnInactive: { background: '#fff', color: '#222', border: '1px solid #444', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' },
  returnsContainer: { display: 'flex', flexDirection: 'column', gap: '14px' },
  loading: { textAlign: 'center', padding: '40px', color: '#555' },
  emptyState: { textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px', color: '#555' },
  returnCard: { background: '#fff', borderRadius: '9px', boxShadow: '2px 3px 10px #ccc', border: '1px solid #b7b9f8', padding: '15px 20px', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' },
  carImage: { width: '130px', height: '90px', borderRadius: '8px', objectFit: 'cover' },
  returnInfo: { flex: 1, minWidth: '200px' },
  headerRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  bookingId: { fontSize: '18px', fontWeight: '700' },
  carName: { fontWeight: '600', color: '#222' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' },
  ratingText: { marginLeft: '8px', fontSize: '13px', color: '#666' },
  dateRow: { fontSize: '13px', color: '#444', marginBottom: '8px' },
  paymentRow: { marginBottom: '8px' },
  paymentBadge: { padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', color: '#fff' },
  remarksBox: { background: '#f8f9fa', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', marginTop: '8px' },
  returnPhotoPreviewBox: { background: '#eef7f4', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginTop: '10px' },
  returnPhotoPreview: { width: '100%', maxWidth: '220px', height: '140px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px', border: '1px solid #d3e4dd' },
  statusSection: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', minWidth: '150px' },
  statusBadge: { padding: '6px 14px', borderRadius: '12px', fontWeight: '600', fontSize: '13px' },
  adminRemarksBox: { background: '#fff3cd', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', maxWidth: '200px', textAlign: 'right' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: '#fff', borderRadius: '12px', padding: '25px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '700' },
  modalContent: { marginBottom: '20px' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' },
  starsContainer: { display: 'flex', gap: '5px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'Inria Serif, serif', resize: 'vertical' },
  fileInput: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', fontSize: '14px', fontFamily: 'Inria Serif, serif' },
  helperText: { fontSize: '12px', color: '#556070', marginTop: '6px' },
  photoFileName: { marginTop: '8px', fontSize: '13px', color: '#237643', fontWeight: '600' },
  uploadPreview: { width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '10px', marginTop: '12px', border: '1px solid #d8dee9' },
  select: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'Inria Serif, serif' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' },
  checkbox: { width: '18px', height: '18px' },
  warningText: { color: '#dc3545', fontSize: '13px', marginTop: '5px' },
  priceInfo: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8f9fa', borderRadius: '8px', fontWeight: '600', marginTop: '15px' },
  modalButtons: { display: 'flex', gap: '10px' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inria Serif, serif' },
  submitBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#237643', color: '#fff', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inria Serif, serif' },
};

export default MyReturns;
