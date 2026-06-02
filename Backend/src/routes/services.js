const express = require('express');
const { requireAuth, requireOwner } = require('../middleware/roles');
const {
  createService,
  getServices,
  getService,
  updateService,
  deleteService
} = require('../controllers/servicesController');

const router = express.Router();

// All service routes require owner role
router.use(requireAuth, requireOwner);

// POST /api/services - Create a new service
router.post('/', createService);

// GET /api/services - Get all services for owner's shop
router.get('/', getServices);

// GET /api/services/:id - Get a specific service
router.get('/:id', getService);

// PUT /api/services/:id - Update a service
router.put('/:id', updateService);

// DELETE /api/services/:id - Delete a service
router.delete('/:id', deleteService);

module.exports = router;
