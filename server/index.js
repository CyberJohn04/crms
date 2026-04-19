const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Return = require('../models/Return');
const UserApplication = require('../models/UserApplication');

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'car-rental';
const JWT_SECRET = process.env.JWT_SECRET || 'car-rental-dev-secret';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const VERCEL_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const DB_JSON_PATH = path.join(__dirname, '../public/db.json');

// Configure CORS to allow both local development and production Vercel URL
const allowedOrigins = [CLIENT_ORIGIN];
if (VERCEL_URL && !allowedOrigins.includes(VERCEL_URL)) {
  allowedOrigins.push(VERCEL_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '25mb' }));
app.use(cookieParser());

const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

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

const sanitizeVehicle = (vehicle) => ({
  id: vehicle._id.toString(),
  name: vehicle.name,
  category: vehicle.category,
  price: vehicle.price,
  status: vehicle.status || 'active',
  image: vehicle.image || '',
  brand: vehicle.brand || '',
  model: vehicle.model || '',
  year: vehicle.year,
  transmission: vehicle.transmission || 'Automatic',
  fuelType: vehicle.fuelType || 'Gasoline',
  seats: vehicle.seats || 5,
  color: vehicle.color || '',
  plateNumber: vehicle.plateNumber || '',
  licenseRequired: vehicle.licenseRequired || 'Standard',
  description: vehicle.description || '',
  features: Array.isArray(vehicle.features) ? vehicle.features : [],
  availability: vehicle.availability !== false,
  location: vehicle.location || '',
  deposit: vehicle.deposit || 0,
  insuranceIncluded: Boolean(vehicle.insuranceIncluded),
  createdAt: vehicle.createdAt,
  updatedAt: vehicle.updatedAt,
});

const sanitizeDocument = (doc) => {
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, __v, ...rest } = plain;
  return {
    ...rest,
    id: _id.toString(),
  };
};

const normalizeVehiclePayload = (body = {}) => ({
  name: String(body.name || '').trim(),
  category: String(body.category || '').trim(),
  price: Number(body.price) || 0,
  status: String(body.status || 'active').trim().toLowerCase() === 'inactive' ? 'inactive' : 'active',
  image: String(body.image || ''),
  brand: String(body.brand || '').trim(),
  model: String(body.model || '').trim(),
  year: Number(body.year) || new Date().getFullYear(),
  transmission: String(body.transmission || 'Automatic').trim(),
  fuelType: String(body.fuelType || 'Gasoline').trim(),
  seats: Math.max(1, Number(body.seats) || 5),
  color: String(body.color || '').trim(),
  plateNumber: String(body.plateNumber || '').trim(),
  licenseRequired: String(body.licenseRequired || 'Standard').trim(),
  description: String(body.description || '').trim(),
  features: Array.isArray(body.features)
    ? body.features.map((feature) => String(feature || '').trim()).filter(Boolean)
    : [],
  availability: body.availability !== undefined ? Boolean(body.availability) : true,
  location: String(body.location || '').trim(),
  deposit: Math.max(0, Number(body.deposit) || 0),
  insuranceIncluded: Boolean(body.insuranceIncluded),
});

