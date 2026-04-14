import React, { useState, useEffect, useMemo } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import { useBookings } from '../context/BookingContext';
import { useVehicles } from '../context/VehicleContext';

// Simple chart component without external library
const SimpleChart = ({ data, chartType }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '250px', padding: '20px 10px' }}>
      {data.map((item, index) => (
        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
          <div style={{ 
            width: '40px', 
            height: `${maxValue > 0 ? (item.value / maxValue) * 180 : 0}px`, 
            backgroundColor: chartType === 'revenue' ? '#2846e3' : '#28a745',
            borderRadius: '6px 6px 0 0',
            transition: 'height 0.3s ease',
            minHeight: item.value > 0 ? '10px' : '0'
          }}></div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>{item.label}</span>
          <span style={{ fontSize: '11px', color: '#999' }}>
            {chartType === 'revenue' ? `₱${item.value.toLocaleString()}` : item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const ManageReports = () => {
  const { getBookings, getPayments } = useBookings();
  const { vehicles } = useVehicles();
  const [reportType, setReportType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalVehicles: 0,
    completedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [chartType, setChartType] = useState('bookings');

  // Calculate real data from bookings and payments
  const allBookings = useMemo(() => getBookings(), [getBookings]);
  const allPayments = useMemo(() => getPayments(), [getPayments]);

  // Calculate monthly bookings from real data starting from March
  const monthlyBookingsData = useMemo(() => {
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const currentYear = new Date().getFullYear();
    
    return months.map(month => {
      const monthIndex = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].indexOf(month);
      const bookingsInMonth = allBookings.filter(booking => {
        const bookingDate = new Date(booking.pickupDate || booking.createdAt);
        return bookingDate.getMonth() === monthIndex + 2 && bookingDate.getFullYear() === currentYear;
      });
      return {
        label: month,
        value: bookingsInMonth.length
      };
    });
  }, [allBookings]);

  // Calculate monthly revenue from real payments
  const monthlyRevenueData = useMemo(() => {
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const currentYear = new Date().getFullYear();
    
    return months.map(month => {
      const monthIndex = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].indexOf(month);
      const paymentsInMonth = allPayments.filter(payment => {
        const paymentDate = new Date(payment.paidAt || payment.createdAt);
        return paymentDate.getMonth() === monthIndex + 2 && 
               paymentDate.getFullYear() === currentYear && 
               payment.status === 'Completed';
      });
      const revenue = paymentsInMonth.reduce((sum, p) => sum + (p.amount || 0), 0);
      return {
        label: month,
        value: revenue
      };
    });
  }, [allPayments]);

  useEffect(() => {
    // Calculate statistics from real data
    const completedPayments = allPayments.filter(p => p.status === 'Completed');
    const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const uniqueCustomers = new Set(allBookings.map(b => b.userId)).size;
    
    const completedBookings = allBookings.filter(b => b.status === 'Completed').length;
    const pendingBookings = allBookings.filter(b => b.status === 'Pending').length;
    const cancelledBookings = allBookings.filter(b => b.status === 'Cancelled' || b.status === 'Not Approved').length;
    
    setStats({
      totalBookings: allBookings.length,
      totalRevenue,
      totalCustomers: uniqueCustomers,
      totalVehicles: vehicles.length,
      completedBookings,
      pendingBookings,
      cancelledBookings
    });
    
    // Generate reports from real data
    const reports = [
      {
        id: 'RPT-001',
        type: 'Bookings',
        dateGenerated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        period: 'All Time',
        total: `${allBookings.length} bookings`,
        status: 'Completed'
      },
      {
        id: 'RPT-002',
        type: 'Revenue',
        dateGenerated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        period: 'All Time',
        total: `₱${totalRevenue.toLocaleString()}`,
        status: 'Completed'
      },
      {
        id: 'RPT-003',
        type: 'Customers',
        dateGenerated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        period: 'All Time',
        total: `${uniqueCustomers} customers`,
        status: 'Completed'
      },
      {
        id: 'RPT-004',
        type: 'Vehicles',
        dateGenerated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        period: 'All Time',
        total: `${vehicles.length} vehicles`,
        status: 'Completed'
      }
    ];
    setRecentReports(reports);
  }, [allBookings, allPayments, vehicles]);

  const chartData = chartType === 'revenue' ? monthlyRevenueData : monthlyBookingsData;

  const generateReport = () => {
    alert('Report generated based on current data!');
  };

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <AdminSidebar />
      
      <main style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <h1 style={styles.pageTitle}>📊 Manage Reports</h1>

          {/* Top Bar */}
          <div style={styles.topBar}>
            <div style={styles.filters}>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={styles.select}>
                <option value="all">All Reports</option>
                <option value="bookings">Bookings</option>
                <option value="revenue">Revenue</option>
                <option value="customers">Customers</option>
                <option value="vehicles">Vehicles</option>
              </select>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.dateInput} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.dateInput} />
              <button style={styles.filterBtn} onClick={generateReport}>📈 Generate Report</button>
            </div>
          </div>

          {/* Summary Blocks */}
          <div style={styles.summaryBlocks}>
            <div style={styles.summaryBlock}>
              <div style={{...styles.summaryIconBox, backgroundColor: '#e8effc'}}>📋</div>
              <div style={styles.summaryText}>
                <strong>{stats.totalBookings}</strong>
                <span>Total Bookings</span>
              </div>
            </div>
            <div style={styles.summaryBlock}>
              <div style={{...styles.summaryIconBox, backgroundColor: '#e8f5e9'}}>💰</div>
              <div style={styles.summaryText}>
                <strong>₱{stats.totalRevenue.toLocaleString()}</strong>
                <span>Total Revenue</span>
              </div>
            </div>
            <div style={styles.summaryBlock}>
              <div style={{...styles.summaryIconBox, backgroundColor: '#fff3e0'}}>👥</div>
              <div style={styles.summaryText}>
                <strong>{stats.totalCustomers}</strong>
                <span>Total Customers</span>
              </div>
            </div>
            <div style={styles.summaryBlock}>
              <div style={{...styles.summaryIconBox, backgroundColor: '#fce4ec'}}>🚗</div>
              <div style={styles.summaryText}>
                <strong>{stats.totalVehicles}</strong>
                <span>Total Vehicles</span>
              </div>
            </div>
          </div>

          {/* Booking Stats */}
          <div style={styles.bookingStats}>
            <div style={styles.bookingStat}>
              <span style={{...styles.bookingStatValue, color: '#28a745'}}>✓ {stats.completedBookings}</span>
              <span style={styles.bookingStatLabel}>Completed</span>
            </div>
            <div style={styles.bookingStat}>
              <span style={{...styles.bookingStatValue, color: '#ffc107'}}>⏳ {stats.pendingBookings}</span>
              <span style={styles.bookingStatLabel}>Pending</span>
            </div>
            <div style={styles.bookingStat}>
              <span style={{...styles.bookingStatValue, color: '#dc3545'}}>✕ {stats.cancelledBookings}</span>
              <span style={styles.bookingStatLabel}>Cancelled</span>
            </div>
          </div>

          {/* Chart Container - Real Data from Bookings */}
          <div style={styles.chartContainer}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>📊 Analytics Overview (Starting March {new Date().getFullYear()})</h3>
              <div style={styles.chartTabs}>
                <button 
                  style={chartType === 'bookings' ? {...styles.chartTab, ...styles.chartTabActive} : styles.chartTab}
                  onClick={() => setChartType('bookings')}
                >
                  📋 Bookings
                </button>
                <button 
                  style={chartType === 'revenue' ? {...styles.chartTab, ...styles.chartTabActive} : styles.chartTab}
                  onClick={() => setChartType('revenue')}
                >
                  💰 Revenue
                </button>
              </div>
            </div>
            <div style={styles.chartWrapper}>
              <SimpleChart data={chartData} chartType={chartType} />
            </div>
          </div>

          {/* Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>📄 Report ID</th>
                  <th style={styles.th}>📊 Type</th>
                  <th style={styles.th}>📅 Date Generated</th>
                  <th style={styles.th}>📆 Period</th>
                  <th style={styles.th}>💵 Total</th>
                  <th style={styles.th}>✅ Status</th>
                  <th style={styles.th}>⚡ Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map(report => (
                  <tr key={report.id} style={styles.tr}>
                    <td style={styles.td}><strong>{report.id}</strong></td>
                    <td style={styles.td}>{report.type}</td>
                    <td style={styles.td}>{report.dateGenerated}</td>
                    <td style={styles.td}>{report.period}</td>
                    <td style={styles.td}><strong>{report.total}</strong></td>
                    <td style={styles.td}>
                      <span style={report.status === 'Completed' ? styles.statusCompleted : styles.statusPending}>
                        {report.status === 'Completed' ? '✓' : '⏳'} {report.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.actionBtn} title="Download">📥</button>
                      <button style={styles.actionBtn} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Row */}
          <section style={styles.infoRow}>
            <div style={styles.infoBox}>
              <div style={styles.infoIconBox}>💰</div>
              <div><strong>Affordable Rates</strong><span>Great prices on all vehicle types</span></div>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.infoIconBox}>🛡️</div>
              <div><strong>Safety & Security</strong><span>Well-maintained and safe rental cars</span></div>
            </div>
            <div style={styles.infoBox}>
              <div style={styles.infoIconBox}>📱</div>
              <div><strong>Easy Booking</strong><span>Quick and Hassle free online reservations</span></div>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inria+Serif:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'Inria Serif, serif' },
  mainContent: { flex: 1, marginLeft: '250px', marginTop: '60px', padding: '20px' },
  contentWrapper: { maxWidth: '1200px', margin: '0 auto' },
  pageTitle: { fontWeight: '700', fontSize: '28px', marginBottom: '24px', color: '#1a1a2e' },
  topBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  filters: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto' },
  select: { borderRadius: '10px', border: '1.6px solid #e0e0e0', padding: '10px 16px', fontWeight: '600', fontSize: '14px', color: '#444', cursor: 'pointer', background: '#fff' },
  dateInput: { borderRadius: '10px', border: '1.6px solid #e0e0e0', padding: '10px 16px', fontWeight: '600', fontSize: '14px', color: '#444', background: '#fff' },
  filterBtn: { backgroundColor: '#2846e3', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', padding: '12px 24px', color: 'white', cursor: 'pointer' },
  summaryBlocks: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  summaryBlock: { flex: '1 1 200px', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: '16px' },
  summaryIconBox: { width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
  summaryText: { display: 'flex', flexDirection: 'column' },
  bookingStats: { display: 'flex', gap: '15px', marginBottom: '24px', flexWrap: 'wrap' },
  bookingStat: { flex: '1 1 150px', background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  bookingStatValue: { display: 'block', fontSize: '24px', fontWeight: '700' },
  bookingStatLabel: { fontSize: '12px', color: '#666', fontWeight: '600', marginTop: '4px' },
  chartContainer: { background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px', marginBottom: '24px' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  chartTitle: { fontWeight: '700', fontSize: '20px', margin: 0, color: '#1a1a2e' },
  chartTabs: { display: 'flex', gap: '8px' },
  chartTab: { padding: '8px 20px', borderRadius: '20px', border: 'none', background: '#f0f0f0', color: '#666', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inria Serif, serif' },
  chartTabActive: { background: '#2846e3', color: '#fff' },
  chartWrapper: { height: '300px', position: 'relative' },
  tableContainer: { background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflowX: 'auto', marginBottom: '24px' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th: { padding: '16px 20px', color: '#1a1a2e', fontWeight: '700', textAlign: 'left', backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0', fontSize: '14px' },
  td: { padding: '16px 20px', color: '#555', fontSize: '14px', borderBottom: '1px solid #f0f0f0' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  statusCompleted: { padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', color: '#fff', backgroundColor: '#28a745' },
  statusPending: { padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', color: '#fff', backgroundColor: '#ffc107' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '5px', margin: '0 2px' },
  infoRow: { background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px 30px', display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' },
  infoBox: { display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 250px' },
  infoIconBox: { width: '50px', height: '50px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
};

export default ManageReports;
