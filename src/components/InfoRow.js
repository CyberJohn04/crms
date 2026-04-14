import React from 'react';

const InfoRow = () => {
  const styles = {
    infoRow: { 
      marginTop: '24px', 
      background: '#fff', 
      borderRadius: '16px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
      padding: '24px 30px', 
      display: 'flex', 
      gap: '30px', 
      justifyContent: 'space-between', 
      flexWrap: 'wrap' 
    },
    infoBox: { 
      display: 'flex', 
      alignItems: 'center', 
      gap: '16px', 
      flex: '1 1 250px' 
    },
    infoIconBox: { 
      width: '50px', 
      height: '50px', 
      borderRadius: '12px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: '24px' 
    },
    infoText: { 
      display: 'flex', 
      flexDirection: 'column' 
    }
  };

  return (
    <section style={styles.infoRow} aria-label="Car rental benefits">
      <div style={styles.infoBox}>
        <div style={styles.infoIconBox}>💰</div>
        <div style={styles.infoText}>
          <strong>Affordable Rates</strong>
          <span>Great prices on all vehicle types</span>
        </div>
      </div>
      <div style={styles.infoBox}>
        <div style={styles.infoIconBox}>🛡️</div>
        <div style={styles.infoText}>
          <strong>Safety & Security</strong>
          <span>Well-maintained and safe rental cars</span>
        </div>
      </div>
      <div style={styles.infoBox}>
        <div style={styles.infoIconBox}>📱</div>
        <div style={styles.infoText}>
          <strong>Easy Booking</strong>
          <span>Quick and Hassle free online reservations</span>
        </div>
      </div>
    </section>
  );
};

export default InfoRow;