const loadDbSeeds = () => {
  try {
    if (!fs.existsSync(DB_JSON_PATH)) {
      return {};
    }

    const raw = fs.readFileSync(DB_JSON_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Unable to read seed data from public/db.json:', error.message);
    return {};
  }
};

const loadSeedCollection = (key) => {
  const db = loadDbSeeds();
  return Array.isArray(db?.[key]) ? db[key] : [];
};

const seedVehiclesIfEmpty = async () => {
  const existingVehicleCount = await Vehicle.countDocuments();
  if (existingVehicleCount > 0) {
    return;
  }

  const vehicleSeeds = loadSeedCollection('vehicles')
    .map((vehicle) => normalizeVehiclePayload(vehicle))
    .filter((vehicle) => vehicle.name && vehicle.category);

  if (vehicleSeeds.length === 0) {
    console.log('No vehicle seed data found. MongoDB vehicles collection will be created on first insert.');
    return;
  }

  await Vehicle.insertMany(vehicleSeeds, { ordered: true });
  console.log(`Seeded ${vehicleSeeds.length} vehicles into MongoDB.`);
};

const seedCollectionIfEmpty = async ({ model, key, mapItem, logLabel }) => {
  const existingCount = await model.countDocuments();
  if (existingCount > 0) {
    return;
  }

  const seeds = loadSeedCollection(key)
    .map((item) => (typeof mapItem === 'function' ? mapItem(item) : item))
    .filter(Boolean);

  if (seeds.length === 0) {
    console.log(`No ${logLabel} seed data found. MongoDB collection will be created on first insert.`);
    return;
  }

  await model.insertMany(seeds, { ordered: true });
  console.log(`Seeded ${seeds.length} ${logLabel} into MongoDB.`);
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

const normalizeUserApplicationPayload = (body = {}) => ({
  userId: String(body.userId || '').trim(),
  fullName: String(body.fullName || '').trim(),
  email: String(body.email || '').trim().toLowerCase(),
  phone: String(body.phone || '').trim(),
  address: String(body.address || '').trim(),
  status: String(body.status || 'pending').trim().toLowerCase(),
  remarks: String(body.remarks || '').trim(),
  submittedAt: String(body.submittedAt || '').trim(),
  nationalId: String(body.nationalId || '').trim(),
  driverLicenseId: String(body.driverLicenseId || '').trim(),
  nationalIdImage: String(body.nationalIdImage || ''),
  nationalIdFileName: String(body.nationalIdFileName || '').trim(),
  driverLicenseImage: String(body.driverLicenseImage || ''),
  driverLicenseFileName: String(body.driverLicenseFileName || '').trim(),
  createdAt: body.createdAt,
  updatedAt: body.updatedAt,
});

const createAuthToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '7d',
  });

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

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

app.get('/api/health', async (_req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const [vehicleCount, bookingCount, paymentCount, returnCount, applicationCount] = isConnected
    ? await Promise.all([
        Vehicle.countDocuments(),
        Booking.countDocuments(),
        Payment.countDocuments(),
        Return.countDocuments(),
        UserApplication.countDocuments(),
      ])
    : [0, 0, 0, 0, 0];

  res.json({
    ok: true,
    db: isConnected ? 'connected' : 'disconnected',
    dbName: mongoose.connection.name || MONGODB_DB_NAME,
    vehicleCount,
    bookingCount,
    paymentCount,
    returnCount,
    applicationCount,
  });
});

