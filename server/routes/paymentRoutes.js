const express = require('express');
const jwt = require('jsonwebtoken');
const Payment = require('../models/Payment');
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

const normalizePaymentPayload = (body = {}) => ({
  bookingId: String(body.bookingId || '').trim(),
  userId: String(body.userId || '').trim(),
  userName: String(body.userName || '').trim(),
  carName: String(body.carName || '').trim(),
  receiptNumber: String(body.receiptNumber || '').trim(),
  amount: Math.max(0, Number(body.amount) || 0),
  method: String(body.method || 'cash').trim(),
  status: String(body.status || 'Completed').trim(),
  paidAt: String(body.paidAt || '').trim(),
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
router.get('/my-payments', requireAuth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.json(payments.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load your payments.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    return res.json(payments.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load payments.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = normalizePaymentPayload(req.body);
    if (!payload.bookingId || !payload.userId) {
      return res.status(400).json({ message: 'Payment booking and user are required.' });
    }

    const payment = await Payment.create(payload);
    return res.status(201).json(sanitizeDocument(payment));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create payment.' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const payload = normalizePaymentPayload(req.body || {});
    const updates = {};

    Object.keys(req.body || {}).forEach((key) => {
      if (key in payload) {
        updates[key] = payload[key];
      }
    });

    const payment = await Payment.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    return res.json(sanitizeDocument(payment));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update payment.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }
    return res.json(sanitizeDocument(payment));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete payment.' });
  }
});

module.exports = router;