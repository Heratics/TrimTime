const express = require('express');
const router = express.Router();
const { requireAuth, requireOwner, requireBarber } = require('../middleware/roles');
const {
  createAppointment,
  cancelAppointment,
  getAppointmentsForShop,
  getAppointmentsForBarber,
  updateAppointmentStatus
} = require('../controllers/appointmentsController');

// POST /api/appointments — create booking (public)
router.post('/', createAppointment);

// POST /api/appointments/cancel — public customer cancellation (no auth)
router.post('/cancel', cancelAppointment);

// Owner: GET /api/appointments/shop
router.get('/shop', requireAuth, requireOwner, getAppointmentsForShop);

// Barber: GET /api/appointments/barber
router.get('/barber', requireAuth, requireBarber, getAppointmentsForBarber);

// Update status (staff only)
router.put('/:id/status', requireAuth, updateAppointmentStatus);

module.exports = router;