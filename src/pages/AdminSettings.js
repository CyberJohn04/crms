import React, { useState } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import InfoRow from '../components/InfoRow';
import { useAuth } from '../context/AuthContext';

const AdminSettings = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || 'Admin',
    email: user?.email || 'admin@carental.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (formData.newPassword && formData.currentPassword !== 'Admin123') {
      setMessage({ type: 'error', text: 'Current password is incorrect!' });
      return;
    }

    // Update user info (in a real app, this would call an API)
    updateUser({ ...user, name: formData.name, email: formData.email });
    setMessage({ type: 'success', text: 'Settings updated successfully!' });
    
    // Clear password fields
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <AdminSidebar />
      
      <main style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <h1 style={styles.pageTitle}>Admin Settings</h1>

          {/* Profile Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Profile Information</h2>
            <div style={styles.profileCard}>
              <div style={styles.avatar}>
                {formData.name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.profileInfo}>
                <h3>{formData.name}</h3>
                <p>Administrator</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {message.text && (
                <div style={{...styles.message, ...(message.type === 'error' ? styles.messageError : styles.messageSuccess)}}>
                  {message.text}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Admin Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
                <small style={styles.helpText}>Note: Admin username will always include "Admin"</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.divider}></div>

              <h3 style={styles.subsectionTitle}>Change Password</h3>

              <div style={styles.formGroup}>
                <label style={styles.label}>Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword" 
                  value={formData.currentPassword} 
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter current password"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>New Password</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={formData.newPassword} 
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter new password"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Confirm new password"
                />
              </div>

              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.saveBtn}>Save Changes</button>
              </div>
            </form>
          </div>

          {/* System Info */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>System Information</h2>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>System Version</span>
                <span style={styles.infoValue}>1.0.0</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Role</span>
                <span style={styles.infoValue}>Administrator</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Access Level</span>
                <span style={styles.infoValue}>Full Access</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Last Login</span>
                <span style={styles.infoValue}>June 15, 2026</span>
              </div>
            </div>
          </div>

          {/* Info Row */}
          <InfoRow />
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inria+Serif&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f4f9f9', fontFamily: 'Inria Serif, serif' },
  mainContent: { flex: 1, marginLeft: '250px', marginTop: '60px', padding: '20px' },
  contentWrapper: { maxWidth: '800px', margin: '0 auto' },
  pageTitle: { fontWeight: 700, fontSize: '24px', marginBottom: '20px' },
  section: { background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', padding: '24px', marginBottom: '20px' },
  sectionTitle: { fontWeight: 700, fontSize: '18px', marginBottom: '20px', color: '#333' },
  subsectionTitle: { fontWeight: 600, fontSize: '16px', marginBottom: '15px', color: '#333' },
  profileCard: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#3f42c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 'bold' },
  profileInfo: {},
  form: {},
  message: { padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: 600 },
  messageError: { backgroundColor: '#fee2e2', color: '#dc2626' },
  messageSuccess: { backgroundColor: '#dcfce7', color: '#16a34a' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px', color: '#444' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1.5px solid #ddd', fontSize: '14px', fontFamily: 'Inria Serif, serif' },
  helpText: { display: 'block', marginTop: '6px', fontSize: '12px', color: '#666' },
  divider: { height: '1px', backgroundColor: '#eee', margin: '24px 0' },
  buttonGroup: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  saveBtn: { backgroundColor: '#237643', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inria Serif, serif' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' },
  infoLabel: { fontSize: '12px', color: '#666', fontWeight: 600 },
  infoValue: { fontSize: '16px', fontWeight: 700, color: '#333' },
  infoRow: { marginTop: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', padding: '22px 30px', display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' },
  infoBox: { display: 'flex', gap: '16px', maxWidth: '33%', minWidth: '200px' },
  infoSvg: { width: '48px', height: '48px', stroke: '#222', flexShrink: 0 },
};

export default AdminSettings;
