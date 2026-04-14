import React, { useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useVehicles } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';
import { useUserApplication } from '../context/UserApplicationContext';
import { useBookings } from '../context/BookingContext';

const BrowseCars = () => {
  const { getActiveVehicles } = useVehicles();
  const { user, isAuthenticated } = useAuth();
  const { getApplication } = useUserApplication();
  const { addBooking } = useBookings();
  const [filter, setFilter] = useState('all');
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsCar, setDetailsCar] = useState(null);
  const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const userApplication = user?.id ? getApplication(user.id) : null;
  const isApproved = userApplication?.status === 'approved';
  const hasApplication = userApplication !== null;

  const activeVehicles = getActiveVehicles();
  const cars = useMemo(() => activeVehicles.map(v => ({
    id: v.id,
    name: v.name,
    category: v.category ? v.category.toLowerCase() : 'sedan',
    price: parseInt(v.price, 10) || 1000,
    seats: Number(v.seats) || 5,
    image: v.image || 'https://via.placeholder.com/300x200?text=No+Image',
    brand: v.brand || '',
    model: v.model || '',
    year: v.year || new Date().getFullYear(),
    transmission: v.transmission || 'Automatic',
    fuelType: v.fuelType || 'Gasoline',
    color: v.color || '',
    plateNumber: v.plateNumber || '',
    description: v.description || '',
    features: Array.isArray(v.features) ? v.features : [],
    location: v.location || '',
    deposit: Number(v.deposit) || 0,
    insuranceIncluded: Boolean(v.insuranceIncluded),
    licenseRequired: v.licenseRequired || 'Standard'
  })), [activeVehicles]);
  const today = new Date().toISOString().split('T')[0];

  const handleFilterClick = (filterType) => setFilter(filterType);
  const handleSearch = (e) => e.preventDefault();

  const showTimedMessage = (type, text, timeout = 5000) => {
    setBookingMessage({ type, text });
    window.clearTimeout(window.__browseCarsMessageTimer);
    window.__browseCarsMessageTimer = window.setTimeout(() => {
      setBookingMessage({ type: '', text: '' });
    }, timeout);
  };

  const handleViewDetails = (car) => {
    setDetailsCar(car);
    setShowDetailsModal(true);
  };

  const handleBookClick = (car) => {
    if (!isAuthenticated) {
      showTimedMessage('error', 'Please login to book a vehicle.');
      return;
    }
    if (!hasApplication) {
      showTimedMessage('error', 'Please submit your profile application before booking.');
      return;
    }
    if (!isApproved) {
      showTimedMessage('error', 'Your application is not approved yet. Please wait for admin review.');
      return;
    }
    setSelectedCar(car);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedCar || !startDate || !endDate) {
      showTimedMessage('error', 'Please select both a start date and an end date.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const startOfToday = new Date(`${today}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      showTimedMessage('error', 'Please choose valid booking dates.');
      return;
    }

    if (start < startOfToday) {
      showTimedMessage('error', 'Start date cannot be earlier than today.');
      return;
    }

    if (end < start) {
      showTimedMessage('error', 'End date must be the same as or later than the start date.');
      return;
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const totalPrice = selectedCar.price * days;
    setSubmittingBooking(true);
    try {
      await addBooking({
        userId: user.id,
        userName: user.name,
        carId: selectedCar.id,
        carName: selectedCar.name,
        carImage: selectedCar.image,
        startDate,
        endDate,
        days,
        totalPrice,
        paymentMethod,
        status: 'Pending',
        remarks: ''
      });

      setShowBookingModal(false);
      setSelectedCar(null);
      setStartDate('');
      setEndDate('');
      setPaymentMethod('cash');
      showTimedMessage(
        'success',
        `Booking submitted successfully. Payment method: ${paymentMethod === 'cash' ? 'Cash upon pickup' : 'GCash'}.`
      );
    } catch (error) {
      showTimedMessage('error', error.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const filteredCars = cars.filter(car => {
    const typeMatch = filter === 'all' || car.category === filter;
    const priceMatch = !price || car.price <= parseFloat(price);
    const seatsMatch = !seats || car.seats >= parseInt(seats);
    return typeMatch && priceMatch && seatsMatch;
  });

  return (
    <div style={styles.container}>
      <Navbar />
      <Sidebar />
      <div className="responsive-dashboard" style={styles.dashboardContent}>
        <h2 style={styles.heading}>Browse Cars</h2>

        {bookingMessage.text && (
          <div
            style={{
              ...styles.messageBox,
              ...(bookingMessage.type === 'success' ? styles.successMessage : styles.errorMessage),
            }}
          >
            {bookingMessage.text}
          </div>
        )}

        {isAuthenticated && !isApproved && hasApplication && (
          <div style={styles.noticeBox}>
            {userApplication?.status === 'pending' 
              ? '⏳ Your application is pending approval. You will be able to book vehicles once approved.'
              : userApplication?.status === 'declined'
              ? `✕ Your application was declined: ${userApplication.remarks || 'Please submit your information again in Profile.'}`
              : 'Please submit your information in Profile to book vehicles.'
            }
          </div>
        )}

        <form style={styles.filterForm} onSubmit={handleSearch}>
          <button type="button" style={{...styles.filterBtn, ...(filter === 'all' ? styles.filterBtnActive : {})}} onClick={() => handleFilterClick('all')}>All</button>
          <button type="button" style={{...styles.filterBtn, ...(filter === 'sedan' ? styles.filterBtnActive : {})}} onClick={() => handleFilterClick('sedan')}>Sedan</button>
          <button type="button" style={{...styles.filterBtn, ...(filter === 'suv' ? styles.filterBtnActive : {})}} onClick={() => handleFilterClick('suv')}>SUV</button>
          <button type="button" style={{...styles.filterBtn, ...(filter === 'luxury' ? styles.filterBtnActive : {})}} onClick={() => handleFilterClick('luxury')}>Luxury</button>
          <button type="button" style={{...styles.filterBtn, ...(filter === 'van' ? styles.filterBtnActive : {})}} onClick={() => handleFilterClick('van')}>VAN</button>
          <input type="text" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} />
          <input type="text" placeholder="Seats" value={seats} onChange={(e) => setSeats(e.target.value)} style={styles.input} />
          <input type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.input} />
          <input type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.input} />
          <input type="submit" value="Search" style={styles.submitBtn} />
        </form>

        <div style={styles.carsContainer}>
          {filteredCars.length === 0 ? (
            <div style={styles.noCarsMessage}>No active vehicles are available right now. Add or activate vehicles from the admin panel to show them here.</div>
          ) : (
            filteredCars.map(car => (
              <div key={car.id} style={styles.carCard}>
                {car.favorite && <span style={styles.heartIcon}>♥</span>}
                <img src={car.image} alt={car.name} style={styles.carImage} />
                <h3 style={styles.carName}>{car.name}</h3>
                <div style={styles.carCategory}>{car.category}</div>
                <div style={styles.price}><sup>₱</sup>{car.price.toLocaleString()}.00/day</div>
                <div style={styles.btns}>
                  <button style={{...styles.bookBtn, opacity: isApproved ? 1 : 0.6, cursor: isApproved ? 'pointer' : 'not-allowed'}} onClick={() => handleBookClick(car)}>
                    {isApproved ? 'Book Now' : 'Complete Profile'}
                  </button>
                  <button style={styles.viewBtn} onClick={() => handleViewDetails(car)}>View Details</button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Vehicle Details Modal */}
      {showDetailsModal && detailsCar && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div style={styles.detailsModal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeDetailsBtn} onClick={() => setShowDetailsModal(false)}>×</button>
            
            <div style={styles.detailsHeader}>
              <img src={detailsCar.image} alt={detailsCar.name} style={styles.detailsImage} />
              <div style={styles.detailsHeaderInfo}>
                <h2 style={styles.detailsTitle}>{detailsCar.name}</h2>
                <span style={styles.detailsCategory}>{detailsCar.category}</span>
                <div style={styles.detailsPrice}><sup>₱</sup>{detailsCar.price.toLocaleString()}.00/day</div>
              </div>
            </div>

            <div style={styles.detailsBody}>
              <div style={styles.detailsSection}>
                <h3 style={styles.detailsSectionTitle}>Vehicle Information</h3>
                <div style={styles.detailsGrid}>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Brand</span>
                    <span style={styles.detailsValue}>{detailsCar.brand || 'Toyota'}</span>
                  </div>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Model</span>
                    <span style={styles.detailsValue}>{detailsCar.model || detailsCar.name}</span>
                  </div>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Year</span>
                    <span style={styles.detailsValue}>{detailsCar.year}</span>
                  </div>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Transmission</span>
                    <span style={styles.detailsValue}>{detailsCar.transmission}</span>
                  </div>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Fuel Type</span>
                    <span style={styles.detailsValue}>{detailsCar.fuelType}</span>
                  </div>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Seats</span>
                    <span style={styles.detailsValue}>{detailsCar.seats} passengers</span>
                  </div>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Color</span>
                    <span style={styles.detailsValue}>{detailsCar.color || 'N/A'}</span>
                  </div>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Plate Number</span>
                    <span style={styles.detailsValue}>{detailsCar.plateNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div style={styles.detailsSection}>
                <h3 style={styles.detailsSectionTitle}>Rental Information</h3>
                <div style={styles.detailsGrid}>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Location</span>
                    <span style={styles.detailsValue}>{detailsCar.location || 'Tacloban City'}</span>
                  </div>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Deposit</span>
                    <span style={styles.detailsValue}>₱{detailsCar.deposit?.toLocaleString() || 0}</span>
                  </div>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>Insurance</span>
                    <span style={styles.detailsValue}>{detailsCar.insuranceIncluded ? 'Included' : 'Not Included'}</span>
                  </div>
                  <div style={styles.detailsItem}>
                    <span style={styles.detailsLabel}>License Required</span>
                    <span style={styles.detailsValue}>{detailsCar.licenseRequired || 'Standard'}</span>
                  </div>
                </div>
              </div>

              {detailsCar.description && (
                <div style={styles.detailsSection}>
                  <h3 style={styles.detailsSectionTitle}>Description</h3>
                  <p style={styles.detailsDescription}>{detailsCar.description}</p>
                </div>
              )}

              {detailsCar.features && detailsCar.features.length > 0 && (
                <div style={styles.detailsSection}>
                  <h3 style={styles.detailsSectionTitle}>Features</h3>
                  <div style={styles.featuresList}>
                    {detailsCar.features.map((feature, index) => (
                      <span key={index} style={styles.featureTag}>{feature}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.detailsFooter}>
              <button style={styles.bookNowBtn} onClick={() => { setShowDetailsModal(false); handleBookClick(detailsCar); }} disabled={!isApproved}>
                {isApproved ? 'Book Now' : 'Approval Required'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedCar && (
        <div style={styles.modalOverlay} onClick={() => setShowBookingModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Confirm Booking</h3>
            <div style={styles.bookingDetails}>
              <div style={styles.detailRow}><span>Car:</span><strong>{selectedCar.name}</strong></div>
              <div style={styles.detailRow}><span>Price per day:</span><strong>₱{selectedCar.price}</strong></div>
              <div style={styles.detailRow}>
                <span>Start Date:</span>
                <input type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.dateInput} />
              </div>
              <div style={styles.detailRow}>
                <span>End Date:</span>
                <input type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.dateInput} />
              </div>
              {startDate && endDate && new Date(endDate) >= new Date(startDate) && (
                <div style={styles.detailRow}><span>Total Days:</span><strong>{Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1} days</strong></div>
              )}
              {startDate && endDate && (
                <div style={styles.totalRow}><span>Total Price:</span><strong>₱{selectedCar.price * (Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)}</strong></div>
              )}
              
              <div style={styles.paymentSection}>
                <label style={styles.paymentLabel}>Payment Method:</label>
                <div style={styles.paymentOptions}>
                  <label style={styles.paymentOption}>
                    <input type="radio" name="paymentMethod" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span style={styles.paymentIcon}>💵</span>
                    <span>Cash upon Pickup</span>
                  </label>
                  <label style={styles.paymentOption}>
                    <input type="radio" name="paymentMethod" value="gcash" checked={paymentMethod === 'gcash'} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span style={styles.paymentIcon}>📱</span>
                    <span>GCash</span>
                  </label>
                </div>
              </div>
            </div>
            <div style={styles.modalButtons}>
              <button style={styles.cancelBtn} onClick={() => setShowBookingModal(false)}>Cancel</button>
              <button style={styles.confirmBtn} onClick={handleConfirmBooking} disabled={submittingBooking}>
                {submittingBooking ? 'Submitting...' : 'Confirm Booking'}
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
  container: { minHeight: '100vh', background: '#f9fcfd', fontFamily: 'Inria Serif, serif' },
  dashboardContent: { marginLeft: '250px', marginTop: '60px', padding: '30px', overflowY: 'auto' },
  heading: { fontWeight: 'bold', fontSize: '24px', marginBottom: '15px', color: '#333' },
  messageBox: { padding: '15px', borderRadius: '8px', marginBottom: '20px', fontWeight: '600' },
  successMessage: { background: '#d4edda', color: '#155724' },
  errorMessage: { background: '#f8d7da', color: '#721c24' },
  noticeBox: { background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '8px', padding: '15px', marginBottom: '20px', color: '#856404', fontWeight: '500' },
  filterForm: { background: '#fff', padding: '10px 15px', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '20px', border: '1px solid #d0d5dd' },
  filterBtn: { padding: '5px 12px', fontSize: '14px', borderRadius: '5px', border: '1px solid #444', background: '#fff', cursor: 'pointer' },
  filterBtnActive: { backgroundColor: '#585CE5', color: '#fff', borderColor: '#585CE5' },
  input: { padding: '6px 8px', fontSize: '14px', border: '1px solid #d0d5dd', borderRadius: '5px', width: '120px' },
  submitBtn: { padding: '5px 12px', fontSize: '14px', borderRadius: '5px', border: '1px solid #444', background: '#fff', cursor: 'pointer' },
  carsContainer: { display: 'flex', flexWrap: 'wrap', gap: '15px' },
  carCard: { width: '300px', background: '#fff', border: '1px solid #d8d8d8', borderRadius: '8px', boxShadow: '1px 1px 6px #ccc', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
  heartIcon: { position: 'absolute', top: '10px', right: '15px', color: '#e33539', fontSize: '20px' },
  carImage: { maxWidth: '260px', borderRadius: '8px', height: '150px', objectFit: 'cover' },
  carName: { fontWeight: 'bold', letterSpacing: '0.9px', marginTop: '8px', alignSelf: 'flex-start', color: '#333' },
  carCategory: { fontSize: '12px', color: '#666', alignSelf: 'flex-start', textTransform: 'capitalize', marginTop: '2px' },
  price: { fontWeight: '600', marginTop: '5px', alignSelf: 'flex-start', color: '#333' },
  btns: { marginTop: '12px', alignSelf: 'flex-start', display: 'flex', gap: '8px' },
  bookBtn: { backgroundColor: '#2d48ff', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '5px', fontWeight: '600' },
  viewBtn: { background: 'none', border: 'none', color: '#4a6984', fontSize: '13px', cursor: 'pointer', padding: '0 6px' },
  noCarsMessage: { width: '100%', textAlign: 'center', padding: '40px 20px', fontSize: '18px', color: '#666', fontWeight: '500' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: 'white', borderRadius: '12px', padding: '25px', width: '90%', maxWidth: '450px' },
  modalTitle: { marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '700' },
  bookingDetails: { marginBottom: '20px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
  totalRow: { display: 'flex', justifyContent: 'space-between', padding: '15px 0', fontSize: '18px', fontWeight: '700', color: '#28a745' },
  dateInput: { padding: '5px 10px', borderRadius: '5px', border: '1px solid #ddd' },
  paymentSection: { marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' },
  paymentLabel: { display: 'block', fontWeight: '600', marginBottom: '10px', fontSize: '14px' },
  paymentOptions: { display: 'flex', gap: '15px', marginBottom: '10px' },
  paymentOption: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' },
  paymentIcon: { fontSize: '20px' },
  modalButtons: { display: 'flex', gap: '10px' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontWeight: '600' },
  confirmBtn: { flex: 1, padding: '12px', borderRadius: '6px', border: 'none', background: '#28a745', color: '#fff', cursor: 'pointer', fontWeight: '600' },
  // Details Modal Styles
  detailsModal: { background: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
  closeDetailsBtn: { position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#666', zIndex: 10 },
  detailsHeader: { display: 'flex', gap: '20px', padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #eee' },
  detailsImage: { width: '200px', height: '130px', objectFit: 'cover', borderRadius: '8px' },
  detailsHeaderInfo: { flex: 1 },
  detailsTitle: { margin: '0 0 5px', fontSize: '22px', fontWeight: '700' },
  detailsCategory: { display: 'inline-block', background: '#e8f0fd', color: '#2846e3', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' },
  detailsPrice: { fontSize: '24px', fontWeight: '700', color: '#28a745', marginTop: '10px' },
  detailsBody: { padding: '20px' },
  detailsSection: { marginBottom: '20px' },
  detailsSectionTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#333', borderBottom: '2px solid #2846e3', paddingBottom: '5px' },
  detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  detailsItem: { display: 'flex', flexDirection: 'column' },
  detailsLabel: { fontSize: '12px', color: '#666', fontWeight: '600' },
  detailsValue: { fontSize: '14px', color: '#333', fontWeight: '600' },
  detailsDescription: { fontSize: '14px', color: '#555', lineHeight: '1.5', margin: 0 },
  featuresList: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  featureTag: { background: '#e8f0fd', padding: '5px 12px', borderRadius: '15px', fontSize: '12px', fontWeight: '600', color: '#2846e3' },
  detailsFooter: { padding: '20px', borderTop: '1px solid #eee', textAlign: 'center' },
  bookNowBtn: { background: '#2846e3', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
};

export default BrowseCars;

