const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper functions
const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  firstName: user.firstName || '',
  middleName: user.middleName || '',
  lastName: user.lastName || '',
  username: user.username,
  email: user.email,
  role: user.role || 'user',
  phone: user.phone || '',
  address: user.address || '',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
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
router.get('/profile', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const updates = {
      name: String(req.body?.name || req.user.name).trim(),
      email: String(req.body?.email || req.user.email).trim().toLowerCase(),
      phone: String(req.body?.phone || req.user.phone || '').trim(),
      address: String(req.body?.address || req.user.address || '').trim(),
    };

    const duplicateEmailOwner = await User.findOne({
      email: updates.email,
      _id: { $ne: req.user._id },
    });

    if (duplicateEmailOwner) {
      return res.status(409).json({ message: 'Email address is already registered.' });
    }

    req.user.name = updates.name;
    req.user.email = updates.email;
    req.user.phone = updates.phone;
    req.user.address = updates.address;
    await req.user.save();

    return res.json({ user: sanitizeUser(req.user) });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
});

router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const currentPassword = String(req.body?.currentPassword || '');
    const newPassword = String(req.body?.newPassword || '');

    const passwordMatches = await bcrypt.compare(currentPassword, req.user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();

    return res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update password.' });
  }
});

module.exports = router;