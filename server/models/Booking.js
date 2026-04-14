const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    userName: { type: String, trim: true, default: '' },
    carId: { type: mongoose.Schema.Types.Mixed, default: null },
    carName: { type: String, trim: true, default: '' },
    carImage: { type: String, default: '' },
    startDate: { type: String, trim: true, default: '' },
    endDate: { type: String, trim: true, default: '' },
    days: { type: Number, default: 1 },
    totalPrice: { type: Number, default: 0 },
    paymentMethod: { type: String, trim: true, default: '' },
    status: { type: String, trim: true, default: 'Pending' },
    remarks: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
