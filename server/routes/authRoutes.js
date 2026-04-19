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

const createAuthToken = (userId) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'car-rental-dev-secret';
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

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
router.post('/signup', async (req, res) => {
  try {
    const firstName = String(req.body?.firstName || '').trim();
    const middleName = String(req.body?.middleName || '').trim();
    const lastName = String(req.body?.lastName || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const username = String(req.body?.username || '').trim().toLowerCase();
    const phone = String(req.body?.phone || '').trim();
    const password = String(req.body?.password || '');
    const name =
      String(req.body?.name || '').trim() ||
      [firstName, middleName, lastName].filter(Boolean).join(' ');

    if (!name || !email || !username || !phone || !password) {
      return res.status(400).json({ message: 'Please complete all required signup fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser?.email === email) {
      return res.status(409).json({ message: 'Email address is already registered.' });
    }

    if (existingUser?.username === username) {
      return res.status(409).json({ message: 'Username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      firstName,
      middleName,
      lastName,
      email,
      username,
      phone,
      password: hashedPassword,
      role: 'user',
      address: String(req.body?.address || '').trim(),
    });

    const token = createAuthToken(user._id.toString());
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.status(201).json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const identifier = String(req.body?.identifier || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/username and password are required.' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/username or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email/username or password.' });
    }

    const token = createAuthToken(user._id.toString());
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login.' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });
  res.json({ success: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

router.post('/forgot-password', (_req, res) => {
  res.json({ message: 'Password reset is not configured in this local environment yet.' });
});

module.exports = router;