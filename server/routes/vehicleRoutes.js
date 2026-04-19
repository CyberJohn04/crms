const express = require('express');
const Vehicle = require('../models/Vehicle');

const router = express.Router();

// Helper functions
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

// Routes
router.get('/', async (_req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    return res.json(vehicles.map(sanitizeVehicle));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load vehicles.' });
  }
});

router.get('/:id', async (req, res) => {
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

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
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

router.patch('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
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

module.exports = router;