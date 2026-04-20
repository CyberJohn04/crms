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

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'car-rental';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const VERCEL_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : null;

const DB_JSON_PATH = path.join(__dirname, '../public/db.json');

// ✅ CORS CONFIG
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

// ✅ HEALTH CHECK
app.get('/api/health', async (_req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  const [
    vehicleCount,
    bookingCount,
    paymentCount,
    returnCount,
    applicationCount,
  ] = isConnected
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

// ✅ ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/userApplications', userApplicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// =========================
// ✅ SEEDING FUNCTIONS
// =========================

const loadDbSeeds = () => {
  try {
    if (!fs.existsSync(DB_JSON_PATH)) return {};
    const raw = fs.readFileSync(DB_JSON_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Seed read error:', error.message);
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
  status:
    String(body.status || 'active').toLowerCase() === 'inactive'
      ? 'inactive'
      : 'active',
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
    ? body.features.map((f) => String(f).trim()).filter(Boolean)
    : [],
  availability:
    body.availability !== undefined ? Boolean(body.availability) : true,
  location: String(body.location || '').trim(),
  deposit: Math.max(0, Number(body.deposit) || 0),
  insuranceIncluded: Boolean(body.insuranceIncluded),
});

const seedVehiclesIfEmpty = async () => {
  const count = await Vehicle.countDocuments();
  if (count > 0) return;

  const seeds = loadSeedCollection('vehicles')
    .map(normalizeVehiclePayload)
    .filter((v) => v.name && v.category);

  if (!seeds.length) return;

  await Vehicle.insertMany(seeds);
  console.log(`Seeded ${seeds.length} vehicles`);
};

// =========================
// ✅ DB CONNECTION (Vercel Safe)
// =========================

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: MONGODB_DB_NAME,
        bufferCommands: false,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;

  // run seed once
  await seedVehiclesIfEmpty();

  return cached.conn;
};

// =========================
// ✅ EXPORT FOR VERCEL
// =========================

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};