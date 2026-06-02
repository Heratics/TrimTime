const express = require('express');
const router = express.Router();
const { getAvailability } = require('../controllers/availabilityController');

// Public endpoint to get available slots
// Example: /api/availability?barber_id=5&service_id=2&date=2026-06-15
router.get('/', getAvailability);

module.exports = router;
