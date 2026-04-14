const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    carName: { type: String, trim: true, default: '' },
    carImage: { type: String, default: '' },
    returnDate: { type: String, trim: true, default: '' },
    rating: { type: Number, default: 0 },
    userRemarks: { type: String, trim: true, default: '' },
    hasDamage: { type: Boolean, default: false },
    damageDescription: { type: String, trim: true, default: '' },
    paymentStatus: { type: String, trim: true, default: 'paid' },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, trim: true, default: 'Pending' },
    adminRemarks: { type: String, trim: true, default: '' },
    returnPhoto: { type: String, default: '' },
    returnPhotoName: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.models.Return || mongoose.model('Return', returnSchema);
