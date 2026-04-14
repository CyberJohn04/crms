import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useUserApplication } from '../context/UserApplicationContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(\+63|0)\d{10}$/;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { saveApplication, getApplication } = useUserApplication();

  const [isEditing, setIsEditing] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const userApplication = user?.id ? getApplication(user.id) : null;

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    nationalIdImage: '',
    nationalIdFileName: '',
    driverLicenseImage: '',
    driverLicenseFileName: ''
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fullName: user?.name || prev.fullName,
      email: user?.email || prev.email,
      phone: user?.phone || prev.phone,
      address: user?.address || prev.address,
      nationalIdImage: userApplication?.nationalIdImage || prev.nationalIdImage,
      nationalIdFileName: userApplication?.nationalIdFileName || prev.nationalIdFileName,
      driverLicenseImage: userApplication?.driverLicenseImage || prev.driverLicenseImage,
      driverLicenseFileName: userApplication?.driverLicenseFileName || prev.driverLicenseFileName,
    }));
  }, [user, userApplication]);

  const showTimedMessage = (type, text, timeout = 4000) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, timeout);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    const fieldName = e.target.name;

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showTimedMessage('error', 'Please upload an image file for your ID documents.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showTimedMessage('error', 'Each uploaded ID image must be 5MB or smaller.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: typeof reader.result === 'string' ? reader.result : '',
        [fieldName === 'nationalIdImage' ? 'nationalIdFileName' : 'driverLicenseFileName']: file.name,
      }));
    };
    reader.onerror = () => {
      showTimedMessage('error', 'Failed to read the uploaded file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const validateProfileData = () => {
    if (formData.fullName.trim().length < 3) {
      return 'Please enter your full name.';
    }
    if (!emailPattern.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (formData.phone.trim() && !phonePattern.test(formData.phone.trim())) {
      return 'Phone number must start with +63 or 0 and contain 11 to 13 digits.';
    }
    if (!formData.address.trim()) {
      return 'Please provide your address.';
    }
    return '';
  };

  const validateApplicationData = () => {
    const profileError = validateProfileData();
    if (profileError) {
      return profileError;
    }
    if (!formData.nationalIdImage) {
      return 'Please upload your National ID.';
    }
    if (!formData.driverLicenseImage) {
      return "Please upload your Driver's License.";
    }
    return '';
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    if (!user) {
      showTimedMessage('error', 'Please login first');
      return;
    }

    const validationError = validateApplicationData();
    if (validationError) {
      showTimedMessage('error', validationError);
      return;
    }

    setSubmitting(true);

    try {
      await saveApplication(user.id, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        nationalIdImage: formData.nationalIdImage,
        nationalIdFileName: formData.nationalIdFileName,
        driverLicenseImage: formData.driverLicenseImage,
        driverLicenseFileName: formData.driverLicenseFileName,
        submittedAt: new Date().toISOString(),
      });

      showTimedMessage('success', 'Application submitted successfully! Pending admin approval.', 5000);
      setShowApplicationForm(false);
    } catch (error) {
      showTimedMessage('error', 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateProfileData();
    if (validationError) {
      showTimedMessage('error', validationError);
      return;
    }
    setSubmitting(true);

    try {
      const result = await updateUser({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });

      if (!result.success) {
        showTimedMessage('error', result.error || 'Failed to update profile.');
        return;
      }

      showTimedMessage('success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      showTimedMessage('error', 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      nationalIdImage: userApplication?.nationalIdImage || '',
      nationalIdFileName: userApplication?.nationalIdFileName || '',
      driverLicenseImage: userApplication?.driverLicenseImage || '',
      driverLicenseFileName: userApplication?.driverLicenseFileName || '',
    });
    setIsEditing(false);
    setShowApplicationForm(false);
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <Sidebar />

      <div className="responsive-dashboard" style={styles.dashboardContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>My Profile</h1>
          <p style={styles.pageSubtitle}>Manage your personal information and application</p>
        </div>

        {message.text && (
          <div
            style={{
              ...styles.message,
              background: message.type === 'success' ? '#d4edda' : message.type === 'error' ? '#f8d7da' : '#cce5ff',
              color: message.type === 'success' ? '#155724' : message.type === 'error' ? '#721c24' : '#004085',
              borderColor: message.type === 'success' ? '#c3e6cb' : message.type === 'error' ? '#f5c6cb' : '#b8daff',
            }}
          >
            {message.text}
          </div>
        )}

        <div style={styles.profileContainer}>
          <div style={styles.profileHeader}>
            <div style={styles.profileAvatar}>{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div style={styles.profileInfo}>
              <h2 style={styles.profileName}>{user?.name || 'User'}</h2>
              <p style={styles.profileEmail}>{user?.email || 'user@example.com'}</p>
              {userApplication ? (
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: userApplication.status === 'approved' ? '#28a745' : userApplication.status === 'declined' ? '#dc3545' : '#ffc107',
                    color: userApplication.status === 'pending' ? '#000' : '#fff',
                  }}
                >
                  {userApplication.status === 'approved'
                    ? 'Approved - You can now book vehicles'
                    : userApplication.status === 'declined'
                    ? 'Declined - ' + (userApplication.remarks || 'Please retry')
                    : 'Pending Approval'}
                </span>
              ) : (
                <span style={{ ...styles.memberBadge, backgroundColor: '#6c757d' }}>Not Submitted</span>
              )}
            </div>
            {!userApplication || userApplication.status === 'declined' ? (
              <button style={styles.applyBtn} onClick={() => setShowApplicationForm(true)}>
                {userApplication?.status === 'declined' ? 'Retry Application' : 'Submit Application'}
              </button>
            ) : null}
          </div>

          {userApplication && userApplication.status === 'pending' && (
            <div style={styles.noticeBox}>
              <p>Your application is pending approval. You will be able to book vehicles once an admin approves your application.</p>
            </div>
          )}

          {showApplicationForm && (
            <div style={styles.applicationFormContainer}>
              <h3 style={styles.formTitle}>Submit Your Information</h3>
              <p style={styles.formSubtitle}>Please provide your details for verification</p>

              <form onSubmit={handleSubmitApplication}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="fullName">Full Name *</label>
                    <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required style={styles.input} />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="email">Email Address *</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required style={styles.input} />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="phone">Phone Number *</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required style={styles.input} placeholder="+63 xxx xxx xxxx" />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="address">Address *</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required style={styles.input} placeholder="Your complete address" />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="nationalIdImage">National ID *</label>
                    <input type="file" id="nationalIdImage" name="nationalIdImage" accept="image/*" onChange={handleFileChange} required={!formData.nationalIdImage} style={styles.fileInput} />
                    {formData.nationalIdFileName && <div style={styles.fileName}>Selected: {formData.nationalIdFileName}</div>}
                    {formData.nationalIdImage && <img src={formData.nationalIdImage} alt="National ID preview" style={styles.documentPreview} />}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="driverLicenseImage">Driver's License *</label>
                    <input type="file" id="driverLicenseImage" name="driverLicenseImage" accept="image/*" onChange={handleFileChange} required={!formData.driverLicenseImage} style={styles.fileInput} />
                    {formData.driverLicenseFileName && <div style={styles.fileName}>Selected: {formData.driverLicenseFileName}</div>}
                    {formData.driverLicenseImage && <img src={formData.driverLicenseImage} alt="Driver's License preview" style={styles.documentPreview} />}
                  </div>
                </div>

                <div style={styles.formActions}>
                  <button type="submit" style={styles.btnPrimary} disabled={submitting}>Submit Application</button>
                  <button type="button" style={styles.btnSecondary} onClick={handleCancel} disabled={submitting}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {!showApplicationForm && (
            <>
              <div style={styles.profileDetails}>
                <h3 style={styles.sectionTitle}>Personal Information</h3>

                <div style={styles.detailRow}><span style={styles.detailLabel}>Full Name</span><span style={styles.detailValue}>{formData.fullName || 'Not set'}</span></div>
                <div style={styles.detailRow}><span style={styles.detailLabel}>Email Address</span><span style={styles.detailValue}>{formData.email || 'Not set'}</span></div>
                <div style={styles.detailRow}><span style={styles.detailLabel}>Phone Number</span><span style={styles.detailValue}>{formData.phone || 'Not set'}</span></div>
                <div style={styles.detailRow}><span style={styles.detailLabel}>Address</span><span style={styles.detailValue}>{formData.address || 'Not set'}</span></div>

                <h3 style={{ ...styles.sectionTitle, marginTop: '30px' }}>Verification Information</h3>

                <div style={styles.detailRow}><span style={styles.detailLabel}>National ID</span><span style={styles.detailValue}>{userApplication?.nationalIdFileName || 'Not submitted'}</span></div>
                <div style={styles.detailRow}><span style={styles.detailLabel}>Driver's License</span><span style={styles.detailValue}>{userApplication?.driverLicenseFileName || 'Not submitted'}</span></div>
                <div style={styles.detailRow}><span style={styles.detailLabel}>Application Status</span><span style={{ ...styles.detailValue, color: userApplication?.status === 'approved' ? '#28a745' : userApplication?.status === 'declined' ? '#dc3545' : '#ffc107' }}>{userApplication?.status ? userApplication.status : 'Not submitted'}</span></div>

                {userApplication?.remarks && <div style={styles.detailRow}><span style={styles.detailLabel}>Admin Remarks</span><span style={styles.detailValue}>{userApplication.remarks}</span></div>}
                {userApplication?.nationalIdImage && (
                  <div style={styles.documentSection}>
                    <span style={styles.detailLabel}>National ID Preview</span>
                    <img src={userApplication.nationalIdImage} alt="National ID" style={styles.documentPreview} />
                  </div>
                )}
                {userApplication?.driverLicenseImage && (
                  <div style={styles.documentSection}>
                    <span style={styles.detailLabel}>Driver's License Preview</span>
                    <img src={userApplication.driverLicenseImage} alt="Driver's License" style={styles.documentPreview} />
                  </div>
                )}
              </div>

              <button style={styles.editProfileBtn} onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</button>

              {isEditing && (
                <form onSubmit={handleSubmit} style={styles.profileForm}>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="editName">Full Name</label>
                      <input type="text" id="editName" name="fullName" value={formData.fullName} onChange={handleChange} required style={styles.input} />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="editEmail">Email Address</label>
                      <input type="email" id="editEmail" name="email" value={formData.email} onChange={handleChange} required style={styles.input} />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="editPhone">Phone Number</label>
                      <input type="tel" id="editPhone" name="phone" value={formData.phone} onChange={handleChange} style={styles.input} />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label} htmlFor="editAddress">Address</label>
                      <input type="text" id="editAddress" name="address" value={formData.address} onChange={handleChange} style={styles.input} />
                    </div>
                  </div>

                  <div style={styles.formActions}>
                    <button type="submit" style={styles.btnPrimary} disabled={submitting}>Save Changes</button>
                    <button type="button" style={styles.btnSecondary} onClick={handleCancel} disabled={submitting}>Cancel</button>
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
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #e9eefb, #f9fbfe)' },
  dashboardContent: { marginLeft: '250px', marginTop: '60px', padding: '30px', overflowY: 'auto' },
  pageHeader: { marginBottom: '20px' },
  pageTitle: { color: '#121253', fontSize: '28px', fontWeight: '700', margin: '0 0 5px 0' },
  pageSubtitle: { color: '#555', fontSize: '14px', margin: 0 },
  message: { padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid' },
  profileContainer: { background: 'white', borderRadius: '8px', boxShadow: '0 5px 15px rgb(56 56 92 / 0.1)', padding: '30px' },
  profileHeader: { display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '30px', borderBottom: '1px solid #eee', marginBottom: '30px', flexWrap: 'wrap' },
  profileAvatar: { width: '80px', height: '80px', borderRadius: '50%', background: '#3f42c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { color: '#121253', margin: '0 0 5px 0', fontSize: '24px' },
  profileEmail: { color: '#555', margin: '0 0 10px 0' },
  statusBadge: { padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  memberBadge: { background: '#00C91E', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  applyBtn: { background: '#3f42c7', border: 'none', color: 'white', padding: '12px 24px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  noticeBox: { background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', padding: '15px', marginBottom: '20px', color: '#856404' },
  applicationFormContainer: { background: '#f8f9fa', borderRadius: '8px', padding: '25px', marginBottom: '20px' },
  formTitle: { color: '#121253', margin: '0 0 5px 0', fontSize: '20px' },
  formSubtitle: { color: '#666', margin: '0 0 20px 0', fontSize: '14px' },
  profileForm: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' },
  profileDetails: { display: 'flex', flexDirection: 'column', gap: '15px' },
  sectionTitle: { color: '#121253', margin: '0 0 10px 0', fontSize: '18px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f8f9fa', borderRadius: '6px', flexWrap: 'wrap' },
  detailLabel: { color: '#555', fontWeight: '500' },
  detailValue: { color: '#121253', fontWeight: '600' },
  editProfileBtn: { background: '#6b7280', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' },
  formRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  formGroup: { flex: '1', minWidth: '200px' },
  label: { display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500', fontSize: '14px' },
  input: { width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  fileInput: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: '#fff' },
  fileName: { marginTop: '8px', color: '#3f42c7', fontSize: '12px', fontWeight: '600' },
  documentSection: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' },
  documentPreview: { width: '100%', maxWidth: '280px', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d9dfec' },
  formActions: { display: 'flex', gap: '10px', marginTop: '10px' },
  btnPrimary: { background: '#3f42c7', border: 'none', color: 'white', padding: '12px 25px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  btnSecondary: { background: '#6b7280', border: 'none', color: 'white', padding: '12px 25px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
};

export default Profile;

