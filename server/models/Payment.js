const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, trim: true },
    userId: { type: String, required: true, trim: true },
    userName: { type: String, trim: true, default: '' },
    carName: { type: String, trim: true, default: '' },
    receiptNumber: { type: String, trim: true, default: '' },
    amount: { type: Number, default: 0 },
    method: { type: String, trim: true, default: 'cash' },
    status: { type: String, trim: true, default: 'Completed' },
    paidAt: { type: String, trim: true, default: '' },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