app.post('/api/auth/signup', async (req, res) => {
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
    res.cookie('authToken', token, authCookieOptions);

    return res.status(201).json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
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
    res.cookie('authToken', token, authCookieOptions);

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login.' });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('authToken', authCookieOptions);
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

app.post('/api/auth/forgot-password', (_req, res) => {
  res.json({ message: 'Password reset is not configured in this local environment yet.' });
});

app.get('/api/users/profile', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

app.put('/api/users/profile', requireAuth, async (req, res) => {
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

app.post('/api/users/change-password', requireAuth, async (req, res) => {
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

app.get('/api/vehicles', async (_req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    return res.json(vehicles.map(sanitizeVehicle));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load vehicles.' });
  }
});

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }
    return res.json(sanitizeVehicle(vehicle));
  } catch (error) {
    return res.status(404).json({ message: 'Vehicle not found.' });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    const payload = normalizeVehiclePayload(req.body);
    if (!payload.name || !payload.category) {
      return res.status(400).json({ message: 'Vehicle name and category are required.' });
    }

    const vehicle = await Vehicle.create(payload);
    return res.status(201).json(sanitizeVehicle(vehicle));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create vehicle.' });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    const payload = normalizeVehiclePayload(req.body);
    if (!payload.name || !payload.category) {
      return res.status(400).json({ message: 'Vehicle name and category are required.' });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    return res.json(sanitizeVehicle(vehicle));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update vehicle.' });
  }
});

app.patch('/api/vehicles/:id', async (req, res) => {
  try {
    const payload = normalizeVehiclePayload({ ...(req.body || {}) });
    const allowedUpdates = {};

    Object.keys(req.body || {}).forEach((key) => {
      if (key in payload) {
        allowedUpdates[key] = payload[key];
      }
    });

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }

    return res.json(sanitizeVehicle(vehicle));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update vehicle.' });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }
    return res.json(sanitizeVehicle(vehicle));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete vehicle.' });
  }
});

app.get('/api/bookings/my-bookings', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.json(bookings.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load your bookings.' });
  }
});

app.get('/api/bookings', async (_req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.json(bookings.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load bookings.' });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
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

app.post('/api/bookings', async (req, res) => {
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

app.patch('/api/bookings/:id', async (req, res) => {
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

app.delete('/api/bookings/:id', async (req, res) => {
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

app.get('/api/payments/my-payments', requireAuth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.json(payments.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load your payments.' });
  }
});

app.get('/api/payments', async (_req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    return res.json(payments.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load payments.' });
  }
});

app.post('/api/payments', async (req, res) => {
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

app.patch('/api/payments/:id', async (req, res) => {
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

app.delete('/api/payments/:id', async (req, res) => {
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

app.get('/api/returns/my-returns', requireAuth, async (req, res) => {
  try {
    const returns = await Return.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.json(returns.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load your returns.' });
  }
});

app.get('/api/returns', async (_req, res) => {
  try {
    const returns = await Return.find().sort({ createdAt: -1 });
    return res.json(returns.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load returns.' });
  }
});

app.post('/api/returns', async (req, res) => {
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

app.patch('/api/returns/:id', async (req, res) => {
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

app.delete('/api/returns/:id', async (req, res) => {
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

app.get('/api/userApplications', async (_req, res) => {
  try {
    const applications = await UserApplication.find().sort({ createdAt: -1 });
    return res.json(applications.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load applications.' });
  }
});

app.post('/api/userApplications', async (req, res) => {
  try {
    const payload = normalizeUserApplicationPayload(req.body);
    if (!payload.userId || !payload.fullName || !payload.email) {
      return res.status(400).json({ message: 'Application user, name, and email are required.' });
    }

    const application = await UserApplication.create(payload);
    return res.status(201).json(sanitizeDocument(application));
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'An application for this user already exists.' });
    }
    return res.status(500).json({ message: 'Failed to create application.' });
  }
});

app.put('/api/userApplications/:id', async (req, res) => {
  try {
    const payload = normalizeUserApplicationPayload(req.body);
    if (!payload.userId || !payload.fullName || !payload.email) {
      return res.status(400).json({ message: 'Application user, name, and email are required.' });
    }

    const application = await UserApplication.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    return res.json(sanitizeDocument(application));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update application.' });
  }
});

app.patch('/api/userApplications/:id', async (req, res) => {
  try {
    const payload = normalizeUserApplicationPayload(req.body || {});
    const updates = {};

    Object.keys(req.body || {}).forEach((key) => {
      if (key in payload) {
        updates[key] = payload[key];
      }
    });

    const application = await UserApplication.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    return res.json(sanitizeDocument(application));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update application.' });
  }
});

app.delete('/api/userApplications/:id', async (req, res) => {
  try {
    const application = await UserApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    return res.json(sanitizeDocument(application));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete application.' });
  }
});

app.get('/api/dashboard/stats', async (_req, res) => {
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

const startServer = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add it to your .env file.');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log('✓ MongoDB Atlas connected successfully');
    console.log(`✓ Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    throw error;
  }

  await seedVehiclesIfEmpty();
  await seedCollectionIfEmpty({
    model: Booking,
    key: 'bookings',
    mapItem: normalizeBookingPayload,
    logLabel: 'bookings',
  });
  await seedCollectionIfEmpty({
    model: Payment,
    key: 'payments',
    mapItem: normalizePaymentPayload,
    logLabel: 'payments',
  });
  await seedCollectionIfEmpty({
    model: Return,
    key: 'returns',
    mapItem: normalizeReturnPayload,
    logLabel: 'returns',
  });
  await seedCollectionIfEmpty({
    model: UserApplication,
    key: 'userApplications',
    mapItem: normalizeUserApplicationPayload,
    logLabel: 'customer applications',
  });

  app.listen(PORT, () => {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? (VERCEL_URL || `localhost:${PORT}`)
      : `localhost:${PORT}`;
    console.log(`✓ Server listening on http://${baseUrl}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start auth server:', error);
  process.exit(1);
});
