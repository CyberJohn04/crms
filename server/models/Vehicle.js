const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, default: 'active', trim: true },
    image: { type: String, default: '' },
    brand: { type: String, default: '', trim: true },
    model: { type: String, default: '', trim: true },
    year: { type: Number, default: new Date().getFullYear() },
    transmission: { type: String, default: 'Automatic', trim: true },
    fuelType: { type: String, default: 'Gasoline', trim: true },
    seats: { type: Number, default: 5, min: 1 },
    color: { type: String, default: '', trim: true },
    plateNumber: { type: String, default: '', trim: true },
    licenseRequired: { type: String, default: 'Standard', trim: true },
    description: { type: String, default: '', trim: true },
    features: { type: [String], default: [] },
    availability: { type: Boolean, default: true },
    location: { type: String, default: '', trim: true },
    deposit: { type: Number, default: 0, min: 0 },
    insuranceIncluded: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
