const express = require('express');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const router = express.Router();

// Routes
router.get('/stats', async (_req, res) => {
  try {
    const [vehicles, bookings, payments] = await Promise.all([
      Vehicle.find(),
      Booking.find(),
      Payment.find(),
    ]);

    return res.json({
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter((vehicle) => vehicle.status === 'active').length,
      totalBookings: bookings.length,
      totalPayments: payments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load dashboard stats.' });
  }
});

module.exports = router;