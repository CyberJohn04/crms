const mongoose = require('mongoose');

const userApplicationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true, unique: true },
    fullName: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    status: { type: String, trim: true, default: 'pending' },
    remarks: { type: String, trim: true, default: '' },
    submittedAt: { type: String, trim: true, default: '' },
    nationalId: { type: String, trim: true, default: '' },
    driverLicenseId: { type: String, trim: true, default: '' },
    nationalIdImage: { type: String, default: '' },
    nationalIdFileName: { type: String, trim: true, default: '' },
    driverLicenseImage: { type: String, default: '' },
    driverLicenseFileName: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports =
  mongoose.models.UserApplication || mongoose.model('UserApplication', userApplicationSchema);
