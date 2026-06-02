const express = require('express');
const router = express.Router();
const { requireAuth, requireOwner, requireBarber } = require('../middleware/roles');
const {
  createAppointment,
  getAppointmentsForShop,
  getAppointmentsForBarber,
  updateAppointmentStatus
} = require('../controllers/appointmentsController');

// POST /api/appointments - create booking (public)
router.post('/', createAppointment);

// Owner: GET /api/appointments/shop
router.get('/shop', requireAuth, requireOwner, getAppointmentsForShop);

// Barber: GET /api/appointments/barber
router.get('/barber', requireAuth, requireBarber, getAppointmentsForBarber);

// Update status
router.put('/:id/status', requireAuth, updateAppointmentStatus);

module.exports = router;
