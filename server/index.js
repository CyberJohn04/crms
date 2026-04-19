const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const returnRoutes = require('./routes/returnRoutes');
const userApplicationRoutes = require('./routes/userApplicationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import models for seeding
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const Return = require('./models/Return');
const UserApplication = require('./models/UserApplication');

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'car-rental';
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

// Health check endpoint
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

// Mount route modules under /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/userApplications', userApplicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Seeding functions
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
  console.error('Failed to start server:', error);
  process.exit(1);
});
