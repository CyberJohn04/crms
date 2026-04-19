const express = require('express');
const jwt = require('jsonwebtoken');
const Return = require('../models/Return');
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

const normalizeReturnPayload = (body = {}) => ({
  bookingId: String(body.bookingId || '').trim(),
  userId: String(body.userId || '').trim(),
  carName: String(body.carName || '').trim(),
  carImage: String(body.carImage || ''),
  returnDate: String(body.returnDate || '').trim(),
  rating: Math.max(0, Number(body.rating) || 0),
  userRemarks: String(body.userRemarks || '').trim(),
  hasDamage: Boolean(body.hasDamage),
  damageDescription: String(body.damageDescription || '').trim(),
  paymentStatus: String(body.paymentStatus || 'paid').trim(),
  totalAmount: Math.max(0, Number(body.totalAmount) || 0),
  status: String(body.status || 'Pending').trim(),
  adminRemarks: String(body.adminRemarks || '').trim(),
  returnPhoto: String(body.returnPhoto || ''),
  returnPhotoName: String(body.returnPhotoName || '').trim(),
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
router.get('/my-returns', requireAuth, async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.json(returns.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load your returns.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const returns = await Return.find().sort({ createdAt: -1 });
    return res.json(returns.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load returns.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = normalizeReturnPayload(req.body);
    if (!payload.bookingId || !payload.userId || !payload.carName) {
      return res.status(400).json({ message: 'Return booking, user, and car are required.' });
    }

    const returnItem = await Return.create(payload);
    return res.status(201).json(sanitizeDocument(returnItem));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create return.' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const payload = normalizeReturnPayload(req.body || {});
    const updates = {};

    Object.keys(req.body || {}).forEach((key) => {
      if (key in payload) {
        updates[key] = payload[key];
      }
    });

    const returnItem = await Return.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!returnItem) {
      return res.status(404).json({ message: 'Return not found.' });
    }

    return res.json(sanitizeDocument(returnItem));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update return.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const returnItem = await Return.findByIdAndDelete(req.params.id);
    if (!returnItem) {
      return res.status(404).json({ message: 'Return not found.' });
    }
    return res.json(sanitizeDocument(returnItem));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete return.' });
  }
});

module.exports = router;