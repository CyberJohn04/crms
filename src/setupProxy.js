const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const DB_PATH = path.join(__dirname, '../public/db.json');
const COLLECTIONS = ['users', 'vehicles', 'bookings', 'payments', 'returns', 'userApplications'];

const readDb = () => {
  if (!fs.existsSync(DB_PATH)) {
    return COLLECTIONS.reduce((db, key) => ({ ...db, [key]: [] }), {});
  }

  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  COLLECTIONS.forEach((key) => {
    if (!Array.isArray(db[key])) {
      db[key] = [];
    }
  });
  return db;
};

const writeDb = (db) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

const JWT_SECRET = process.env.JWT_SECRET || 'car-rental-dev-secret';

const getAuthTokenFromCookies = (cookieHeader = '') => {
  const match = cookieHeader.match(/(?:^|;\s*)authToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const findAuthUser = (req, db) => {
  const authHeader = req.headers.authorization || '';
  const cookieToken = getAuthTokenFromCookies(req.headers.cookie || '');

  if (cookieToken) {
    try {
      const payload = jwt.verify(cookieToken, JWT_SECRET);
      return { id: payload.userId };
    } catch (error) {
      return null;
    }
  }

  const match = authHeader.match(/^Bearer mock-jwt-token-(\d+)-/);
  const userId = match ? Number(match[1]) : null;
  if (!userId) {
    return null;
  }

  return db.users.find((user) => Number(user.id) === userId) || null;
};

const nextId = (items) => {
  const maxId = items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
  return maxId + 1;
};

module.exports = function setupProxy(app) {
  app.use(
    [
      '/api/auth',
      '/api/users/profile',
      '/api/users/change-password',
      '/api/vehicles',
      '/api/bookings',
      '/api/payments',
      '/api/returns',
      '/api/userApplications',
      '/api/dashboard',
    ],
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      cookieDomainRewrite: '',
      pathRewrite: (_path, req) => req.originalUrl,
    })
  );

  app.use('/api', express.json({ limit: '10mb' }));

  app.use('/api', (req, res) => {
    const db = readDb();
    const { method, path: routePath } = req;

    if (routePath === '/bookings/my-bookings' && method === 'GET') {
      const authUser = findAuthUser(req, db);
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      return res.json(db.bookings.filter((booking) => String(booking.userId) === String(authUser.id)));
    }

    if (routePath === '/returns/my-returns' && method === 'GET') {
      const authUser = findAuthUser(req, db);
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      return res.json(db.returns.filter((item) => String(item.userId) === String(authUser.id)));
    }

    if (routePath === '/payments/my-payments' && method === 'GET') {
      const authUser = findAuthUser(req, db);
      if (!authUser) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      return res.json(db.payments.filter((item) => String(item.userId) === String(authUser.id)));
    }

    if (routePath === '/dashboard/stats' && method === 'GET') {
      return res.json({
        totalVehicles: db.vehicles.length,
        activeVehicles: db.vehicles.filter((vehicle) => vehicle.status === 'active').length,
        totalBookings: db.bookings.length,
        totalPayments: db.payments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
      });
    }

    const segments = routePath.split('/').filter(Boolean);
    const collection = segments[0];
    const id = segments[1];

    if (!COLLECTIONS.includes(collection)) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (method === 'GET' && !id) {
      return res.json(db[collection]);
    }

    if (method === 'GET' && id) {
      const item = db[collection].find((entry) => String(entry.id) === String(id));
      if (!item) {
        return res.status(404).json({ message: 'Record not found' });
      }
      return res.json(item);
    }

    if (method === 'POST') {
      const newItem = {
        ...req.body,
        id: nextId(db[collection]),
        createdAt: req.body?.createdAt || new Date().toISOString(),
      };

      db[collection].push(newItem);
      writeDb(db);
      return res.status(201).json(newItem);
    }

    if (method === 'PUT' || method === 'PATCH') {
      const index = db[collection].findIndex((entry) => String(entry.id) === String(id));
      if (index === -1) {
        return res.status(404).json({ message: 'Record not found' });
      }

      db[collection][index] =
        method === 'PUT'
          ? { ...req.body, id: db[collection][index].id, updatedAt: new Date().toISOString() }
          : { ...db[collection][index], ...req.body, id: db[collection][index].id, updatedAt: new Date().toISOString() };

      writeDb(db);
      return res.json(db[collection][index]);
    }

    if (method === 'DELETE') {
      const index = db[collection].findIndex((entry) => String(entry.id) === String(id));
      if (index === -1) {
        return res.status(404).json({ message: 'Record not found' });
      }

      const [deletedItem] = db[collection].splice(index, 1);
      writeDb(db);
      return res.json(deletedItem);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  });
};
