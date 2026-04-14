import React, { useState, useEffect } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import InfoRow from '../components/InfoRow';
import { useBookings } from '../context/BookingContext';

const ManageReturns = () => {
  const { getAllReturns, updateReturnStatus } = useBookings();
  const [returns, setReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');

  useEffect(() => {
    const allReturns = getAllReturns();
    setReturns(allReturns);
  }, [getAllReturns]);

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = 
      (ret.carName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       ret.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || ret.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleViewReturn = (returnItem) => {
    setSelectedReturn(returnItem);
    setAdminRemarks(returnItem.adminRemarks || '');
    setShowModal(true);
  };

  const handleApprove = () => {
    if (selectedReturn) {
      updateReturnStatus(selectedReturn.id, 'Approved', adminRemarks || 'Return approved - No damage found, vehicle is in good condition.');
      setShowModal(false);
      setSelectedReturn(null);
      
      // Refresh returns
      const updatedReturns = getAllReturns();
      setReturns(updatedReturns);
    }
  };

  const handleReject = () => {
    if (selectedReturn) {
      updateReturnStatus(selectedReturn.id, 'Rejected', adminRemarks || 'Return rejected - Please resolve the issues mentioned.');
      setShowModal(false);
      setSelectedReturn(null);
      
      // Refresh returns
      const updatedReturns = getAllReturns();
      setReturns(updatedReturns);
    }
  };

  const totalReturns = returns.length;
  const pendingReturns = returns.filter(r => r.status === 'Pending').length;
  const approvedReturns = returns.filter(r => r.status === 'Approved').length;
  const rejectedReturns = returns.filter(r => r.status === 'Rejected').length;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <AdminSidebar />
      
      <main style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <h1 style={styles.pageTitle}>Manage Returns</h1>

          {/* Summary Cards */}
          <div style={styles.topCards}>
            <div style={styles.card}>
              <div style={styles.cardIcon}>🚗</div>
              <div style={styles.cardTextGroup}>
                <strong>{totalReturns} Returns</strong>
                <small>Total Returns</small>
              </div>
            </div>
            <div style={{...styles.card, backgroundColor: '#fff3cd'}}>
              <div style={{...styles.cardIcon, backgroundColor: '#ffc107'}}>⏰</div>
              <div style={styles.cardTextGroup}>
                <strong>{pendingReturns}</strong>
                <small>Pending Inspection</small>
              </div>
            </div>
            <div style={{...styles.card, backgroundColor: '#d4edda'}}>
              <div style={{...styles.cardIcon, backgroundColor: '#28a745'}}>✓</div>
              <div style={styles.cardTextGroup}>
                <strong>{approvedReturns}</strong>
                <small>Approved</small>
              </div>
            </div>
            <div style={{...styles.card, backgroundColor: '#f8d7da'}}>
              <div style={{...styles.cardIcon, backgroundColor: '#dc3545'}}>✕</div>
              <div style={styles.cardTextGroup}>
                <strong>{rejectedReturns}</strong>
                <small>Rejected</small>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filters}>
            <button 
              style={{...styles.filterBtn, ...(statusFilter === '' ? styles.filterBtnActive : {})}} 
              onClick={() => setStatusFilter('')}
            >
              All Inspections
            </button>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              style={styles.select}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <input 
              type="search" 
              placeholder="Search by car or booking ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={styles.searchInput} 
            />
          </div>

          {/* Returns List */}
          <div style={styles.returnsContainer}>
            {filteredReturns.length === 0 ? (
              <div style={styles.emptyState}>
                <p>No returns submitted yet. Returns will appear here after users submit their vehicle returns.</p>
              </div>
            ) : (
              filteredReturns.map(ret => {
                const statusBadge = getStatusBadge(ret.status);
                return (
                  <article key={ret.id} style={styles.returnCard}>
                    <img 
                      src={ret.carImage || 'https://via.placeholder.com/140x90'} 
                      alt={ret.carName} 
                      style={styles.returnImage} 
                    />
                    <div style={styles.returnDetails}>
                      <div style={styles.returnIdName}>
                        <strong>{ret.bookingId?.slice(-6).toUpperCase()}</strong> - <span>{ret.carName}</span>
                      </div>
                      
                      {/* Rating */}
                      <div style={styles.ratingRow}>
                        {Array(5).fill(0).map((_, i) => (
                          <svg 
                            key={i} 
                            viewBox="0 0 24 24" 
                            fill={i < (ret.rating || 0) ? "#ffc107" : "none"} 
                            stroke="#ffc107" 
                            strokeWidth="2"
                            style={{ width: '16px', height: '16px' }}
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                          </svg>
                        ))}
                        <span style={styles.ratingText}>{ret.rating || 0} Stars</span>
                      </div>
                      
                      <div style={styles.returnDates}>Return Date: {formatDate(ret.returnDate)}</div>
                      
                      {/* Payment Status */}
                      <div style={styles.paymentStatus}>
                        Payment: 
                        <span style={{
                          ...styles.paymentBadge,
                          backgroundColor: ret.paymentStatus === 'paid' ? '#28a745' : '#dc3545'
                        }}>
                          {ret.paymentStatus === 'paid' ? '✓ Paid' : '✕ Unpaid/Balance'}
                        </span>
                      </div>
                      
                      {/* Damage Info */}
                      {ret.hasDamage && (
                        <div style={styles.damageBox}>
                          ⚠️ Damage Reported: {ret.damageDescription || 'See remarks'}
                        </div>
                      )}
                      
                      {/* User Remarks */}
                      {ret.userRemarks && (
                        <div style={styles.userRemarks}>
                          <strong>User Remarks:</strong> {ret.userRemarks}
                        </div>
                      )}
                      
                      <div style={styles.returnActions}>
                        <button 
                          style={styles.viewBtn} 
                          onClick={() => handleViewReturn(ret)}
                        >
                          👁️ Inspect & Validate
                        </button>
                      </div>
                    </div>
                    
                    <div style={styles.statusSection}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.color
                      }}>
                        {statusBadge.text}
                      </span>
                      
                      {ret.adminRemarks && (
                        <div style={styles.adminRemarks}>
                          <strong>Admin:</strong> {ret.adminRemarks}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Info Row */}
          <InfoRow />
        </div>
      </main>

      {/* Inspection Modal */}
      {showModal && selectedReturn && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Vehicle Return Inspection</h3>
            
            <div style={styles.modalContent}>
              {/* Return Details */}
              <div style={styles.detailSection}>
                <div style={styles.detailRow}><span>Booking ID:</span><strong>{selectedReturn.bookingId?.slice(-6).toUpperCase()}</strong></div>
                <div style={styles.detailRow}><span>Car:</span><strong>{selectedReturn.carName}</strong></div>
                <div style={styles.detailRow}><span>Return Date:</span><strong>{formatDate(selectedReturn.returnDate)}</strong></div>
                <div style={styles.detailRow}>
                  <span>User Rating:</span>
                  <div style={styles.ratingDisplay}>
                    {Array(5).fill(0).map((_, i) => (
                      <svg key={i} viewBox="0 0 24 24" fill={i < (selectedReturn.rating || 0) ? "#ffc107" : "none"} stroke="#ffc107" strokeWidth="2" style={{width: '20px', height: '20px'}}>
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    ))}
                  </div>
                </div>
                <div style={styles.detailRow}>
                  <span>Payment Status:</span>
                  <span style={{
                    ...styles.paymentBadge,
                    backgroundColor: selectedReturn.paymentStatus === 'paid' ? '#28a745' : '#dc3545'
                  }}>
                    {selectedReturn.paymentStatus === 'paid' ? '✓ Fully Paid' : '✕ Unpaid/Balance'}
                  </span>
                </div>
                
                {/* Damage Check */}
                <div style={styles.detailRow}>
                  <span>Damage Reported:</span>
                  <span style={{
                    ...styles.damageIndicator,
                    backgroundColor: selectedReturn.hasDamage ? '#dc3545' : '#28a745',
                    color: '#fff'
                  }}>
                    {selectedReturn.hasDamage ? '⚠️ Yes - Damage Reported' : '✓ No Damage'}
                  </span>
                </div>
                
                {selectedReturn.hasDamage && selectedReturn.damageDescription && (
                  <div style={styles.damageDescription}>
                    <strong>Damage Description:</strong> {selectedReturn.damageDescription}
                  </div>
                )}
                
                {/* User Remarks */}
                {selectedReturn.userRemarks && (
                  <div style={styles.userRemarksBox}>
                    <strong>User Remarks:</strong>
                    <p>{selectedReturn.userRemarks}</p>
                  </div>
                )}
              </div>

              {/* Admin Remarks */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Admin Inspection Remarks:</label>
                <textarea
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  style={styles.textarea}
                  placeholder="Enter inspection results, vehicle condition, any issues found..."
                  rows="4"
                />
              </div>

              <div style={styles.totalAmount}>
                <span>Total Amount:</span>
                <strong>₱{selectedReturn.totalAmount?.toLocaleString()}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={styles.modalButtons}>
              <button style={styles.rejectBtn} onClick={handleReject}>
                ✕ Reject / Issues Found
              </button>
              <button style={styles.approveBtn} onClick={handleApprove}>
                ✓ Approve - No Damage
              </button>
            </div>

            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
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
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f9f9', fontFamily: 'Inria Serif, serif' },
  mainContent: { flex: 1, marginLeft: '250px', marginTop: '60px', padding: '20px' },
  contentWrapper: { maxWidth: '1040px', margin: '0 auto' },
  pageTitle: { fontWeight: 700, fontSize: '22px', marginBottom: '18px' },
  topCards: { display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' },
  card: { background: 'white', boxShadow: '1px 4px 9px rgba(50,80,120,0.1)', borderRadius: '8px', padding: '14px 26px', flex: '1 1 0', display: 'flex', alignItems: 'center', gap: '16px', minWidth: '180px' },
  cardIcon: { fontSize: '24px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: '#5366fd', color: '#fff' },
  cardTextGroup: { display: 'flex', flexDirection: 'column' },
  filters: { margin: '18px 0 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  filterBtn: { backgroundColor: '#354db1', border: 'none', borderRadius: '7px', color: 'white', fontWeight: 700, padding: '9px 28px', cursor: 'pointer' },
  filterBtnActive: { backgroundColor: '#273b86' },
  select: { borderRadius: '7px', border: '1.6px solid #94a3b8', padding: '8px 10px', fontWeight: 700, fontSize: '13.6px', color: '#49506d', cursor: 'pointer', fontFamily: 'Inria Serif, serif' },
  searchInput: { fontStyle: 'italic', fontWeight: 600, width: '220px', padding: '8px 12px', borderRadius: '9px', border: '1.6px solid #94a3b8', color: '#565a94', fontFamily: 'Inria Serif, serif' },
  returnsContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  emptyState: { textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px', color: '#666' },
  returnCard: { background: 'white', borderRadius: '9px', padding: '14px', boxShadow: '1px 2px 10px rgb(194,208,228,0.3)', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' },
  returnImage: { width: '140px', height: '90px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 },
  returnDetails: { flex: 1, minWidth: '200px' },
  returnIdName: { fontWeight: 700, fontSize: '16px', marginBottom: '8px' },
  ratingRow: { display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '8px' },
  ratingText: { marginLeft: '8px', fontSize: '13px', color: '#666' },
  returnDates: { fontSize: '14px', color: '#444', marginBottom: '4px' },
  paymentStatus: { fontSize: '14px', color: '#444', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' },
  paymentBadge: { padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#fff' },
  damageBox: { background: '#f8d7da', color: '#721c24', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, marginBottom: '8px' },
  userRemarks: { background: '#e8f0fd', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '8px' },
  returnActions: { marginTop: '10px' },
  viewBtn: { background: '#5366fd', border: 'none', borderRadius: '6px', color: 'white', padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: 'Inria Serif, serif' },
  statusSection: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', minWidth: '150px' },
  statusBadge: { padding: '8px 14px', borderRadius: '12px', fontWeight: 600, fontSize: '13px' },
  adminRemarks: { background: '#fff3cd', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', maxWidth: '200px', textAlign: 'right' },
  infoRow: { marginTop: '36px', background: 'white', borderRadius: '14px', boxShadow: '0 3px 14px #b7c3e0a7', padding: '22px 30px', display: 'flex', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' },
  infoBox: { display: 'flex', gap: '18px', maxWidth: '33%', minWidth: '200px' },
  infoSvg: { width: '48px', height: '48px', stroke: '#222', flexShrink: 0 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: 'white', borderRadius: '12px', padding: '25px', width: '90%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 700 },
  modalContent: { marginBottom: '20px' },
  detailSection: { marginBottom: '20px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee', alignItems: 'center' },
  ratingDisplay: { display: 'flex', gap: '2px' },
  damageIndicator: { padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 },
  damageDescription: { background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '6px', fontSize: '13px', marginTop: '10px' },
  userRemarksBox: { background: '#e8f0fd', padding: '10px', borderRadius: '6px', fontSize: '13px', marginTop: '10px' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'Inria Serif, serif', resize: 'vertical' },
  totalAmount: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8f9fa', borderRadius: '8px', fontWeight: 600, marginTop: '15px' },
  modalButtons: { display: 'flex', gap: '10px', marginBottom: '15px' },
  approveBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#28a745', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inria Serif, serif' },
  rejectBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#dc3545', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inria Serif, serif' },
  closeBtn: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', color: '#555', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inria Serif, serif' },
};

export default ManageReturns;
