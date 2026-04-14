import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useUserApplication } from '../context/UserApplicationContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { saveApplication, getApplication } = useUserApplication();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Get user's application if exists
  const userApplication = user?.id ? getApplication(user.id) : null;
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    nationalId: '',
    driverLicenseId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    
    if (!user) {
      setMessage({ type: 'error', text: 'Please login first' });
      return;
    }
    
    // Save the application
    saveApplication(user.id, {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      nationalId: formData.nationalId,
      driverLicenseId: formData.driverLicenseId,
      submittedAt: new Date().toISOString()
    });
    
    setMessage({ type: 'success', text: 'Application submitted successfully! Pending admin approval.' });
    setShowApplicationForm(false);
    
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser(formData);
    setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setIsEditing(false);
    
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      nationalId: '',
      driverLicenseId: ''
    });
    setIsEditing(false);
    setShowApplicationForm(false);
  };

  // Check if user can book (must be approved)
  const canBook = userApplication?.status === 'approved';

  return (
    <div style={styles.container}>
      <Navbar />
      <Sidebar />
      
      <div style={styles.dashboardContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>My Profile</h1>
          <p style={styles.pageSubtitle}>Manage your personal information and application</p>
        </div>

        {message.text && (
          <div style={{
            ...styles.message,
            background: message.type === 'success' ? '#d4edda' : message.type === 'error' ? '#f8d7da' : '#cce5ff',
            color: message.type === 'success' ? '#155724' : message.type === 'error' ? '#721c24' : '#004085',
            borderColor: message.type === 'success' ? '#c3e6cb' : message.type === 'error' ? '#f5c6cb' : '#b8daff'
          }}>
            {message.text}
          </div>
        )}

        <div style={styles.profileContainer}>
          {/* Profile Header */}
          <div style={styles.profileHeader}>
            <div style={styles.profileAvatar}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={styles.profileInfo}>
              <h2 style={styles.profileName}>{user?.name || 'User'}</h2>
              <p style={styles.profileEmail}>{user?.email || 'user@example.com'}</p>
              {userApplication ? (
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: userApplication.status === 'approved' ? '#28a745' : 
                                 userApplication.status === 'declined' ? '#dc3545' : '#ffc107',
                  color: userApplication.status === 'pending' ? '#000' : '#fff'
                }}>
                  {userApplication.status === 'approved' ? '✓ Approved - You can now book vehicles' : 
                   userApplication.status === 'declined' ? '✕ Declined - ' + (userApplication.remarks || 'Please retry') :
                   '⏳ Pending Approval'}
                </span>
              ) : (
                <span style={{...styles.memberBadge, backgroundColor: '#6c757d'}}>
                  Not Submitted
                </span>
              )}
            </div>
            {!userApplication || userApplication.status === 'declined' ? (
              <button 
                style={styles.applyBtn}
                onClick={() => setShowApplicationForm(true)}
              >
                {userApplication?.status === 'declined' ? 'Retry Application' : 'Submit Application'}
              </button>
            ) : null}
          </div>

          {/* Application Status Notice */}
          {userApplication && userApplication.status === 'pending' && (
            <div style={styles.noticeBox}>
              <p>Your application is pending approval. You will be able to book vehicles once an admin approves your application.</p>
            </div>
          )}

          {/* Application Form Modal */}
          {showApplicationForm && (
            <div style={styles.applicationFormContainer}>
              <h3 style={styles.formTitle}>Submit Your Information</h3>
              <p style={styles.formSubtitle}>Please provide your details for verification</p>
              
              <form onSubmit={handleSubmitApplication}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      style={styles.input}
                      placeholder="+63 xxx xxx xxxx"
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="address">Address *</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      style={styles.input}
                      placeholder="Your complete address"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="nationalId">National ID *</label>
                    <input
                      type="text"
                      id="nationalId"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleChange}
                      required
                      style={styles.input}
                      placeholder="Enter your National ID number"
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="driverLicenseId">Driver's License ID *</label>
                    <input
                      type="text"
                      id="driverLicenseId"
                      name="driverLicenseId"
                      value={formData.driverLicenseId}
                      onChange={handleChange}
                      required
                      style={styles.input}
                      placeholder="Enter your Driver's License number"
                    />
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button type="submit" style={styles.btnPrimary}>
                    Submit Application
                  </button>
                  <button 
                    type="button" 
                    style={styles.btnSecondary}
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Profile Details (View Mode) */}
          {!showApplicationForm && (
            <>
              <div style={styles.profileDetails}>
                <h3 style={styles.sectionTitle}>Personal Information</h3>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Full Name</span>
                  <span style={styles.detailValue}>{formData.fullName || 'Not set'}</span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Email Address</span>
                  <span style={styles.detailValue}>{formData.email || 'Not set'}</span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Phone Number</span>
                  <span style={styles.detailValue}>{formData.phone || 'Not set'}</span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Address</span>
                  <span style={styles.detailValue}>{formData.address || 'Not set'}</span>
                </div>

                <h3 style={{...styles.sectionTitle, marginTop: '30px'}}>Verification Information</h3>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>National ID</span>
                  <span style={styles.detailValue}>{formData.nationalId || 'Not submitted'}</span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Driver's License ID</span>
                  <span style={styles.detailValue}>{formData.driverLicenseId || 'Not submitted'}</span>
                </div>
                
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Application Status</span>
                  <span style={{
                    ...styles.detailValue,
                    color: userApplication?.status === 'approved' ? '#28a745' : 
                           userApplication?.status === 'declined' ? '#dc3545' : '#ffc107'
                  }}>
                    {userApplication?.status ? userApplication.status : 'Not submitted'}
                  </span>
                </div>

                {userApplication?.remarks && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Admin Remarks</span>
                    <span style={styles.detailValue}>{userApplication.remarks}</span>
                  </div>
                )}
              </div>

              <button 
                style={styles.editProfileBtn}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>

              {/* Edit Profile Form */}
              {isEditing && (
                <form onSubmit={handleSubmit} style={styles.profileForm}>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="editName">Full Name</label>
                      <input
                        type="text"
                        id="editName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        style={styles.input}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="editEmail">Email Address</label>
                      <input
                        type="email"
                        id="editEmail"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="editPhone">Phone Number</label>
                      <input
                        type="tel"
                        id="editPhone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>
                    
                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="editAddress">Address</label>
                      <input
                        type="text"
                        id="editAddress"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formActions}>
                    <button type="submit" style={styles.btnPrimary}>
                      Save Changes
                    </button>
                    <button 
                      type="button" 
                      style={styles.btnSecondary}
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e9eefb, #f9fbfe)',
  },
  dashboardContent: {
    marginLeft: '250px',
    marginTop: '60px',
    padding: '30px',
    overflowY: 'auto',
  },
  pageHeader: {
    marginBottom: '20px',
  },
  pageTitle: {
    color: '#121253',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 5px 0',
  },
  pageSubtitle: {
    color: '#555',
    fontSize: '14px',
    margin: 0,
  },
  message: {
    padding: '15px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid',
  },
  profileContainer: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)',
    padding: '30px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    paddingBottom: '30px',
    borderBottom: '1px solid #eee',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  profileAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#3f42c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#121253',
    margin: '0 0 5px 0',
    fontSize: '24px',
  },
  profileEmail: {
    color: '#555',
    margin: '0 0 10px 0',
  },
  statusBadge: {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  memberBadge: {
    background: '#00C91E',
    color: 'white',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  },
  applyBtn: {
    background: '#3f42c7',
    border: 'none',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  noticeBox: {
    background: '#fff3cd',
    border: '1px solid #ffeeba',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    color: '#856404',
  },
  applicationFormContainer: {
    background: '#f8f9fa',
    borderRadius: '8px',
    padding: '25px',
    marginBottom: '20px',
  },
  formTitle: {
    color: '#121253',
    margin: '0 0 5px 0',
    fontSize: '20px',
  },
  formSubtitle: {
    color: '#666',
    margin: '0 0 20px 0',
    fontSize: '14px',
  },
  profileForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '20px',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  sectionTitle: {
    color: '#121253',
    margin: '0 0 10px 0',
    fontSize: '18px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '6px',
    flexWrap: 'wrap',
  },
  detailLabel: {
    color: '#555',
    fontWeight: '500',
  },
  detailValue: {
    color: '#121253',
    fontWeight: '600',
  },
  editProfileBtn: {
    background: '#6b7280',
    border: 'none',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  formGroup: {
    flex: '1',
    minWidth: '200px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontWeight: '500',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  btnPrimary: {
    background: '#3f42c7',
    border: 'none',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSecondary: {
    background: '#6b7280',
    border: 'none',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default Profile;
