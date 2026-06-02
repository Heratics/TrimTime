const express = require('express');
const router = express.Router();

const health = require('../controllers/healthController');
const authRoutes = require('./auth');
const shopRoutes = require('./shops');
const barberRoutes = require('./barbers');
const shopHoursRoutes = require('./shopHours');
const servicesRoutes = require('./services');
const availabilityRoutes = require('./availability');
const appointmentsRoutes = require('./appointments');
const ownerRoutes = require('./owner');

router.get('/health', health.getHealth);
router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/barbers', barberRoutes);
router.use('/shop-hours', shopHoursRoutes);
router.use('/services', servicesRoutes);
router.use('/availability', availabilityRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/owner', ownerRoutes);

module.exports = router;
