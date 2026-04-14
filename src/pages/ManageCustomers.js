import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import InfoRow from '../components/InfoRow';
import { useUserApplication } from '../context/UserApplicationContext';

const ManageCustomers = () => {
  const { getAllApplications, updateApplicationStatus } = useUserApplication();
  const applications = getAllApplications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [remarks, setRemarks] = useState('');

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.phone?.includes(searchTerm);
    const matchesStatus = !statusFilter || app.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleViewApplication = (app) => {
    setSelectedApplication(app);
    setRemarks(app.remarks || '');
    setShowModal(true);
  };

  const handleApprove = () => {
    if (selectedApplication) {
      updateApplicationStatus(selectedApplication.userId, 'approved', remarks || 'Your application has been approved. You can now book vehicles.');
      setShowModal(false);
      setSelectedApplication(null);
    }
  };

  const handleDecline = () => {
    if (selectedApplication) {
      updateApplicationStatus(selectedApplication.userId, 'declined', remarks || 'Your application has been declined. Please submit your information again.');
      setShowModal(false);
      setSelectedApplication(null);
    }
  };

  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => a.status === 'pending').length;
  const approvedApplications = applications.filter(a => a.status === 'approved').length;
  const declinedApplications = applications.filter(a => a.status === 'declined').length;

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <AdminSidebar />
      
      <main style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <h2 style={styles.pageTitle}>Manage Customer Applications</h2>

          {/* Top Controls */}
          <div style={styles.topControls}>
            <div style={styles.summaryCards} aria-label="Summary of applications">
              <div style={styles.summaryCard} aria-label={`${totalApplications} Total Applications`}>
                <div style={styles.iconBox}>
                  <svg viewBox="0 0 24 24" style={styles.summaryIcon}>
                    <path d="M3 13h8V3H3v10Zm10 8h8v-6h-8v6ZM3 21h8v-6H3v6ZM13 3v6h8V3h-8Z" fill="white"/>
                  </svg>
                </div>
                <div style={styles.summaryText}>
                  <span style={styles.summaryMain}>{totalApplications}</span> Total
                </div>
              </div>
              <div style={{...styles.summaryCard, backgroundColor: '#fff3cd'}} aria-label={`${pendingApplications} Pending`}>
                <div style={{...styles.iconBox, backgroundColor: '#ffc107'}}>
                  <svg viewBox="0 0 24 24" style={styles.summaryIcon}>
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
                    <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div style={styles.summaryText}>
                  <span style={{...styles.summaryMain, color: '#856404'}}>{pendingApplications}</span> Pending
                </div>
              </div>
              <div style={{...styles.summaryCard, backgroundColor: '#d4edda'}} aria-label={`${approvedApplications} Approved`}>
                <div style={{...styles.iconBox, backgroundColor: '#28a745'}}>
                  <svg viewBox="0 0 24 24" style={styles.summaryIcon}>
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div style={styles.summaryText}>
                  <span style={{...styles.summaryMain, color: '#28a745'}}>{approvedApplications}</span> Approved
                </div>
              </div>
              <div style={{...styles.summaryCard, backgroundColor: '#f8d7da'}} aria-label={`${declinedApplications} Declined`}>
                <div style={{...styles.iconBox, backgroundColor: '#dc3545'}}>
                  <svg viewBox="0 0 24 24" style={styles.summaryIcon}>
                    <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div style={styles.summaryText}>
                  <span style={{...styles.summaryMain, color: '#dc3545'}}>{declinedApplications}</span> Declined
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filterPanel} role="search" aria-label="Application filters">
            <input 
              type="search" 
              placeholder="Search by name, email or phone" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              aria-label="Search applications"
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          {/* Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Address</th>
                  <th style={styles.th}>National ID</th>
                  <th style={styles.th}>Driver License</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{...styles.td, textAlign: 'center', padding: '40px'}}>
                      No applications found. Users will appear here after submitting their information.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map(app => (
                    <tr key={app.userId} style={styles.tr}>
                      <td style={styles.td}>{app.fullName || 'N/A'}</td>
                      <td style={styles.td}>{app.email || 'N/A'}</td>
                      <td style={styles.td}>{app.phone || 'N/A'}</td>
                      <td style={styles.td}>{app.address || 'N/A'}</td>
                      <td style={styles.td}>{app.nationalId || 'N/A'}</td>
                      <td style={styles.td}>{app.driverLicenseId || 'N/A'}</td>
                      <td style={{...styles.td, ...styles.statusCell}}>
                        <span style={{
                          ...styles.statusBadge,
                          ...(app.status === 'approved' ? styles.statusApproved : 
                             app.status === 'pending' ? styles.statusPending : styles.statusDeclined)
                        }}>
                          {app.status || 'pending'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button 
                          style={styles.actionBtn}
                          onClick={() => handleViewApplication(app)}
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Info Row */}
          <InfoRow />
        </div>
      </main>

      {/* Modal for viewing and approving/declining */}
      {showModal && selectedApplication && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Application Details</h3>
            
            <div style={styles.detailSection}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Full Name:</span>
                <span style={styles.detailValue}>{selectedApplication.fullName || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Email:</span>
                <span style={styles.detailValue}>{selectedApplication.email || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Phone:</span>
                <span style={styles.detailValue}>{selectedApplication.phone || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Address:</span>
                <span style={styles.detailValue}>{selectedApplication.address || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>National ID:</span>
                <span style={styles.detailValue}>{selectedApplication.nationalId || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Driver License ID:</span>
                <span style={styles.detailValue}>{selectedApplication.driverLicenseId || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Submitted:</span>
                <span style={styles.detailValue}>
                  {selectedApplication.submittedAt ? new Date(selectedApplication.submittedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Current Status:</span>
                <span style={{
                  ...styles.detailValue,
                  color: selectedApplication.status === 'approved' ? '#28a745' : 
                         selectedApplication.status === 'declined' ? '#dc3545' : '#ffc107'
                }}>
                  {selectedApplication.status || 'pending'}
                </span>
              </div>
            </div>

            {selectedApplication.status === 'pending' && (
              <>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Remarks (Optional)</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    style={styles.textarea}
                    placeholder="Add remarks for the user..."
                    rows="3"
                  />
                </div>

                <div style={styles.modalButtons}>
                  <button 
                    type="button" 
                    onClick={handleDecline}
                    style={styles.declineBtn}
                  >
                    Decline Application
                  </button>
                  <button 
                    type="button" 
                    onClick={handleApprove}
                    style={styles.approveBtn}
                  >
                    Approve Application
                  </button>
                </div>
              </>
            )}

            <button 
              type="button" 
              onClick={() => setShowModal(false)} 
              style={styles.closeBtn}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inria+Serif&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#e4f0ed',
    fontFamily: 'Inria Serif, serif',
  },
  mainContent: {
    flex: 1,
    marginLeft: '250px',
    marginTop: '60px',
    padding: '20px',
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: 700,
    marginBottom: '14px',
    fontFamily: 'Inria Serif, serif',
  },
  topControls: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '14px',
    marginBottom: '25px',
  },
  summaryCards: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  summaryCard: {
    background: 'white',
    borderRadius: '7px',
    boxShadow: '0 1.5px 6px rgba(0,0,0,0.12)',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    minWidth: '140px',
  },
  iconBox: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5263cf',
  },
  summaryIcon: {
    width: '18px',
    height: '18px',
  },
  summaryText: {
    fontWeight: 700,
    fontSize: '14px',
  },
  summaryMain: {
    fontWeight: 700,
    fontSize: '19px',
    display: 'block',
  },
  filterPanel: {
    background: 'white',
    boxShadow: '0 2px 6px #9999992a',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '25px',
  },
  searchInput: {
    flexGrow: 1,
    minWidth: '200px',
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'Inria Serif, serif',
  },
  select: {
    padding: '10px 15px',
    fontWeight: 600,
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    fontFamily: 'Inria Serif, serif',
  },
  tableContainer: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px #66678840',
    overflow: 'auto',
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    fontFamily: 'Inria Serif, serif',
  },
  th: {
    whiteSpace: 'nowrap',
    padding: '12px 15px',
    fontWeight: 600,
    fontSize: '13px',
    color: '#2b2f57',
    textAlign: 'left',
    backgroundColor: '#d6def9',
    borderBottom: '3px solid #2334ac',
  },
  td: {
    padding: '12px 15px',
    fontWeight: 600,
    fontSize: '13px',
    color: '#1c2a52',
    borderBottom: '1px solid #eee',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  statusCell: {
    textAlign: 'center',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'capitalize',
  },
  statusApproved: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  statusPending: {
    backgroundColor: '#ffc107',
    color: '#000',
  },
  statusDeclined: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
  actionBtn: {
    background: '#3f42c7',
    border: 'none',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '12px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '36px',
    backgroundColor: 'white',
    padding: '18px 28px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px #9999993a',
    gap: '20px',
  },
  infoBox: {
    display: 'flex',
    gap: '15px',
    maxWidth: '33%',
    alignItems: 'center',
  },
  infoSvg: {
    width: '40px',
    height: '40px',
    stroke: '#222',
  },
  infoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '20px',
    fontWeight: 700,
    fontFamily: 'Inria Serif, serif',
  },
  detailSection: {
    marginBottom: '20px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
  },
  detailLabel: {
    fontWeight: 600,
    color: '#555',
  },
  detailValue: {
    fontWeight: 600,
    color: '#121253',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 600,
    fontSize: '14px',
    fontFamily: 'Inria Serif, serif',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'Inria Serif, serif',
    resize: 'vertical',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  approveBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    background: '#28a745',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inria Serif, serif',
  },
  declineBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    background: '#dc3545',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inria Serif, serif',
  },
  closeBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    background: 'white',
    color: '#555',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '10px',
    fontFamily: 'Inria Serif, serif',
  },
};

export default ManageCustomers;
