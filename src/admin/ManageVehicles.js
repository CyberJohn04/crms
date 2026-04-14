import React, { useState, useRef } from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import { useVehicles } from '../context/VehicleContext';

const ManageVehicles = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, toggleVehicleStatus } = useVehicles();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formDataStep1, setFormDataStep1] = useState({ 
    name: '', 
    category: '', 
    price: '', 
    status: 'active', 
    image: '' 
  });
  
  const [formDataStep2, setFormDataStep2] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    seats: 5,
    color: '',
    plateNumber: '',
    licenseRequired: 'Standard',
    description: '',
    features: [],
    location: '',
    deposit: 0,
    insuranceIncluded: false,
  });
  
  const [imagePreview, setImagePreview] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const fileInputRef = useRef(null);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || vehicle.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = !statusFilter || vehicle.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedVehicles(filteredVehicles.map(v => v.id));
    } else {
      setSelectedVehicles([]);
    }
  };

  const handleSelectVehicle = (id) => {
    if (selectedVehicles.includes(id)) {
      setSelectedVehicles(selectedVehicles.filter(v => v !== id));
    } else {
      setSelectedVehicles([...selectedVehicles, id]);
    }
  };

  const handleAddVehicleClick = () => {
    setEditingVehicle(null);
    setFormDataStep1({ name: '', category: '', price: '', status: 'active', image: '' });
    setFormDataStep2({
      brand: '', model: '', year: new Date().getFullYear(), transmission: 'Automatic',
      fuelType: 'Gasoline', seats: 5, color: '', plateNumber: '', licenseRequired: 'Standard',
      description: '', features: [], location: '', deposit: 0, insuranceIncluded: false,
    });
    setImagePreview('');
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormDataStep1({ name: vehicle.name || '', category: vehicle.category || '', price: vehicle.price || '', status: vehicle.status || 'active', image: vehicle.image || '' });
    setFormDataStep2({
      brand: vehicle.brand || '', model: vehicle.model || '', year: vehicle.year || new Date().getFullYear(),
      transmission: vehicle.transmission || 'Automatic', fuelType: vehicle.fuelType || 'Gasoline',
      seats: vehicle.seats || 5, color: vehicle.color || '', plateNumber: vehicle.plateNumber || '',
      licenseRequired: vehicle.licenseRequired || 'Standard', description: vehicle.description || '',
      features: vehicle.features || [], location: vehicle.location || '', deposit: vehicle.deposit || 0,
      insuranceIncluded: vehicle.insuranceIncluded || false,
    });
    setImagePreview(vehicle.image || '');
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleDeleteVehicle = (id) => deleteVehicle(id);
  const handleToggleStatus = (id) => toggleVehicleStatus(id);
  const handleNextStep = () => setCurrentStep(2);
  const handlePrevStep = () => setCurrentStep(1);

  const handleSaveVehicle = () => {
    const completeFormData = { ...formDataStep1, ...formDataStep2 };
    if (editingVehicle) { updateVehicle(editingVehicle.id, completeFormData); } 
    else { addVehicle(completeFormData); }
    setShowModal(false);
  };

  const handleInputChangeStep1 = (e) => setFormDataStep1({ ...formDataStep1, [e.target.name]: e.target.value });
  const handleInputChangeStep2 = (e) => {
    const { name, value, type, checked } = e.target;
    setFormDataStep2(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) { alert('Please upload a valid image file'); return; }
      if (file.size > 5 * 1024 * 1024) { alert('Image size must be less than 5MB'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setFormDataStep1({ ...formDataStep1, image: reader.result }); setImagePreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => { setFormDataStep1({ ...formDataStep1, image: '' }); setImagePreview(''); if (fileInputRef.current) fileInputRef.current.value = ''; };
  const addFeature = () => { if (featureInput.trim()) { setFormDataStep2(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] })); setFeatureInput(''); } };
  const removeFeature = (index) => setFormDataStep2(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;

  const renderFeatureTags = () => {
    if (formDataStep2.features.length === 0) return null;
    return (
      <div style={styles.featureList}>
        {formDataStep2.features.map((feature, index) => (
          <span key={index} style={styles.featureTag}>
            {feature}
            <button type="button" onClick={() => removeFeature(index)} style={styles.removeFeatureBtn}>×</button>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <AdminNavbar />
      <AdminSidebar />
      <main className="responsive-main" style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <h2 style={styles.pageTitle}>Manage Vehicles</h2>
          <div style={styles.topInfoCards}>
            <div style={styles.infoCard}><div style={styles.iconContainer}><svg viewBox="0 0 24 24" stroke="#329b4a" fill="none" strokeWidth="2"><path d="M3 10h18v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7Z"/><path d="M3 10V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v3"/></svg></div><div style={styles.infoText}><span style={styles.infoNumber}>{totalVehicles}</span> Total Vehicles</div></div>
            <div style={styles.infoCard}><div style={{...styles.iconContainer, backgroundColor: '#6bbb6f'}}><svg viewBox="0 0 24 24" stroke="#329b4a" fill="none" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div style={styles.infoText}><span style={{...styles.infoNumber, color: '#6bbb6f'}}>{activeVehicles}</span> Active Vehicles</div></div>
            <div style={styles.infoCard}><div style={{...styles.iconContainer, backgroundColor: '#cb3b17'}}><svg viewBox="0 0 24 24" stroke="#cb3b17" fill="none" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><div style={styles.infoText}><span style={{...styles.infoNumber, color: '#cb3b17'}}>{inactiveVehicles}</span> Inactive Vehicles</div></div>
          </div>
          <button style={styles.addBtn} onClick={handleAddVehicleClick}>+ Add Vehicle</button>
          <div style={styles.filters}>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={styles.select}><option value="">Car Type</option><option value="sedan">Sedan</option><option value="suv">SUV</option><option value="van">Van</option><option value="luxury">Luxury</option></select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}><option value="">Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
            <input type="search" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead><tr><th style={{...styles.th, ...styles.checkboxCell}}><input type="checkbox" checked={selectedVehicles.length === filteredVehicles.length && filteredVehicles.length > 0} onChange={handleSelectAll} /></th><th style={styles.th}>Photos</th><th style={styles.th}>Car</th><th style={styles.th}>Category</th><th style={styles.th}>Daily Rate</th><th style={styles.th}>Status</th><th style={{...styles.th, ...styles.actionsCell}}>Actions</th></tr></thead>
              <tbody>
                {filteredVehicles.length === 0 ? (<tr><td colSpan="7" style={{...styles.td, textAlign: 'center', padding: '40px'}}>No vehicles found</td></tr>) : (filteredVehicles.map(vehicle => (<tr key={vehicle.id} style={styles.tr}><td style={{...styles.td, ...styles.checkboxCell}}><input type="checkbox" checked={selectedVehicles.includes(vehicle.id)} onChange={() => handleSelectVehicle(vehicle.id)} /></td><td style={{...styles.td, ...styles.photosCell}}><img src={vehicle.image || 'https://via.placeholder.com/150'} alt={vehicle.name} style={styles.carImage} /></td><td style={{...styles.td, ...styles.carName}}>{vehicle.name}</td><td style={{...styles.td, ...styles.category}}>{vehicle.category}</td><td style={{...styles.td, ...styles.dailyRate}}>₱{vehicle.price}</td><td style={{...styles.td, ...styles.statusCell}}><span style={{...styles.statusBadge, ...(vehicle.status === 'active' ? styles.statusActive : styles.statusInactive)}}>{vehicle.status}</span></td><td style={{...styles.td, ...styles.actionsCell}}><button style={styles.actionBtn} onClick={() => handleEditVehicle(vehicle)}>✏️</button><button style={styles.actionBtn} onClick={() => handleToggleStatus(vehicle.id)}>{vehicle.status === 'active' ? '⏸️' : '▶️'}</button><button style={styles.actionBtn} onClick={() => handleDeleteVehicle(vehicle.id)}>🗑️</button></td></tr>)))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {showModal && (<div style={styles.modalOverlay} onClick={() => setShowModal(false)}><div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'} <span style={styles.stepIndicator}>Step {currentStep} of 2</span></h3>
        <div style={styles.progressBar}><div style={{...styles.progressFill, width: currentStep === 1 ? '50%' : '100%'}}></div></div>
        {currentStep === 1 && (<div style={styles.formStep}>
          <div style={styles.formGroup}><label style={styles.label}>Car Name *</label><input type="text" name="name" value={formDataStep1.name} onChange={handleInputChangeStep1} style={styles.input} required /></div>
          <div style={styles.formGroup}><label style={styles.label}>Category *</label><select name="category" value={formDataStep1.category} onChange={handleInputChangeStep1} style={styles.input} required><option value="">Select Category</option><option value="Sedan">Sedan</option><option value="SUV">SUV</option><option value="Van">Van</option><option value="Luxury">Luxury</option></select></div>
          <div style={styles.formGroup}><label style={styles.label}>Daily Rate (₱) *</label><input type="number" name="price" value={formDataStep1.price} onChange={handleInputChangeStep1} style={styles.input} required /></div>
          <div style={styles.formGroup}><label style={styles.label}>Status</label><select name="status" value={formDataStep1.status} onChange={handleInputChangeStep1} style={styles.input}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <div style={styles.formGroup}><label style={styles.label}>Vehicle Image</label><input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} style={styles.fileInput} />{imagePreview && (<div style={styles.imagePreviewContainer}><img src={imagePreview} alt="Preview" style={styles.imagePreview} /><button type="button" onClick={removeImage} style={styles.removeImageBtn}>×</button></div>)}</div>
        </div>)}
        {currentStep === 2 && (<div style={styles.formStep}>
          <div style={styles.formRow}><div style={styles.formGroup}><label style={styles.label}>Brand</label><input type="text" name="brand" value={formDataStep2.brand} onChange={handleInputChangeStep2} style={styles.input} placeholder="e.g., Toyota" /></div><div style={styles.formGroup}><label style={styles.label}>Model</label><input type="text" name="model" value={formDataStep2.model} onChange={handleInputChangeStep2} style={styles.input} placeholder="e.g., Camry" /></div></div>
          <div style={styles.formRow}><div style={styles.formGroup}><label style={styles.label}>Year</label><input type="number" name="year" value={formDataStep2.year} onChange={handleInputChangeStep2} style={styles.input} /></div><div style={styles.formGroup}><label style={styles.label}>Transmission</label><select name="transmission" value={formDataStep2.transmission} onChange={handleInputChangeStep2} style={styles.input}><option value="Automatic">Automatic</option><option value="Manual">Manual</option></select></div></div>
          <div style={styles.formRow}><div style={styles.formGroup}><label style={styles.label}>Fuel Type</label><select name="fuelType" value={formDataStep2.fuelType} onChange={handleInputChangeStep2} style={styles.input}><option value="Gasoline">Gasoline</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option><option value="Hybrid">Hybrid</option></select></div><div style={styles.formGroup}><label style={styles.label}>Seats</label><input type="number" name="seats" value={formDataStep2.seats} onChange={handleInputChangeStep2} style={styles.input} min="2" max="50" /></div></div>
          <div style={styles.formRow}><div style={styles.formGroup}><label style={styles.label}>Color</label><input type="text" name="color" value={formDataStep2.color} onChange={handleInputChangeStep2} style={styles.input} placeholder="e.g., Silver" /></div><div style={styles.formGroup}><label style={styles.label}>Plate Number</label><input type="text" name="plateNumber" value={formDataStep2.plateNumber} onChange={handleInputChangeStep2} style={styles.input} placeholder="e.g., ABC-1234" /></div></div>
          <div style={styles.formGroup}><label style={styles.label}>Location</label><input type="text" name="location" value={formDataStep2.location} onChange={handleInputChangeStep2} style={styles.input} placeholder="e.g., Tacloban City" /></div>
          <div style={styles.formRow}><div style={styles.formGroup}><label style={styles.label}>Deposit (₱)</label><input type="number" name="deposit" value={formDataStep2.deposit} onChange={handleInputChangeStep2} style={styles.input} /></div><div style={styles.formGroup}><label style={styles.checkboxLabel}><input type="checkbox" name="insuranceIncluded" checked={formDataStep2.insuranceIncluded} onChange={handleInputChangeStep2} style={styles.checkbox} />Insurance Included</label></div></div>
          <div style={styles.formGroup}><label style={styles.label}>Description</label><textarea name="description" value={formDataStep2.description} onChange={handleInputChangeStep2} style={{...styles.input, minHeight: '80px'}} placeholder="Vehicle description..." /></div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Features</label>
            <div style={styles.featureInput}>
              <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} style={{...styles.input, flex: 1}} placeholder="Add a feature" />
              <button type="button" onClick={addFeature} style={styles.addFeatureBtn}>Add</button>
            </div>
            {renderFeatureTags()}
          </div>
        </div>)}
        <div style={styles.modalButtons}>
          {currentStep === 1 ? (<><button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button><button type="button" onClick={handleNextStep} style={styles.nextBtn}>Next</button></>) : (<><button type="button" onClick={handlePrevStep} style={styles.prevBtn}>Previous</button><button type="button" onClick={handleSaveVehicle} style={styles.saveBtn}>Save Vehicle</button></>)}
        </div>
      </div></div>)}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inria+Serif&display=swap');* { box-sizing: border-box; }`}</style>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#e8f2f2', fontFamily: 'Inria Serif, serif' },
  mainContent: { flex: 1, marginLeft: '250px', marginTop: '60px', padding: '20px' },
  contentWrapper: { maxWidth: '1040px', margin: '0 auto' },
  pageTitle: { fontSize: '22px', fontWeight: '700', marginBottom: '14px', fontFamily: 'Inria Serif, serif' },
  topInfoCards: { display: 'flex', gap: '14px', marginBottom: '18px' },
  infoCard: { flex: '1 1 0', background: 'white', padding: '14px 18px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '11px', boxShadow: '1.5px 2px 11px rgb(129 158 219 / 0.16)' },
  iconContainer: { flexShrink: 0, width: '32px', height: '32px', backgroundColor: '#d0e9de', borderRadius: '45%', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  iconSvg: { width: '18px', height: '18px' },
  infoText: { fontWeight: 600, whiteSpace: 'nowrap', fontSize: '14px' },
  infoNumber: { fontWeight: 700, color: '#282d35', fontSize: '18px' },
  addBtn: { backgroundColor: '#237643', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, padding: '11px 22px', fontSize: '14px', cursor: 'pointer', float: 'right', marginBottom: '14px', fontFamily: 'Inria Serif, serif' },
  filters: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' },
  select: { background: 'white', borderRadius: '8px', border: '1.5px solid #6c819f', fontWeight: 600, fontSize: '13.8px', padding: '7px 11px', minWidth: '120px', color: '#404040', fontFamily: 'Inria Serif, serif' },
  searchInput: { background: 'white', borderRadius: '8px', border: '1.5px solid #6c819f', fontWeight: 600, fontSize: '13.8px', padding: '7px 11px', minWidth: '120px', color: '#404040', fontFamily: 'Inria Serif, serif', width: '100%', flex: '1 1 250px' },
  tableContainer: { overflowX: 'auto', boxShadow: '1px 3px 8px rgb(129 158 219 / 0.16)', borderRadius: '14px', background: '#fff' },
  table: { borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed', fontSize: '15px', fontWeight: 600, fontFamily: 'Inria Serif, serif' },
  th: { whiteSpace: 'nowrap', padding: '15px 15px', color: '#414a84', textAlign: 'left', borderBottom: '2.4px solid #3967cb', backgroundColor: '#e1eaff' },
  td: { whiteSpace: 'nowrap', padding: '14px 15px', verticalAlign: 'middle', color: '#414a84', borderBottom: '1.5px solid #ddd' },
  tr: { borderBottom: '1.5px solid #ddd' },
  checkboxCell: { textAlign: 'center', width: '40px' },
  carImage: { width: '82px', height: '46px', borderRadius: '8px', objectFit: 'cover' },
  carName: { fontWeight: 700, color: '#000b8e' },
  category: { color: '#4652c4' },
  dailyRate: { fontWeight: 700, color: '#00ab00' },
  statusCell: { textAlign: 'center' },
  statusBadge: { padding: '7px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'default', whiteSpace: 'nowrap', display: 'inline-block' },
  statusActive: { backgroundColor: '#34871e', color: 'white' },
  statusInactive: { backgroundColor: '#cb3b17', color: 'white' },
  actionsCell: { textAlign: 'right', width: '120px' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '5px', margin: '0 2px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { marginTop: 0, marginBottom: '10px', fontSize: '20px', fontWeight: '700', fontFamily: 'Inria Serif, serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  stepIndicator: { fontSize: '12px', color: '#666', fontWeight: 'normal' },
  progressBar: { height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px', marginBottom: '20px' },
  progressFill: { height: '100%', backgroundColor: '#237643', borderRadius: '2px', transition: 'width 0.3s ease' },
  formStep: { display: 'flex', flexDirection: 'column', gap: '12px' },
  formRow: { display: 'flex', gap: '12px' },
  formGroup: { flex: 1, marginBottom: '8px' },
  label: { display: 'block', marginBottom: '4px', fontWeight: 600, fontSize: '14px', fontFamily: 'Inria Serif, serif' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #6c819f', fontSize: '14px', fontFamily: 'Inria Serif, serif' },
  fileInput: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #6c819f', fontSize: '14px', fontFamily: 'Inria Serif, serif', backgroundColor: '#fff' },
  imagePreviewContainer: { position: 'relative', marginTop: '10px', display: 'inline-block' },
  imagePreview: { width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' },
  removeImageBtn: { position: 'absolute', top: '-10px', right: '-10px', width: '25px', height: '25px', borderRadius: '50%', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  featureInput: { display: 'flex', gap: '8px' },
  addFeatureBtn: { padding: '10px 16px', backgroundColor: '#585CE5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontFamily: 'Inria Serif, serif' },
  featureList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' },
  featureTag: { backgroundColor: '#e8f0fd', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' },
  removeFeatureBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '14px', padding: '0 2px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginTop: '25px' },
  checkbox: { width: '18px', height: '18px' },
  modalButtons: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: { padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontFamily: 'Inria Serif, serif', fontWeight: 600 },
  nextBtn: { padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#237643', color: 'white', cursor: 'pointer', fontFamily: 'Inria Serif, serif', fontWeight: 600 },
  prevBtn: { padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontFamily: 'Inria Serif, serif', fontWeight: 600 },
  saveBtn: { padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#237643', color: 'white', cursor: 'pointer', fontFamily: 'Inria Serif, serif', fontWeight: 600 },
};

export default ManageVehicles;
