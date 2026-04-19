const express = require('express');
const UserApplication = require('../models/UserApplication');

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

// Routes
router.get('/', async (_req, res) => {
  try {
    const applications = await UserApplication.find().sort({ createdAt: -1 });
    return res.json(applications.map(sanitizeDocument));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load applications.' });
  }
});

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
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

router.patch('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
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

module.exports = router;