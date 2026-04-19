const express = require('express');
const jwt = require('jsonwebtoken');
const Booking = require('../models/Booking');
const User = require('../models/User');

const router = express.Router();

// Helper functions
const sanitizeDocument = (doc) => {
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = plain;
  return {
    ...rest,
    id: _id.toString(),
  };
};

const normalizeBookingPayload = (body = {}) => ({
  userId: String(body.userId || '').trim(),
  userName: String(body.userName || '').trim(),
  carId: body.carId ?? null,
  carName: String(body.carName || '').trim(),
  carImage: String(body.carImage || ''),
  startDate: String(body.startDate || '').trim(),
  endDate: String(body.endDate || '').trim(),
  days: Math.max(1, Number(body.days) || 1),
  totalPrice: Math.max(0, Number(body.totalPrice) || 0),
  paymentMethod: String(body.paymentMethod || '').trim(),
  status: String(body.status || 'Pending').trim(),
  remarks: String(body.remarks || '').trim(),
  createdAt: body.createdAt,
  updatedAt: body.updatedAt,
});

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'car-rental-dev-secret';
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// Routes
router.get('/my-bookings', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.json(bookings.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load your bookings.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.json(bookings.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load bookings.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    return res.json(sanitizeDocument(booking));
  } catch (error) {
    return res.status(404).json({ message: 'Booking not found.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = normalizeBookingPayload(req.body);
    if (!payload.userId || !payload.carName || !payload.startDate || !payload.endDate) {
      return res.status(400).json({ message: 'Booking user, car, and dates are required.' });
    }

    const booking = await Booking.create(payload);
    return res.status(201).json(sanitizeDocument(booking));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create booking.' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const payload = normalizeBookingPayload(req.body || {});
    const updates = {};

    Object.keys(req.body || {}).forEach((key) => {
      if (key in payload) {
        updates[key] = payload[key];
      }
    });

    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    return res.json(sanitizeDocument(booking));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update booking.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    return res.json(sanitizeDocument(booking));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete booking.' });
  }
});

module.exports = router;