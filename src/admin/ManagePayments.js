import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import { useBookings } from '../context/BookingContext';

const ManagePayments = () => {
  const { getPayments, getBookings, updatePayment, deletePayment } = useBookings();
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(null);
  const [modalMode, setModalMode] = useState('edit');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    receiptNumber: '',
    paidAt: '',
    method: 'cash',
    amount: 0,
    status: 'Completed',
  });

  useEffect(() => {
    const allPayments = getPayments();
    const allBookings = getBookings();
    setPayments(allPayments);
    setBookings(allBookings);
  }, [getPayments, getBookings]);

  const getBookingForPayment = (bookingId) => {
    return bookings.find(b => b.id === bookingId);
  };

  const filteredPayments = payments.filter(payment => {
    const booking = getBookingForPayment(payment.bookingId);
    const userName = booking?.userName?.toLowerCase() || '';
    const carName = booking?.carName?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = userName.includes(searchLower) || carName.includes(searchLower) || 
                         (payment.receiptNumber?.toLowerCase() || '').includes(searchLower);
    const matchesStatus = !statusFilter || payment.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPayments(filteredPayments.map(p => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (id) => {
    if (selectedPayments.includes(id)) {
      setSelectedPayments(selectedPayments.filter(p => p !== id));
    } else {
      setSelectedPayments([...selectedPayments, id]);
    }
  };

  const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedPayments = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const openReceipt = (payment, mode = 'edit') => {
    const booking = getBookingForPayment(payment.bookingId);
    setFormData({
      receiptNumber: payment.receiptNumber || '',
      paidAt: payment.paidAt ? String(payment.paidAt).split('T')[0] : '',
      method: payment.method || 'cash',
      amount: payment.amount || 0,
      status: payment.status || 'Completed',
    });
    setModalMode(mode);
    setShowReceiptModal({ ...payment, booking });
  };

  const showTimedMessage = (type, text, timeout = 4000) => {
    setMessage({ type, text });
    window.clearTimeout(window.__managePaymentsTimer);
    window.__managePaymentsTimer = window.setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, timeout);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSavePayment = async () => {
    if (!showReceiptModal) {
      return;
    }

    const validStatuses = ['Completed', 'Pending', 'Failed'];
    if (!validStatuses.includes(formData.status)) {
      showTimedMessage('error', 'Please choose a valid payment status.');
      return;
    }

    if (formData.status === (showReceiptModal.status || 'Completed')) {
      showTimedMessage('error', 'Select a different status before saving.');
      return;
    }

    setSubmitting(true);
    try {
      await updatePayment(showReceiptModal.id, {
        status: formData.status,
      });
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === showReceiptModal.id ? { ...payment, status: formData.status } : payment
        )
      );
      setShowReceiptModal(null);
      showTimedMessage('success', 'Payment status updated successfully.');
    } catch (error) {
      showTimedMessage('error', error.message || 'Failed to update payment status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (payment) => {
    if (!payment) {
      return;
    }

    const confirmed = window.confirm(`Delete payment ${payment.receiptNumber || payment.id}?`);
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    try {
      await deletePayment(payment.id);
      setPayments((prev) => prev.filter((item) => String(item.id) !== String(payment.id)));
      if (showReceiptModal && String(showReceiptModal.id) === String(payment.id)) {
        setShowReceiptModal(null);
      }
      showTimedMessage('success', 'Payment deleted successfully.');
    } catch (error) {
      showTimedMessage('error', error.message || 'Failed to delete payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <AdminSidebar />
      
      <main className="responsive-main" style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <h2 style={styles.pageTitle}>Manage Payments</h2>

          {message.text && (
            <div style={{ ...styles.message, ...(message.type === 'success' ? styles.successMessage : styles.errorMessage) }}>
              {message.text}
            </div>
          )}

          {/* Summary Cards */}
          <div style={styles.summaryCards} aria-label="Payments summary">
            <div style={styles.card} aria-label={`₱${totalPayments.toLocaleString()} total payments`}>
              <div style={styles.iconContainer}>
                <svg viewBox="0 0 24 24" style={styles.iconSvg}>
                  <path d="M14 7v7a2 2 0 0 1-2 2H9v-1H7v1a4 4 0 0 0 4-4V7Z" fill="white"/>
                </svg>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.cardAmount}>₱{totalPayments.toLocaleString()}.00</div>
                <div style={styles.cardSubtext}>Total Payments</div>
              </div>
            </div>
            <div style={{...styles.card, ...styles.cardCompleted}} aria-label={`₱${completedPayments.toLocaleString()} completed payments`}>
              <div style={{...styles.iconContainer, backgroundColor: '#42ae4c'}}>
                <svg viewBox="0 0 24 24" style={styles.iconSvg}>
                  <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div style={styles.cardContent}>
                <div style={{...styles.cardAmount, color: '#42ae4c'}}>₱{completedPayments.toLocaleString()}.00</div>
                <div style={styles.cardSubtext}>Completed</div>
              </div>
            </div>
            <div style={{...styles.card, ...styles.cardPending}} aria-label={`₱${pendingPayments.toLocaleString()} pending payments`}>
              <div style={{...styles.iconContainer, backgroundColor: '#e58e2b'}}>
                <svg viewBox="0 0 24 24" style={styles.iconSvg}>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
                  <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div style={styles.cardContent}>
                <div style={{...styles.cardAmount, color: '#e58e2b'}}>₱{pendingPayments.toLocaleString()}.00</div>
                <div style={styles.cardSubtext}>Pending</div>
              </div>
            </div>
            <div style={{...styles.card, ...styles.cardCount}}>
              <div style={{...styles.iconContainer, backgroundColor: '#5366fd'}}>
                <svg viewBox="0 0 24 24" style={styles.iconSvg}>
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.cardAmount}>{payments.length}</div>
                <div style={styles.cardSubtext}>Total Transactions</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filters} role="search" aria-label="Filters and search payments">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <input 
              type="search" 
              placeholder="Search by user, car or receipt #..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              aria-label="Search payments"
            />
          </div>

          {/* Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{...styles.th, ...styles.checkboxCell}}>
                    <input 
                      type="checkbox" 
                      checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                      onChange={handleSelectAll}
                      aria-label="Select all payments"
                    />
                  </th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Car</th>
                  <th style={styles.th}>Receipt #</th>
                  <th style={styles.th}>Payment Date</th>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={{...styles.th, ...styles.actionsCell}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                      No payments found. Payments will appear here after users make bookings.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(payment => {
                    const booking = getBookingForPayment(payment.bookingId);
                    return (
                      <tr key={payment.id} style={styles.tr}>
                        <td style={{...styles.td, ...styles.checkboxCell}}>
                          <input 
                            type="checkbox" 
                            checked={selectedPayments.includes(payment.id)}
                            onChange={() => handleSelectPayment(payment.id)}
                            aria-label={`Select payment ${payment.id}`}
                          />
                        </td>
                        <td style={{...styles.td, ...styles.userCell}}>
                          {booking?.userName || 'N/A'}
                        </td>
                        <td style={styles.td}>{booking?.carName || 'N/A'}</td>
                        <td style={styles.td}><span style={styles.receiptNumber}>{payment.receiptNumber || 'N/A'}</span></td>
                        <td style={styles.td}>{formatDate(payment.paidAt)}</td>
                        <td style={styles.td}>
                          {payment.method === 'cash' ? '💵 Cash' : '📱 GCash'}
                        </td>
                        <td style={{...styles.td, ...styles.amountCell}}>₱{payment.amount?.toLocaleString() || 0}</td>
                        <td style={{...styles.td, ...styles.statusCell}}>
                          <span style={{
                            ...styles.statusBadge,
                            ...(payment.status === 'Completed' ? styles.statusCompleted : 
                               payment.status === 'Pending' ? styles.statusPending : styles.statusFailed)
                          }}>
                            {payment.status}
                          </span>
                        </td>
                        <td style={{...styles.td, ...styles.actionsCell}}>
                          <div style={styles.actionStack}>
                            <button 
                              style={styles.viewReceiptBtn}
                              onClick={() => openReceipt(payment, 'edit')}
                              title="Edit Payment"
                            >
                              Edit
                            </button>
                            <button
                              style={styles.secondaryBtn}
                              onClick={() => openReceipt(payment, 'view')}
                              title="View Payment"
                            >
                              View
                            </button>
                            <button
                              style={styles.deleteBtn}
                              onClick={() => handleDeletePayment(payment)}
                              title="Delete Payment"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div style={styles.modalOverlay} onClick={() => setShowReceiptModal(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.receiptHeader}>
              <h2 style={styles.receiptTitle}>🧾 Official Receipt</h2>
              <p style={styles.receiptNumber}>{showReceiptModal.receiptNumber}</p>
            </div>
            
            <div style={styles.receiptBody}>
              <div style={styles.editPanel}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Validation Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange} style={styles.input}>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div style={styles.validationHint}>
                  {modalMode === 'view' ? 'Payment receipt details are shown below.' : 'Change the payment decision here, then click Save to update it.'}
                </div>
              </div>
              <div style={styles.receiptGrid}>
              <div style={styles.receiptRow}>
                <span>Date:</span>
                <strong>{formatDate(showReceiptModal.paidAt)}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Customer:</span>
                <strong>{showReceiptModal.booking?.userName || 'N/A'}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Vehicle:</span>
                <strong>{showReceiptModal.booking?.carName || 'N/A'}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Booking Period:</span>
                <strong>{showReceiptModal.booking?.startDate} to {showReceiptModal.booking?.endDate}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span>Payment Method:</span>
                <strong>{showReceiptModal.method === 'cash' ? 'Cash upon Pickup' : 'GCash'}</strong>
              </div>
              </div>
              
              <div style={styles.receiptDivider}></div>
              
              <div style={styles.receiptTotal}>
                <span>Total Amount:</span>
                <strong>₱{showReceiptModal.amount?.toLocaleString()}</strong>
              </div>
              
              <div style={styles.receiptStatus}>
                <span>Current Selection:</span>
                <span style={{
                  ...styles.statusPill,
                  ...(formData.status === 'Completed'
                    ? styles.statusCompletedPill
                    : formData.status === 'Pending'
                      ? styles.statusPendingPill
                      : styles.statusFailedPill)
                }}>
                  {formData.status}
                </span>
              </div>
            </div>
            
            <div style={styles.receiptFooter}>
              <p>Thank you for choosing our car rental service!</p>
              <p style={styles.receiptNote}>This is an official receipt. Please keep this for your records.</p>
            </div>
            
            <div style={styles.modalButtons}>
              {modalMode === 'edit' && (
                <button
                  style={{
                    ...styles.saveBtn,
                    ...((submitting || formData.status === (showReceiptModal.status || 'Completed')) ? styles.disabledBtn : {}),
                  }}
                  onClick={handleSavePayment}
                  disabled={submitting || formData.status === (showReceiptModal.status || 'Completed')}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              )}
              <button style={styles.closeBtn} onClick={() => setShowReceiptModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inria+Serif&display=swap'); * { box-sizing: border-box; }`}</style>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f2f8f8', fontFamily: 'Inria Serif, serif' },
  mainContent: { flex: 1, marginLeft: '250px', marginTop: '60px', padding: '20px' },
  contentWrapper: { maxWidth: '1040px', margin: '0 auto' },
  pageTitle: { fontWeight: 700, fontSize: '22px', marginBottom: '18px', fontFamily: 'Inria Serif, serif' },
  message: { padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600' },
  successMessage: { background: '#d4edda', color: '#155724' },
  errorMessage: { background: '#f8d7da', color: '#721c24' },
  summaryCards: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' },
  card: { flex: '1 1 0', background: 'white', borderRadius: '9px', padding: '16px 18px 15px 18px', boxShadow: '1px 2px 8px rgb(129 158 219 / 0.16)', display: 'flex', alignItems: 'center', gap: '14px', minWidth: '200px' },
  cardCompleted: {},
  cardPending: {},
  cardCount: {},
  iconContainer: { width: '38px', height: '38px', borderRadius: '45%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#3186f4', flexShrink: 0 },
  iconSvg: { width: '20px', height: '20px', stroke: 'white', fill: 'none', strokeWidth: '1.9' },
  cardContent: { fontWeight: 700 },
  cardAmount: { fontSize: '23px', letterSpacing: '0.9px', color: '#3186f4', fontFamily: 'Inria Serif, serif' },
  cardSubtext: { fontWeight: 600, fontSize: '12.7px', marginTop: '4px', color: '#777', fontFamily: 'Inria Serif, serif' },
  filters: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' },
  select: { fontFamily: 'Inria Serif, serif', border: '1.6px solid #a8acb4', borderRadius: '10px', fontWeight: 600, fontSize: '14px', padding: '7.8px 14px', color: '#444', cursor: 'pointer' },
  searchInput: { fontFamily: 'Inria Serif, serif', fontStyle: 'italic', border: '1.6px solid #a8acb4', borderRadius: '10px', fontWeight: 600, fontSize: '14px', padding: '7.8px 14px', color: '#444', minWidth: '260px', flexGrow: 1 },
  tableContainer: { background: 'white', borderRadius: '10px', boxShadow: '0 5px 16px rgb(132 145 181 / 0.35)', maxWidth: '100%', overflowX: 'auto' },
  table: { borderCollapse: 'collapse', width: '100%', minWidth: '900px', fontFamily: 'Inria Serif, serif' },
  th: { padding: '16px 20px', color: '#3e4da8', fontWeight: 700, fontSize: '14.8px', textAlign: 'left', backgroundColor: '#d1dbff', borderBottom: '3px solid #5365fe' },
  td: { fontSize: '14px', padding: '16px 20px', color: '#444874', whiteSpace: 'nowrap', borderBottom: '1.5px solid #dbdeef' },
  tr: { borderBottom: '1.5px solid #dbdeef' },
  checkboxCell: { width: '40px', textAlign: 'center' },
  userCell: { display: 'flex', alignItems: 'center', gap: '14px' },
  receiptNumber: { fontSize: '12px', fontWeight: 600, color: '#5365fe' },
  amountCell: { fontWeight: 700, color: '#207626' },
  statusCell: { textAlign: 'center' },
  statusBadge: { borderRadius: '16px', padding: '7px 18px', fontWeight: 700, fontSize: '14px', color: 'white', textTransform: 'capitalize' },
  statusCompleted: { backgroundColor: '#12651b' },
  statusPending: { backgroundColor: '#b67600' },
  statusFailed: { backgroundColor: '#ac262a' },
  actionsCell: { textAlign: 'right', width: '120px' },
  actionStack: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'stretch' },
  viewReceiptBtn: { background: '#5365fe', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', fontFamily: 'Inria Serif, serif' },
  deleteBtn: { background: '#dc3545', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', fontFamily: 'Inria Serif, serif' },
  secondaryBtn: { background: '#eef2ff', border: '1px solid #c8d1ff', color: '#3949ab', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', fontFamily: 'Inria Serif, serif' },
  infoRow: { marginTop: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 3px 12px rgb(104 111 142 / 0.15)', padding: '22px 30px', display: 'flex', justifyContent: 'space-between', gap: '38px' },
  infoBox: { display: 'flex', gap: '16px', maxWidth: '33%' },
  infoSvg: { width: '46px', height: '46px', stroke: '#222' },
  infoText: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' },
  modal: { background: 'white', borderRadius: '12px', padding: '30px', width: '92%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(32, 56, 117, 0.25)' },
  formGroup: { marginBottom: '12px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'Inria Serif, serif' },
  receiptHeader: { textAlign: 'center', borderBottom: '2px dashed #ddd', paddingBottom: '20px', marginBottom: '20px' },
  receiptTitle: { margin: '0 0 10px', fontSize: '24px' },
  receiptNumber: { margin: 0, color: '#666', fontSize: '14px' },
  receiptBody: { marginBottom: '20px' },
  editPanel: { background: '#f5f8ff', border: '1px solid #d9e3ff', borderRadius: '10px', padding: '16px', marginBottom: '18px' },
  validationHint: { fontSize: '12px', color: '#5365fe', fontWeight: 600 },
  receiptGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 18px' },
  receiptRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
  receiptDivider: { height: '2px', background: '#ddd', margin: '20px 0' },
  receiptTotal: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '18px', fontWeight: 700 },
  receiptStatus: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' },
  statusPill: { color: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 600, fontSize: '14px' },
  statusCompletedPill: { background: '#28a745' },
  statusPendingPill: { background: '#b67600' },
  statusFailedPill: { background: '#ac262a' },
  receiptFooter: { textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '15px' },
  receiptNote: { fontSize: '12px', color: '#666', margin: '10px 0 0' },
  modalButtons: { display: 'flex', gap: '10px', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: 'white', paddingTop: '12px', borderTop: '1px solid #e8ebf3' },
  saveBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#5365fe', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inria Serif, serif' },
  disabledBtn: { opacity: 0.6, cursor: 'not-allowed' },
  closeBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', color: '#555', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inria Serif, serif' },
};

export default ManagePayments;
